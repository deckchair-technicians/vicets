import {empty, wrapAssociative} from "./impl/associative/wrap";
import {isPrimitive} from "./impl/util/types";
import {Path, Problems, ValidationError, ValidationResult} from "./problems";
import {Schema} from "./schema";

export function validate<IN, OUT>(schema: Schema<IN, OUT>, value: IN): OUT {
  const conformed = conform(schema, value);
  if (conformed instanceof Problems) {
    throw new ValidationError(value, conformed);
  }
  return conformed;
}

export function conform<IN, OUT>(schema: Schema<IN, OUT>, value: IN): ValidationResult<OUT> {
  if (!schema)
    throw new Error("No schema provided");

  return schema.conform(value);
}

export function pathsEq(a: Path, b: Path) {
  return a.length === b.length
    && a.every((v, i) => v === b[i]);
}

export function pathStartsWith(path: Path, startsWith: Path) {
  return path.length >= startsWith.length
    && startsWith.every((v, i) => v === path[i]);
}

function intertwingledValue<T>(actual: any, problems: Problems, path: Path): any {
  if (isPrimitive(actual))
    return actual;

  // Arrays or objects
  const associative = wrapAssociative(actual);

  const keys = new Set(associative.keys());

  const missingKeys = problems.problems
    .filter(p =>
      // problems for direct children of path (but not ancestors)
      p.path.length === path.length + 1
      && pathStartsWith(p.path, path)

      // ...that are not in actual
      && !keys.has(p.path[-1]))
    .map(p => p.path[p.path.length - 1]);

  return [...keys, ...missingKeys]
    .reduce((result, k) => {
      result[k] = intertwingle(actual[k], problems, [...path, k]);
      return result;
    }, empty(actual));
}

/**
 * Returns an object in the same shape as actual, but with invalid values replaced with an error report.
 *
 * e.g.
 *
 * const actual = {right: 'right', wrong:'wrong'};
 * const problems = [{path: ['wrong'], message: 'error message'};
 * intertwingle(actual, problems);
 *
 * will return
 *
 * {right: 'right', wrong: {value: 'wrong', errors: ['error message']}}
 */
export function intertwingle(actual: any, problems: Problems, path: Path = []): any {
  const myProblems = problems.problems
    .filter(p => pathsEq(path, p.path))
    .map(p => p.message);

  const intertwingled = intertwingledValue(actual, problems, path);

  return myProblems.length === 0
    ? intertwingled
    : myProblems.length === 1
      ? myProblems[0]
      : myProblems;
}