import {isError, Problems, Schema, schematize, ValidationResult} from "../";
import {BaseSchema} from "./index";

export class ObjectSchema extends BaseSchema<object, object> {
  public readonly schemas: { [k: string]: Schema<any, any> };

  constructor(object: object) {
    super();
    this.schemas = {};
    for (const k in object) {
      this.schemas[k] = schematize(object[k]);
    }
  }

  conform(value: any): ValidationResult {
    const result = {};
    let problems = new Problems([]);

    for (let k in this.schemas) {
      const s: Schema<any, any> = this.schemas[k];
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
    return this.schemas.toString();
  }
}