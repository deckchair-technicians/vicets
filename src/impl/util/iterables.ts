export function first<T>(coll: Iterable<T>): T | undefined {
  // noinspection LoopStatementThatDoesntLoopJS
  for (const v of coll) {
    return v;
  }
}