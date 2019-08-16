import {
  ArrayOfSchema,
  Behaviour,
  BehaviourSchema,
  BooleanSchema,
  ConditionalSchema,
  DefaultValueSchema,
  DeferredSchema,
  DelegatingSchema,
  detectDiscriminator,
  DiscriminatedUnionSchema,
  E164PhoneNumberSchema,
  EnumValueSchema,
  EqualsSchema,
  failure,
  InSchema,
  IsInstanceSchema,
  IsoUtcDateSchema,
  isSchema,
  IsURLOptions,
  LensBehaviour,
  LensSchema,
  LookupSchema,
  MapSchema,
  MissingItemBehaviour,
  NumberSchema,
  ObjectSchema,
  ObjOfSchema,
  Opts,
  OrSchema,
  OverrideSchema,
  Pattern,
  Problems,
  RegExpSchema,
  Schema,
  schemaOf,
  SchemaOverrides,
  schematizeEntries,
  SelectSchema,
  SetOfSchema,
  StrictPattern,
  StringSchema,
  TagSchemaAsOptional,
  TimeExpectation,
  TupleSchema,
  UnexpectedItemBehaviour,
  UniqueSchema,
  UrlSchema,
  UuidSchema,
} from "./impl";
import {identity} from "./impl/util/functions";
import {Constructor} from "./impl/util/types";
import {DataSchema} from "./data";

export function __<IN, OUT>(s: Schema<IN, OUT>): OUT {
  return s.__();
}

/**
 * Marks a field as optional. MUST be used as the outer schema:
 *
 * Ok:
 *
 * @data
 * class Cat {
 *   name?:string =__(opt(isstring().or(isnumber())))
 * }
 *
 * Not ok:
 *
 * @data
 * class Cat {
 *   name?:string =__(opt(isstring()).or(isnumber())
 * }
 */
export function opt<IN, OUT>(s: Schema<any, OUT>): Schema<any, OUT | undefined> {
  return new TagSchemaAsOptional(s);
}

export function isdata<T extends object>(constructor: Constructor<T>): Schema<any, T> {
  return new DataSchema(constructor);
}

export function partial<T extends object>(type: Constructor<T>): Schema<any, Partial<T>> {
  return onMissing(schemaOf(type), MissingItemBehaviour.IGNORE);
}

export function onMissing<IN, OUT>(schema: Schema<IN, OUT>, behaviour: MissingItemBehaviour): Schema<IN, OUT> {
  return withBehaviour(schema, {missing: behaviour});
}

export function onUnexpected<IN, OUT>(schema: Schema<IN, OUT>, behaviour: UnexpectedItemBehaviour): Schema<IN, OUT> {
  return withBehaviour(schema, {unexpected: behaviour});
}

export function withBehaviour<IN, OUT>(schema: Schema<IN, OUT>, behaviour: Partial<Behaviour>): Schema<IN, OUT> {
  return new BehaviourSchema(behaviour, schema);
}

function deepNullablePattern(fieldSchemaArray: [string, Schema][]): Pattern<any> {
  const nullableFieldsObjectPattern = {};
  for (const [k, s] of fieldSchemaArray) {
    if ("fieldSchemaArray" in s) { // TODO testing if schema represents an object should be different
      const nullableFieldsObjectSchema = new ObjectSchema(deepNullablePattern((s as ObjectSchema<any>).fieldSchemaArray));
      nullableFieldsObjectPattern[k] = new OrSchema([nullableFieldsObjectSchema, isnull()]);
    } else {
      nullableFieldsObjectPattern[k] = new OrSchema([s, isnull()]);
    }
  }
  return nullableFieldsObjectPattern
}

export function deepNullable<T extends object>(type: Constructor<T>): Schema<any, DeepNullable<T>> {
  const objectSchema: ObjectSchema<T> = schemaOf(type);

  return new ObjectSchema(deepNullablePattern(objectSchema.fieldSchemaArray));
}

export type Nullable<T> = T | null

export type DeepNullable<T extends object> = {
  [P in keyof T]: T[P] extends object ? DeepNullable<T[P]> : Nullable<T[P]>;
}

export function eq<T>(value: T): Schema<any, T> {
  return new EqualsSchema(value);
}

export function gt(value: number): Schema<any, number> {
  return new NumberSchema({exclusiveMinimum: value});
}

export function lt(value: number): Schema<any, number> {
  return new NumberSchema({exclusiveMaximum: value});
}

export function gte(value: number): Schema<any, number> {
  return new NumberSchema({minimum: value});
}

export function lte(value: number): Schema<any, number> {
  return new NumberSchema({maximum: value});
}

export interface RangeOpts {
  lowerInclusive: boolean;
  upperInclusive: boolean;
}

export function range(
  from: number,
  to: number,
  {lowerInclusive = true, upperInclusive = false}: Partial<RangeOpts> = {})
  : Schema<any, number> {

  const min: Opts = lowerInclusive
    ? {minimum: from}
    : {exclusiveMinimum: from};

  const max: Opts = upperInclusive
    ? {maximum: to}
    : {exclusiveMaximum: to};

  return isnumber({...min, ...max});
}

export function isnull(): Schema<any, null> {
  return eq(null);
}

export function isundefined(): Schema<any, undefined> {
  return eq(undefined);
}

export function isany(): Schema<any, any> {
  return schema((x) => x, () => true);
}

export function fail(problems: Problems = failure('always fails')): Schema<any, any> {
  return schema(() => problems, () => false);
}

export function arrayof<T>(schema: Schema<any, T>): Schema<any, T[]> {
  return new ArrayOfSchema(schema);
}

export function setof<T>(schema: Schema<any, T>): Schema<any, Set<T>> {
  return new SetOfSchema(schema);
}

export function enumvalue<T extends object>(e: T): Schema<any, T[keyof T]> {
  return new EnumValueSchema(e);
}

export function enumkey<T extends object>(e: T): Schema<any, T[keyof T]> {
  const stringKeysOnly = {};
  for (let [k, v] of Object.entries(e)) {
    if (isNaN(Number(k)))
      stringKeysOnly[k] = v;
  }

  return lookup(stringKeysOnly);
}

export function lookup<T extends object>(e: T): Schema<any, T[keyof T]> {
  return new LookupSchema(e);
}

export function discriminated<T extends object>(...ctors: Constructor<T>[]): Schema<any, T> {
  return discriminatedBy(detectDiscriminator(ctors), ...ctors);
}

export function discriminatedBy<T extends object>(discriminator: keyof T,
                                                  ...ctors: Constructor<T>[]): Schema<any, T> {
  return new DiscriminatedUnionSchema<T>(ctors, discriminator);
}

export function isstring(): Schema<any, string> {
  return new StringSchema();
}

export function isinstance<T>(c: Constructor<T>): Schema<any, T> {
  return new IsInstanceSchema(c);
}

export function matches(r: RegExp): Schema<any, string> {
  return new RegExpSchema(r);
}

export function conditional(): ConditionalSchema<any, any> {
  return new ConditionalSchema([]);
}

export function isboolean(): Schema<any, boolean> {
  return new BooleanSchema();
}

export function isIn<T extends number | string | null>(...values: T[]): Schema<any, T> {
  return new InSchema<T>(values);
}

export function isurl(opts?: IsURLOptions): Schema<any, string> {
  return new UrlSchema(opts || {});
}

export function isuuid(): Schema<any, string> {
  return new UuidSchema();
}

export function isnumber(opts: Opts = {}): Schema<any, number> {
  return new NumberSchema(opts);
}

const DATE_TIME = new IsoUtcDateSchema(TimeExpectation.ALWAYS);

export function isoUtcDateTime(): Schema<any, Date> {
  return DATE_TIME;
}

const DATE = new IsoUtcDateSchema(TimeExpectation.NEVER);

export function isoDateOnly(): Schema<any, Date> {
  return DATE;
}

/**
 * E.164 phone number normaliser
 * if no default country is passed, it validates number depending on coutry calling code (has to begin with '+')
 */
export function e164PhoneNumber(defaultCountryIso3166?: string): Schema<any, string> {
  return new E164PhoneNumberSchema(defaultCountryIso3166);
}

export function object<T extends object>(
  pattern: StrictPattern<T>
): Schema<any, T> {
  return new ObjectSchema<T>(pattern);
}

export function deepPartial<T extends object>(
  pattern: Pattern<T>): Schema<any, T> {
  return onUnexpected<any, T>(new ObjectSchema<T>(pattern), UnexpectedItemBehaviour.IGNORE);
}

export function objof<T>(schema: Schema<any, T>): Schema<any, { [k: string]: T }> {
  return new ObjOfSchema(schema);
}

export function map<K, V>(entryPattern: Pattern<{}> | Map<K, Schema<any, V>>): Schema<any, Map<K, V>> {
  const subSchema = new ObjectSchema<any>(entryPattern instanceof Map
    ? schematizeEntries(entryPattern)
    : entryPattern);
  return new MapSchema<K, V>(subSchema);
}

export function tuple<A>(a: Schema<any, A>): Schema<any, [A]>;

export function tuple<A, B>(a: Schema<any, A>, b: Schema<any, B>): Schema<any, [A, B]>;

export function tuple<A, B, C>(a: Schema<any, A>, b: Schema<any, B>, c: Schema<any, C>): Schema<any, [A, B, C]>;

export function tuple<A, B, C, D>(a: Schema<any, A>, b: Schema<any, B>, c: Schema<any, C>, d: Schema<any, D>): Schema<any, [A, B, C, D]> ;

export function tuple<A, B, C, D, E>(a: Schema<any, A>, b: Schema<any, B>, c: Schema<any, C>, d: Schema<any, D>, e: Schema<any, E>): Schema<any, [A, B, C, D, E]>;

export function tuple<T extends any[]>(...s: Schema[]): Schema<any, T> ;

export function tuple<T extends any[]>(...s: Schema[]): Schema<any, T> {

  return new TupleSchema(s);
}

export function schema<IN, OUT>(
  conform: (value: IN) => Problems | OUT,
  toJSON?: () => any): Schema<IN, OUT> {
  return new DelegatingSchema<IN, OUT>(conform, toJSON);
}


export function predicate<T>(predicate: (value: T) => boolean,
                             failureMessage?: ((value: any) => string) | string): Schema<T, T> {

  function buildPredicateMessageFunction(message: ((value: any) => string) | string | undefined, predicate: (x: any) => boolean): (value: any) => string {
    switch (typeof message) {
      case 'string':
        return () => message as string;
      case 'function':
        return message as () => string;
      case 'undefined':
        return () => predicate.toString();
      default:
        throw new Error(`Not a valid message ${message}`);
    }
  }

  const messageFn = buildPredicateMessageFunction(failureMessage, predicate);
  return schema(
    (x) => predicate(x) === true ? x : failure(messageFn(x)))
}

/**
 * Note that when using `defer()` to recursively nest schemas, by default `toJSON()` will
 * stack overflow.
 *
 * You need to make sure that all schemas used in recursion are in the definitions
 * when calling jsonSchema(), so that they get replaced by $refs.
 *
 * ```
 * const node = object({children: arrayof(defer(() =>node))});
 *
 * // this will overflow:
 * node.toJSON();
 *
 * // this will not:
 * jsonSchema({definitions:{node: node}};
 * ```
 */
export function defer<IN, OUT>(factory: () => Schema<IN, OUT>): Schema<IN, OUT> {
  return new DeferredSchema(factory);
}

export {SchemaOverrides} from "./impl/override";

export function override<IN, OUT>(s: Schema<IN, OUT>, o: SchemaOverrides<IN, OUT>) {
  return new OverrideSchema(s, o);
}

export function unique<T>(): Schema<any, T[]> {
  return uniqueBy(identity);
}

export function uniqueBy<T, V = any>(fn: (t: T) => V): Schema<T[], T[]> {
  return new UniqueSchema<T, V>(fn);
}

export function select<T>(path: string[], s: Schema<any, T>): Schema<any, T> {
  return new SelectSchema(path, s);
}

export function anyOf<T>(...items: (T | Schema<any, T>)[]): Schema<any, T> {
  const result: Schema<any, T> | undefined = items.reduce(
    (result: Schema<any, T> | undefined, item: Schema<any, T> | T): Schema<any, T> => {
      const schema = isSchema(item) ? item : eq(item);
      return result ? result.or(schema) : schema;
    }, undefined);
  return result || fail(failure('oneOf() with no values provided'));
}


export {LensBehaviour} from './impl/lens'

/**
 * Expects an object. Conforms value at path using schema, and returns the outer object.
 *
 * lens(["a", "b"], eq("valid")).conform({a:{b:"valid"}}) returns {a:{b:"valid"}}
 */
export function lens<T, U>(path: string[], s: Schema<any, U>): Schema<any, T> {
  return new LensSchema(path, s);
}

export function defaultValue<T>(value: () => T, schema: Schema<any, T>): Schema<any, T> {
  return new DefaultValueSchema(value, schema)
}