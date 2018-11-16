import {Problems, ValidationError, ValidationResult} from "./src/problems";
import {Schema} from "./src/schema";

export * from "./src/problems"
export * from "./src/schema"
export * from "./src/schemas"
export * from "./src/data"
export * from "./src/schematize";
export * from "./src/unexpected_items"
export * from "./src/hasschema";

export function validate<IN,OUT>(schema:Schema<IN,OUT>, value:IN) : OUT {
  const conformed = conform(schema, value);
  if (conformed instanceof Problems) {
    throw new ValidationError(this, conformed);
  }
  return conformed;
}

export function conform<IN,OUT>(schema:Schema<IN,OUT>, value:IN) : ValidationResult<OUT> {
  if(!schema)
    throw new Error("No schema provided");

  return schema.conform(value);
}