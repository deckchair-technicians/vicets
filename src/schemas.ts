import {DelegatingSchema} from "./impl";
import {DataSchema} from "./data";
import {ObjectSchema} from "./impl/obj";
import {EqualsSchema} from "./impl/eq";
import {InSchema} from "./impl/isin";
import {DiscriminatedUnionSchema} from "./impl/discriminated_union";
import {failure, Problems} from "./problems";
import {RegExpSchema} from "./impl/regexp";
import {IsURLOptions, UrlSchema} from "./impl/url";
import {buildPredicateMessageFunction, Constructor, entries, typeDescription} from "./impl/util";
import {detectDiscriminator} from "./impl/discriminated_union/find_discriminators";
import {Schema} from "./schema";

export function __<IN, OUT>(s: Schema<IN, OUT>): OUT {
  return s.__();
}

export function isdata<T>(constructor: Constructor<T>): Schema<any, T> {
  return new DataSchema(constructor);
}

export function eq<T>(value: T): Schema<any, T> {
  return new EqualsSchema(value);
}

export function discriminated<T>(...ctors: Constructor<T>[]): Schema<object, T> {
  return discriminatedBy(detectDiscriminator(ctors), ...ctors);
}

export function discriminatedBy<T>(discriminator: keyof T,
                                   ...ctors: Constructor<T>[]): Schema<object, T> {
  return new DiscriminatedUnionSchema<T>(ctors, discriminator);
}

export function isstring(): Schema<any, string> {
  return predicate<any>(
    (x) => x instanceof String || typeof x === "string",
    (x) => `expected a string but got ${typeDescription(x)}`);
}

export function matches(r: RegExp): Schema<any, string> {
  return new RegExpSchema(r);
}

export function isboolean(): Schema<any, boolean> {
  return predicate<any>(
    (x) => x instanceof Boolean || typeof x === "boolean",
    (x) => `expected a boolean but got ${x}`);
}

export function isin<T>(...values: T[]): Schema<any, T> {
  return new InSchema<T>(values);
}

export function isurl(opts?: IsURLOptions): Schema<any, string> {
  return new UrlSchema(opts || {});
}

export function object<T extends object>(object: Object): Schema<object, object> {
  const fixed = {};
  for (const [k,v] of entries(object)) {
    fixed[k] = schematize(v);
  }
  return new ObjectSchema(fixed);
}

export function schema<IN, OUT>(conform: (value: IN) => Problems | OUT): Schema<IN, OUT> {
  return new DelegatingSchema<IN, OUT>(conform);
}


export function predicate<T>(predicate: (value: T) => boolean,
                             failureMessage?: ((value: any) => string) | string): Schema<T, T> {
  const messageFn = buildPredicateMessageFunction(failureMessage, predicate);
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
      const obj = (x as object);

      if ('conform' in obj && typeof x['conform'] === "function")
        return x as Schema<IN, OUT>;

      else if(Object.getPrototypeOf(x) === Object.prototype)
        return object(obj) as any as Schema<IN, OUT>;

      else
        throw Error(`Cannot build schema from non-plain object ${Object.getPrototypeOf(x).name}`);

    default:
      throw Error(`Cannot build schema from ${typeof x}: ${x}`);
  }
}

