import {empty, Path, Problems, ValidationErrorOpts, wrapAssociative} from "./impl";
import {isPrimitive} from "./impl/util/types";

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
 *
 * This is suitable for a structural diff with the actual value, where only
 * problem fields will be mismatches
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

export class ValidationError extends Error {
  public readonly actual?: any;
  public readonly expected?: any;

  constructor(actual: any,
              public readonly problems: Problems,
              {
                message = 'Validation failed',
                leakActualValuesInError = false,
              }: Partial<ValidationErrorOpts> = {}
  ) {
    super(`${message}:\n${problems}${leakActualValuesInError ? `\nactual:${JSON.stringify(actual)}\n` : ''}`);
    if (leakActualValuesInError) {
      this.actual = actual;
      this.expected = intertwingle(actual, problems, []);
      showDiff: true
    }
  }


}