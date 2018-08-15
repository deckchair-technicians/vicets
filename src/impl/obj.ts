import {isError, Problems, Schema, schematize, ValidationResult} from "../";
import {BaseSchema} from "./index";
import {failure} from "../problems";

export class ObjectSchema extends BaseSchema<object, object> {
  public readonly fieldSchemas: Map<string,Schema<any, any>> = new Map<string, Schema<any, any>>();

  constructor(object: object) {
    super();
    for (const k in object) {
      this.fieldSchemas.set(k, schematize(object[k]));
    }
  }

  conform(value: any): ValidationResult {
    const result = {};
    let problems = new Problems([]);

    if(value === undefined || value === null)
      return failure('no value');

    if(typeof value !== 'object')
      return failure(`expected an object but got ${typeof value}`);

    for (const [k,s] of this.fieldSchemas.entries()) {
      if(!(k in value)){
        problems = problems.merge(failure("No value", [k]));
        continue;
      }

      const v: ValidationResult = s.conform(value[k]);
      if (isError(v))
        problems = problems.merge((v as Problems).prefixPath([k]));
      result[k] = v;
    }

    if (problems.problems.length > 0)
      return problems;

    return result;
  }

  toString(): string {
    return this.fieldSchemas.toString();
  }
}

