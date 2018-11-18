import {Problems, ValidationError, ValidationResult} from "./problems";
import {Schema} from "./schema";

export * from "./problems"
export * from "./schema"
export * from "./schemas"
export * from "./data"
export * from "./schematize";
export * from "./unexpected_items"
export * from "./hasschema";
export {Schemas} from "./impl/associative/associative";

export function validate<IN,OUT>(schema:Schema<IN,OUT>, value:IN) : OUT {
  const conformed = conform(schema, value);
  if (conformed instanceof Problems) {
    throw new ValidationError(schema, conformed);
  }
  return conformed;
}

export function conform<IN,OUT>(schema:Schema<IN,OUT>, value:IN) : ValidationResult<OUT> {
  if(!schema)
    throw new Error("No schema provided");

  return schema.conform(value);
}