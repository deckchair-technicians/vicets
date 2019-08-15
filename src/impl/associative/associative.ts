import {
  BaseSchema,
  behaviour,
  failure,
  isError,
  MissingItemBehaviour,
  Problems,
  Schema,
  subSchemaJson,
  UnexpectedItemBehaviour,
  ValidationResult
} from "../";

export interface Associative<K, V> {
  set(k: K, v: V): this;

  delete(k: K): boolean;

  has(k: K): boolean;

  get(k: K): any;

  keys(): Iterable<K>;
}

export function conformInPlace<K, V>(thing: Associative<K, V>,
                                     itemSchemas: Iterable<[K, Schema]>): Problems | undefined {

  let problems = new Problems([]);
  const unmatchedThingKeys = new Set(thing.keys());
  const {unexpected, missing} = behaviour();
  for (const [k, s] of itemSchemas) {
    const v: ValidationResult<any> = s.conform(thing.get(k));

    if (isError(v) && !thing.has(k)) {
      if (s[optional] !== true && missing !== MissingItemBehaviour.IGNORE) {
        problems = problems.merge(failure("No value", [k]));
      }
      continue;
    }
    unmatchedThingKeys.delete(k);

    if (isError(v)) {
      problems = problems.merge((v as Problems).prefixPath([k]));
    }
    else if (v !== undefined) {
      thing.set(k, v);
    }
  }

  for (const k of unmatchedThingKeys) {
    switch (unexpected) {
      case UnexpectedItemBehaviour.IGNORE:
        break;
      case UnexpectedItemBehaviour.DELETE:
        thing.delete(k);
        break;
      case UnexpectedItemBehaviour.PROBLEM:
        problems = problems.merge(failure("Unexpected item", [k]));
        break;
      default:
        throw new Error(`Not implemented- ${unexpected}`);
    }
  }

  return problems.length > 0 ? problems : undefined;
}

export const optional = Symbol("optional");

export class TagSchemaAsOptional<IN, OUT> extends BaseSchema<IN, OUT | undefined> {
  [optional] = true;

  constructor(private readonly subschema: Schema<IN, OUT>) {
    super();
  }

  conform(value: IN): Problems | OUT | undefined {
    return value === undefined ? undefined : this.subschema.conform(value);
  }

  toJSON(toJson?: (s: Schema) => any): any {
    return subSchemaJson(this.subschema, toJson)
  }

}

export function isOptional(schema: Schema): boolean {
  return schema[optional];
}

export type PrimitivePattern<T> = T extends string ? Schema<any, T> | T | RegExp : Schema<any, T> | T;

export type StrictPatternItem<T> = T extends object
  ? StrictPattern<T> | Schema<any, T> | T
  : PrimitivePattern<T>

export type StrictPattern<T extends object> = { readonly [K in keyof T]: StrictPatternItem<T[K]> };

export type PatternItem<T> = T extends object
  ? Pattern<T> | Schema<any, T> | T
  : PrimitivePattern<T>

export type Pattern<T extends object> = { readonly [K in keyof T]?: PatternItem<T[K]> };