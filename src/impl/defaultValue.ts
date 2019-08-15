import {BaseSchema, optional, Schema, subSchemaJson, ValidationResult} from "./";
import {toJSON} from "./util/json";

export class DefaultValueSchema<T> extends BaseSchema<any, T> {
  [optional]: true;

  constructor(private readonly value: () => T,
              private readonly subschema: Schema<any, T>) {
    super()
  }

  conform(value: any): ValidationResult<T> {
    if (value === undefined)
      value = this.value();

    return this.subschema.conform(value);
  }

  toJSON(toJson?: (s: Schema) => any): any {
    return {
      ...subSchemaJson(this.subschema, toJson),
      default: toJSON(this.value()),
    };
  }
}