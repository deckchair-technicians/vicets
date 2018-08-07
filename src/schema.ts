import {DelegatingSchema} from "./impl/index";
import {RecordSchema} from "./data";
import {ObjectSchema} from "./impl/obj";
import {EqualsSchema} from "./impl/eq";
import {InSchema} from "./impl/isin";
import {DiscriminatedUnionSchema} from "./impl/discriminated_union";
import {failure, Problems} from "./problems";
import {RegExpSchema} from "./impl/regexp";
import {IsURLOptions, UrlSchema} from "./impl/url";
import {
  buildPredicateMessageFunction,
  detectDiscriminator
} from "./impl/util";

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

export function isdata<T>(constructor: { new(...args: any[]): T }): Schema<any, T> {
  return new RecordSchema(constructor);
}

export function eq<T>(value: T): Schema<any, T> {
  return new EqualsSchema(value);
}

export function discriminated<T>(...ctors: { new(...args: any[]): T }[]): Schema<object, T> {
  return discriminatedby(detectDiscriminator(ctors), ctors);
}

export function discriminatedby<T>(discriminator: keyof T,
                                   ctors: { new(...args: any[]): T }[],): Schema<object, T> {
  return new DiscriminatedUnionSchema<T>(ctors, discriminator);
}

export function isstring(): Schema<any, string> {
  return predicate<any>(
    (x) => x instanceof String || typeof x === "string",
    (x) => `expected a string but got ${x}`);
}

export function matches(r:RegExp): Schema<any, string> {
  return new RegExpSchema(r);
}

export function isboolean(): Schema<any, boolean> {
  return predicate<any>(
    (x) => x instanceof Boolean || typeof x === "boolean",
    (x) => `expected a boolean but got ${x}`);
}

export function isin<T>(...values:T[]): Schema<any, T> {
  return new InSchema<T>(values);
}

export function isurl(opts?: IsURLOptions): Schema<any, string> {
  return new UrlSchema(opts || {});
}

export function object<T extends object>(object: Object): Schema<object, object> {
  return new ObjectSchema(object);
}

export function schema<IN, OUT>(conform: (value: IN) => Problems | OUT): Schema<IN, OUT> {
  return new DelegatingSchema<IN, OUT>(conform);
}


export function predicate<T>(predicate: (value: T) => boolean,
                             failureMessage?: ((value: any) => string) | string): Schema<T, T> {
  let messageFn = buildPredicateMessageFunction(failureMessage, predicate);
  return schema(
    (x) => predicate(x) === true ? x : failure(messageFn(x)))
}

export type Schemaish = Schema<any, any> | Function | number | string | boolean | object;

export function schematize<IN, OUT>(x: Schemaish): Schema<IN, OUT> {
  switch (typeof x) {
    case "function":
      return predicate(x as (x: any) => boolean);
    case "string":
    case "number":
    case "boolean":
      return eq(x)  as any as Schema<IN, OUT>;
    case "object":
      let obj = (x as object);
      if ('conform' in obj && typeof x['conform'] === "function")
        return x as Schema<IN, OUT>;
      else
        return new ObjectSchema(obj) as any as Schema<IN, OUT>;
    default:
      throw Error(`Cannot build schema from ${x}`);
  }
}