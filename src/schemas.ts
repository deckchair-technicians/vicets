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
import {ArraySchema} from "./impl/array";
import {EnumValueSchema} from "./impl/enumvalue";
import {LookupSchema} from "./impl/lookup";
import {IsInstanceSchema} from "./impl/isinstance";
import {DeferredSchema} from "./impl/deferred";
import {TagSchemaAsOptional} from "./impl/associative";
import {MapSchema} from "./impl/map";

export function __<IN, OUT>(s: Schema<IN, OUT>): OUT {
  return s.__();
}

export function opt<IN, OUT>(s: Schema<any, OUT>): Schema<any, OUT | undefined> {
  return new TagSchemaAsOptional(s);
}

export function isdata<T>(constructor: Constructor<T>): Schema<any, T> {
  return new DataSchema(constructor);
}

export function eq<T>(value: T): Schema<any, T> {
  return new EqualsSchema(value);
}

export function isnull(): Schema<any, null> {
  return eq(null);
}

export function isundefined(): Schema<any, undefined> {
  return eq(undefined);
}

export function isany(): Schema<any, any> {
  return schema((x)=>x);
}

export function arrayof<T>(schema: Schema<any,T>): Schema<any, T[]> {
  return new ArraySchema(schema);
}

export function enumvalue<T extends object>(e: T): Schema<any, T[keyof T]> {
  return new EnumValueSchema(e);
}

export function enumkey<T extends object>(e: T): Schema<any, T[keyof T]> {
  const stringKeysOnly = {};
  for (let [k, v] of entries(e)) {
    if(isNaN(Number(k)))
      stringKeysOnly[k] = v;
  }

  return lookup(stringKeysOnly);
}

export function lookup<T extends object>(e: T): Schema<any, T[keyof T]> {
  return new LookupSchema(e);
}

export function discriminated<T>(...ctors: Constructor<T>[]): Schema<any, T> {
  return discriminatedBy(detectDiscriminator(ctors), ...ctors);
}

export function discriminatedBy<T>(discriminator: keyof T,
                                   ...ctors: Constructor<T>[]): Schema<any, T> {
  return new DiscriminatedUnionSchema<T>(ctors, discriminator);
}

export function isstring(): Schema<any, string> {
  return predicate<any>(
    (x) => x instanceof String || typeof x === "string",
    (x) => `expected a string but got ${typeDescription(x)}`);
}

export function isinstance<T>(c:Constructor<T>): Schema<any, T> {
  return new IsInstanceSchema(c);
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

function schematizeEntries(object: Object) {
  const fixed = {};
  for (const [k, v] of entries(object)) {
    fixed[k] = schematize(v);
  }
  return fixed;
}

export function object<T extends object>(object: Object): Schema<any, object> {
  return new ObjectSchema(schematizeEntries(object));
}

export function map<K,V>(object: Object): Schema<any, Map<K,V>> {
  return new MapSchema<K,V>(schematizeEntries(object));
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

export function defer<IN, OUT>(factory: () => Schema<IN, OUT>): Schema<IN, OUT> {
  return new DeferredSchema(factory);
}

