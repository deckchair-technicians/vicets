import {Behaviour, Problems, Schema, usingBehaviour, ValidationError, ValidationResult} from "./impl";

export interface ValidationOpts extends Behaviour {
  message: string;
}

export function validate<IN, OUT>(
  schema: Schema<IN, OUT>,
  value: IN,
  opts: Partial<ValidationOpts> = {})
  : OUT {

  const conformed = usingBehaviour(opts, () => conform(schema, value));
  if (conformed instanceof Problems) {
    throw new ValidationError(value, conformed, opts);
  }
  return conformed;
}

export function conform<IN, OUT>(
  schema: Schema<IN, OUT>,
  value: IN,
  opts: Partial<ValidationOpts> = {})
  : ValidationResult<OUT> {

  if (!schema)
    throw new Error("No schema provided");

  return usingBehaviour(opts, () => schema.conform(value));
}

