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
 * Conforms actual to the schema, or to the expected pattern using object();
 *
 * Returns the conformed value if successful.
 *
 * Otherwise throws an assertion Error, with actual, expected and showDiff, compatible with AssertionError, as used by
 * mocha, WebStorm, etc.
 *
 * The 'expected' field on the error will produce a usable diff with the actual value. See documentation on
 * intertwingle() for the shape of 'expected' on the error.
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