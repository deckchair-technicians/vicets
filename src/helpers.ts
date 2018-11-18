import {Schema} from "./schema";
import {Problems, ValidationError, ValidationResult} from "./problems";

export function validate<IN, OUT>(schema: Schema<IN, OUT>, value: IN): OUT {
  const conformed = conform(schema, value);
  if (conformed instanceof Problems) {
    throw new ValidationError(value, conformed);
  }
  return conformed;
}

export function conform<IN, OUT>(schema: Schema<IN, OUT>, value: IN): ValidationResult<OUT> {
  if (!schema)
    throw new Error("No schema provided");

  return schema.conform(value);
}