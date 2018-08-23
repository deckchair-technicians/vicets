import {Schema} from "../schema";
import {BaseSchema} from "./index";
import {entries, typeDescription} from "./util";
import {failure, isError, Problems, ValidationResult} from "../problems";

export interface AssociativeStrategies<T> {
  set(result: T, k: any, v: any): T;

  has(result: T, k: any): boolean;

  get(result: T, k: any): any;
}

export abstract class AssociativeSchema<T> extends BaseSchema<any, T> {
  public readonly fieldSchemas: { [k: string]: Schema<any, any> };

  constructor(object: object,
              private readonly strategies: AssociativeStrategies<T>) {
    super();
    for (const k in object) {
      const s = object[k];
      if (!('conform' in s))
        throw new Error(`${k} was a ${typeDescription(s)}. Expected a schema`);

    }
    this.fieldSchemas = {...object};
  }

  abstract conform(value: any): ValidationResult<T>;

  abstract intersect(other: this): this;

  conformInPlace(result: T): ValidationResult<T> {
    let problems = new Problems([]);

    for (const [k, s] of entries(this.fieldSchemas)) {
      if (!(this.strategies.has(result, k))) {
        if (!isOptionalField(s))
          problems = problems.merge(failure("No value", [k]));
        continue;
      }

      const v: ValidationResult<any> = s.conform(this.strategies.get(result, k));

      if (isError(v)) {
        problems = problems.merge((v as Problems).prefixPath([k]));
      }
      else
        this.strategies.set(result, k, v);
    }

    return problems.problems.length > 0 ? problems : result;
  }
}

const optionalField = Symbol("optionalField");

function isOptionalField(s: Schema): boolean {
  return s[optionalField] === true;
}

export class TagSchemaAsOptional<IN, OUT> extends BaseSchema<IN, OUT | undefined> {
  [optionalField] = true;

  constructor(private readonly subschema: Schema<IN, OUT>) {
    super();
  }

  conform(value: IN): Problems | OUT | undefined {
    return value === undefined ? undefined : this.subschema.conform(value);
  }

}