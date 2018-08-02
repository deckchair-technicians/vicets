import {DelegatingSchema, ObjectSchema, OrSchema} from "./impl/schema";
import {RecordSchema} from "./records";

export type Path = any[];

export class Problem {
  constructor(readonly path: Path, readonly message: string) {
  }

  prefixPath(p: Path): Problem {
    return new Problem([...p, ...this.path], this.message);
  }

  toString(): string {
    return `[${this.path.join(' ').trimRight()}] : ${this.message}`
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
    return this.problems.map(e => e.toString()).join("\r\n")
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

export type ValidationResult = Problems | any;

export interface Schema<IN, OUT> {
  conform(this: this, value: IN): Problems | OUT

  and<NEWOUT>(this: this, s: Schema<OUT, NEWOUT>): Schema<IN, NEWOUT>

  or<NEWIN extends IN, NEWOUT>(this: this, s: Schema<IN, NEWOUT>): Schema<IN, OUT | NEWOUT>

  __<FAKED extends OUT>(this: this): FAKED
}

export function __<IN, OUT, FAKED extends OUT>(s: Schema<IN, OUT>): FAKED {
  return s.__();
}

export function record<T>(constructor: { new(...args: any[]): T }): Schema<any, T> {
  return new RecordSchema(constructor);
}

export function eq<T>(y: T): Schema<any, T> {
  return predicate<T>(
    (x) => x === y,
    (x) => `expected ${y} but got ${x}`);
}

export function discriminated<A, B>(a: { new(...args: any[]): A },
                                    b: { new(...args: any[]): B }): Schema<any, A | B>;
export function discriminated<A, B, C>(a: { new(...args: any[]): A },
                                       b: { new(...args: any[]): B },
                                       c: { new(...args: any[]): C }): Schema<any, A | B | C>;
export function discriminated<A, B, C, D>(a: { new(...args: any[]): A },
                                          b: { new(...args: any[]): B },
                                          c: { new(...args: any[]): C },
                                          d: { new(...args: any[]): D }): Schema<any, A | B | C | D>;
export function discriminated<A, B, C, D, E>(a: { new(...args: any[]): A },
                                             b: { new(...args: any[]): B },
                                             c: { new(...args: any[]): C },
                                             d: { new(...args: any[]): D },
                                             e: { new(...args: any[]): E }): Schema<any, A | B | C | D | E>;
export function discriminated(...args: any[]) {
  return args.reduce((acc:any, ctor) => {
    return acc ? new OrSchema(acc, record(ctor)) : record(ctor)
  }, null);
}

}

export function schema<IN, OUT>(conform: (value: IN) => Problems | OUT): Schema<IN, OUT> {
  return new DelegatingSchema<IN, OUT>(conform);
}

function _buildPredicateMessageFunction(message: ((value: any) => string) | string | undefined, predicate: (x: any) => boolean): (value: any) => string {
  switch (typeof  message) {
    case 'string':
      return (value: any) => message as string;
    case 'function':
      return message as (value: any) => string;
    case 'undefined':
      return (value: any) => predicate.toString();
    default:
      throw new Error(`Not a valid message ${message}`);
  }
}


export function predicate<T>(predicate: (value: T) => boolean,
                             failureMessage?: ((value: any) => string) | string): Schema<T, T> {
  let messageFn = _buildPredicateMessageFunction(failureMessage, predicate);
  return schema(
    (x) => predicate(x) === true ? x : failure(messageFn(x)))
}


export type Schemaish = { conform(x: any): any } | Function | object;

export function schematize<IN, OUT>(x: Schemaish): Schema<IN, OUT> {
  let t = typeof x;
  if (t === "function")
    return predicate(x as (x: any) => boolean);

  if (t === "object") {
    if ('conform' in x && typeof x.conform === "function")
      return x as Schema<IN, OUT>;
    else
      return new ObjectSchema(x) as any as Schema<IN, OUT>;
  }
  throw Error(`Cannot build schema from ${x}`);
}

export function object<T extends object>(object: Object): Schema<object, object> {
  return new ObjectSchema(object);
}

export function assertSchema(s: Schemaish, value: any): any {
  const result = schematize(s).conform(value);
  if (isSuccess(result)) return result;

  let e = new Error(`${result}`);
  e['problems'] = result;
  throw e;
}