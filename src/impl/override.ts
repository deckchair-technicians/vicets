import {BaseSchema, failure, Problems, Schema, subSchemaJson, ValidationResult} from "./";
import {typeDescription} from "./util/types";

export interface SchemaOverrides<IN, OUT> {
  failure?: string | ((value: IN) => Problems);
}

export class OverrideSchema<IN, OUT> extends BaseSchema<IN, OUT> {
  constructor(private readonly subschema: Schema<IN, OUT>,
              private readonly overrides: SchemaOverrides<IN, OUT>) {
    super();
  }

  conform(value: IN): ValidationResult<OUT> {
    const result = this.subschema.conform(value);
    return result instanceof Problems
      ? this.failure(value, result)
      : result;
  }

  private failure(value: IN, original: Problems): Problems {
    const f = this.overrides.failure;

    if (!f) {
      return original;
    }
    else if (typeof f === 'string') {
      return failure(f)
    }
    else if (f instanceof Function) {
      return f(value);
    }
    else {
      throw new Error(`Not implemented for ${typeDescription(f)}`);
    }
  }

  toJSON(toJson?: (s: Schema) => any): any {
    return subSchemaJson(this.subschema, toJson);
  }
}