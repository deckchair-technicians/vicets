import {
    AndSchema,
    BetweenSchema,
    DelegatingSchema,
    NumberSchema,
    ObjectSchema,
    OrSchema
} from "./impl/schema";

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

export function problems(...problems: Problem[]) {
    return new Problems(problems);
}

export function failure(message: string, path: Path = []): Problems {
    return problems(problem(message, path));
}

export type ValidationResult = Problems | any;

export interface Schema {
    conform(this: this, value: any): ValidationResult
}

export function between(lower: number, upper: number): number {
    return new BetweenSchema(lower, upper) as any as number;
}

export function chain(...schemas: Schema[]): Schema {
    return new AndSchema(schemas);
}

export function first(...schemas: Schema[]): Schema {
    return new OrSchema(schemas);
}

export function number(...additionalSchema: Schema[]): number {
    return chain(...[new NumberSchema()], ...additionalSchema) as any as number;
}


export function integer(): number {
    return predicate((x) => Number.isInteger(x), "was not a whole number") as any as number;
}

export function eq(y: number): number {
    return predicate((x) => x === y, (x) => `was not ${y}`) as any as number;
}

export function gt(y: number): number {
    return predicate((x) => x > y, (x) => `must be greater than ${y}`) as any as number;
}

export function lt(y: number): number {
    return predicate((x) => x < y, (x) => `must be less than ${y}`) as any as number;
}

export function gte(y: number): number {
    return predicate((x) => x >= y, (x) => `was less than ${y}`) as any as number;
}

export function lte(y: number): number {
    return predicate((x) => x <= y, (x) => `was more than ${y}`) as any as number;
}

export function schema<T>(conform: (value: any) => ValidationResult): T {
    return new DelegatingSchema(conform) as any as T;
}

function _buildPredicateMessageFunction(message: ((value: any) => string) | string | undefined, predicate: PredicateFunction): (value: any) => string {
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

export type PredicateFunction = (value: any) => boolean;


export function predicate(predicate: PredicateFunction,
                          failureMessage?: ((value: any) => string) | string): Schema {
    let messageFn = _buildPredicateMessageFunction(failureMessage, predicate);
    return schema(
        (x) => predicate(x) === true ? x : failure(messageFn(x)))
}


export type Schemaish = Schema | PredicateFunction | object;

export function schematize(x: Schemaish): Schema {
    let t = typeof x;
    if (t === "function")
        return predicate(x as PredicateFunction);

    if (t === "object") {
        if ('conform' in x && typeof x.conform === "function")
            return x as Schema;
        else
            return new ObjectSchema(x)
    }
    throw Error(`Cannot build schema from ${x}`);
}

export function object<T extends object>(object: Object): T {
    return new ObjectSchema(object) as any as T;
}

export function assertSchema(s: Schemaish, value: any): any {
    const result = schematize(s).conform(value);
    if (isSuccess(result)) return result;

    let e = new Error(`${result}`);
    e['problems'] = result;
    throw e;
}