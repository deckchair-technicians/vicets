import {Problems, Schema, ValidationError, ValidationErrorOpts, ValidationResult} from "./impl";

export function validate<IN, OUT>(
  schema: Schema<IN, OUT>,
  value: IN,
  opts: ValidationErrorOpts = {}): OUT {

  const conformed = conform(schema, value);
  if (conformed instanceof Problems) {
    throw new ValidationError(value, conformed,opts);
  }
  return conformed;
}

export function conform<IN, OUT>(schema: Schema<IN, OUT>, value: IN): ValidationResult<OUT> {
  if (!schema)
    throw new Error("No schema provided");

  return schema.conform(value);
}

