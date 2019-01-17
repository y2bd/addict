export default interface PromiseCursor<T> {
  readonly data: T[];
  readonly next: PromiseCursorProvider<T>;
  readonly after: string;
}

export type PromiseCursorProvider<T> = () => Promise<PromiseCursor<T>>;
