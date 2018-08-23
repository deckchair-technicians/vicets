import {BaseSchema} from "./index";
import {failure, isError, Problems, ValidationResult} from "../problems";
import {Schema} from "../schema";
import {entries, merge, typeDescription} from "./util";

export class ObjectSchema extends BaseSchema<object, object> {
  public readonly fieldSchemas: { [k: string]: Schema<any, any> };

  constructor(object: object) {
    super();
    for (const k in object) {
      const s = object[k];
      if (!('conform' in s))
        throw new Error(`${k} was a ${typeDescription(s)}. Expected a schema`);

    }
    this.fieldSchemas = {...object};
  }

  conform(value: any): ValidationResult {
    if (value === undefined || value === null)
      return failure('no value');

    if (typeof value !== 'object')
      return failure(`expected an object but got ${typeof value}`);

    const instance = {};
    Object.assign(instance, value);
    const problems = this.conformInPlace(instance);
    return problems ? problems : instance;
  }

  conformInPlace(result: {}): Problems | undefined {
    let problems = new Problems([]);

    for (const [k, s] of entries(this.fieldSchemas)) {
      if (!(k in result)) {
        if (!isOptionalField(s))
          problems = problems.merge(failure("No value", [k]));
        continue;
      }

      const v: ValidationResult = s.conform(result[k]);

      if (isError(v)) {
        problems = problems.merge((v as Problems).prefixPath([k]));
      }
      else
        result[k] = v;
    }

    return problems.problems.length > 0 ? problems : undefined;
  }

  toString(): string {
    return this.fieldSchemas.toString();
  }

  intersect(other: ObjectSchema): ObjectSchema {
    return new ObjectSchema(merge(this.fieldSchemas, other.fieldSchemas, (a: Schema, b: Schema) => a.and(b)));
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
