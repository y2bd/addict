import * as r from "request-promise-native";
import PromiseCursor from "../cursor";

const LIMIT = 20;

export type Sort = "hot" | "new";

export interface ListArgs {
  readonly subreddit: string;
  readonly sort: Sort;

  readonly after?: string;
  readonly count?: number;
}

export interface ListResponse {
  readonly data: ListResponseData;
}

export interface ListResponseData {
  readonly after: string;
  readonly dist: number;
  readonly children: Listing[];
}

export interface Listing {
  readonly data: ListingData;
}

export interface ListingData {
  readonly author_fullname: string;
  readonly created_utc: number;
  readonly domain: string;
  readonly id: string;
  readonly is_self: boolean;
  readonly name: string;
  readonly num_comments: number;
  readonly permalink: string;
  readonly pinned: boolean;
  readonly score: number;
  readonly selftext: string;
  readonly selftext_html: string;
  readonly suggested_sort: string;
  readonly title: string;
  readonly url: string;
}

export type ListingCursor = PromiseCursor<ListingData>;

export async function list(args: ListArgs): Promise<ListingCursor> {
  const listResponse = await listRaw(args);

  return {
    after: listResponse.data.after,
    data: listResponse.data.children.map(child => child.data),
    next: () =>
      list({
        ...args,
        after: listResponse.data.after,
        count: (args.count || 0) + listResponse.data.dist
      }),
  };
}

export async function listRaw(args: ListArgs): Promise<ListResponse> {
  const uri = listUri(args);
  const listResponseStr = await r.get(uri, {
    headers: {
      "User-Agent": "addict/pc /u/y2bd v0.1"
    }
  });

  return JSON.parse(listResponseStr);
}

function listUri({ subreddit, sort, after, count }: ListArgs) {
  const base = `https://www` + `.reddit.com/r/${subreddit}/${sort}.json`;
  const args = uriArgBuilder(
    ["limit", LIMIT],
    ifv("after", after),
    ifv("count", count)
  );

  return `${base}${args}`;
}

export function uriArgBuilder(
  ...kwargs: Array<[string, string | number] | undefined>
) {
  return (kwargs as Array<[string, string]>) // cast since filter-undefined doesn't type-guard
    .filter(val => val) // remove undefined args
    .reduce((acc, [key, value]) => `${acc}${key}=${value}&`, "?")
    .slice(0, -1);
}

export function ifv<T>(
  key: string,
  value: T | undefined
): [string, T] | undefined {
  return value ? [key, value] : undefined;
}
