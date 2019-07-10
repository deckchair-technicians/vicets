import {failure, ValidationResult,BaseSchema} from "./";

export class BooleanSchema extends BaseSchema<any, boolean> {
  conform(value: any): ValidationResult<boolean> {
    const t = typeof value;
    if (value instanceof Boolean || t === "boolean")
      return value;

    if (value instanceof String || t === "string") {
      const s: string = value.toLowerCase();
      if (["true", "false"].indexOf(s) < 0)
        return failure(`expected a boolean`);
      return s === 'true';
    }
    return failure(`expected a boolean`);
  }
}