import * as r from "request-promise-native";
import { ListArgs, ListingCursor, ListResponse } from "../reddit/listing";
import { server } from "../secret";

export async function list(args: ListArgs): Promise<ListingCursor> {
  const uri = listUri(args);
  const listResponseStr = await r.get(uri);

  const listResponse = JSON.parse(listResponseStr) as ListResponse;

  return {
    after: listResponse.data.after,
    data: listResponse.data.children.map(child => child.data),
    next: () =>
      list({
        ...args,
        after: listResponse.data.after
      })
  };
}

function listUri({ subreddit, sort, after }: ListArgs) {
  let url = `${server}/${subreddit}/${sort}`;
  if (after) {
    url = `${url}/${after}`;
  }

  return url;
}
