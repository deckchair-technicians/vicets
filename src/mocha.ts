import {
  conform,
  isError,
  MissingItemBehaviour,
  Pattern,
  patternItemToSchema,
  Schema,
  UnexpectedItemBehaviour,
  ValidationError
} from "./impl";

export type LikeOpts = {
  message: string,
  unexpected: UnexpectedItemBehaviour,
  missing: MissingItemBehaviour
}

export type Likeable = Array<any> | object;

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
export function like<T extends Likeable>(
  actual: any,
  expected: Pattern<T> | Schema<any, T>,
  {
    message = undefined,
    unexpected = UnexpectedItemBehaviour.IGNORE,
    missing = MissingItemBehaviour.PROBLEM
  }: Partial<LikeOpts> = {}
): T {

  const schema: Schema = patternItemToSchema(expected as any, unexpected, missing);

  const result = conform(schema, actual);

  if (isError(result)) {
    throw new ValidationError(
      actual,
      result,
      {leakActualValuesInError: true});
  }

  return result as T;
}