import {
  Behaviour,
  conform,
  isError,
  MissingItemBehaviour,
  Pattern,
  patternItemToSchema,
  Schema,
  UnexpectedItemBehaviour,
  usingBehaviour,
  ValidationError, ValidationOpts
} from "./impl";

export type Likeable = Array<any> | object;
const DEFAULT_BEHAVIOUR: Behaviour = {
  missing: MissingItemBehaviour.PROBLEM,
  unexpected: UnexpectedItemBehaviour.IGNORE,
  leakActualValuesInError: true,
};

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
  opts: Partial<ValidationOpts> = {}
): T {
  const behaviour = Object.assign({}, DEFAULT_BEHAVIOUR, opts);
  const schema: Schema = patternItemToSchema(expected as any);

  const result = usingBehaviour(
    behaviour,
    () => conform(schema, actual));

  if (isError(result)) {
    throw new ValidationError(
      actual,
      result,
      {
        leakActualValuesInError: behaviour.leakActualValuesInError,
        message: opts.message
      });
  }

  return result as T;
}