import {Schema} from "../../schema";
import {BaseSchema} from "../index";
import {failure, isError, Problems, ValidationResult} from "../../problems";

export interface Associative<K, V> {
  set(k: K, v: V): this;

  has(k: K): boolean;

  get(k: K): any;
}

export function conformInPlace<K, V>(thing: Associative<K, V>, itemSchemas: Iterable<[K, Schema]>): Problems | undefined {
  let problems = new Problems([]);
  for (const [k, s] of itemSchemas) {
    if (!(thing.has(k))) {
      if (s[optionalField] !== true)
        problems = problems.merge(failure("No value", [k]));
      continue;
    }

    const v: ValidationResult<any> = s.conform(thing.get(k));

    if (isError(v)) {
      problems = problems.merge((v as Problems).prefixPath([k]));
    }
    else
      thing.set(k, v);
  }

  return problems.problems.length > 0 ? problems : undefined;
}

const optionalField = Symbol("optionalField");

export class TagSchemaAsOptional<IN, OUT> extends BaseSchema<IN, OUT | undefined> {
  [optionalField] = true;

  constructor(private readonly subschema: Schema<IN, OUT>) {
    super();
  }

  conform(value: IN): Problems | OUT | undefined {
    return value === undefined ? undefined : this.subschema.conform(value);
  }

}

