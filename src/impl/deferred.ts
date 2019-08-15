import {BaseSchema, Schema, subSchemaJson, ValidationResult} from "./";

export class DeferredSchema<IN, OUT> extends BaseSchema<IN, OUT> {
  private _subschema: Schema<IN, OUT>;

  constructor(private readonly deferred: () => Schema<IN, OUT>) {
    super();
  }

  private get subschema(): Schema<IN, OUT> {
    this._subschema = this.deferred();
    return this._subschema;
  }

  conform(value: IN): ValidationResult<OUT> {
    return this.subschema.conform(value);
  }

  toJSON(toJson?: (s: Schema) => any): any {
    return subSchemaJson(this.subschema,toJson);
  }
}