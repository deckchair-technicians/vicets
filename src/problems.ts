import * as os from "os";
import {intertwingle} from "./helpers";

export type Path = any[];

export class Problem {
  constructor(readonly path: Path, readonly message: string) {
  }

  prefixPath(p: Path): Problem {
    return new Problem([...p, ...this.path], this.message);
  }

  toString(): string {
    return `[${this.path.join(' -> ').trimRight()}] : ${this.message}`
  }
}

export class Problems {
  constructor(readonly problems: Problem[]) {
  }

  get length(): number {
    return this.problems.length;
  }

  prefixPath(p: Path): Problems {
    return new Problems(this.problems.map(e => e.prefixPath(p)));

  }

  merge(...ps: Problems[]): Problems {
    return ps.reduce((acc: Problems, next: Problems) => acc.append(...next.problems), this);

  }

  append(...ps: Problem[]): Problems {
    return new Problems([...this.problems, ...ps]);

  }

  toString(): string {
    return this.problems.map(e => e.toString()).join(os.EOL)
  }
}

export function isError(x: ValidationResult<any>): x is Problems {
  return x != null && x instanceof Problems;
}

export function isSuccess<T>(x: ValidationResult<T>): x is T {
  return !isError(x);
}

export function problem(message: string, path: Path = []) {
  return new Problem(path, message);
}

export function problems(...ps: Problem[]): Problems {
  return new Problems(ps);
}

export function failure(message: string, path: Path = []): Problems {
  return problems(problem(message, path)) as Problems;
}

export interface ValidationErrorOpts {
  readonly message?: string,
  readonly leakActualValuesInError?: boolean,
}

export class ValidationError extends Error {
  public readonly actual?: any;
  public readonly expected?: any;

  constructor(actual: any,
              public readonly problems: Problems,
              {
                message = 'Validation failed',
                leakActualValuesInError = false,
              }: ValidationErrorOpts = {}
  ) {
    super(`${message}:${os.EOL}${problems}`);
    if (leakActualValuesInError) {
      this.actual = actual;
      this.expected = intertwingle(actual, problems, []);
      showDiff: true
    }
  }
}

export type ValidationResult<T> = Problems | T;