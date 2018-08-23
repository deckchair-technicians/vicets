import * as os from "os";

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

export function isError(x: Problems | any): boolean {
  return x != null && x instanceof Problems;
}

export function isSuccess(x: Problems | any): boolean {
  return !isError(x);
}

export function problem(message: string, path: Path = []) {
  return new Problem(path, message);
}

export function problems(problem: Problem, ...more: Problem[]) {
  return new Problems([...[problem], ...more]);
}

export function failure(message: string, path: Path = []): Problems {
  return problems(problem(message, path));
}

export class ValidationError extends Error {
  constructor(public readonly value: any,
              public readonly problems: Problems) {
    super(`Validation failed:${os.EOL}${problems}`);
  }
}

export type ValidationResult<T> = Problems | T;