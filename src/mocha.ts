import {conform, intertwingle} from "./helpers";
import {isSchema} from "./impl";
import {Pattern} from "./impl/associative/associative";
import {isError} from "./problems";
import {Schema} from "./schema";
import {object} from "./schemas";
import {MissingItemBehaviour, UnexpectedItemBehaviour} from "./unexpected_items";

export type LikeOpts = {
  message: string,
  unexpected: UnexpectedItemBehaviour,
  missing: MissingItemBehaviour
}

/**
 * Compares actual to the expected pattern using object()
 *
 * If they match, returns the conformed version, otherwise throws an assertion Error,
 * compatible with mocha, with actual and expected.
 */
export function like<T extends object>(
  actual: any,
  expected: Pattern<T> | Schema<any, T> | {},
  {
    message = undefined,
    unexpected = UnexpectedItemBehaviour.IGNORE,
    missing = MissingItemBehaviour.PROBLEM
  }: Partial<LikeOpts> = {}
): T {

  const schema: Schema = isSchema(expected)
    ? expected
    : object(expected as any, unexpected, missing);

  const result = conform(schema, actual);

  if (isError(result)) {
    throw Object.assign(
      new Error(`${message ? `${message}\r\n` : ''}${result}\r\n`),
      {
        actual: actual,
        expected: intertwingle(actual, result, []),
        showDiff: true
      });
  }

  return result as T;
}