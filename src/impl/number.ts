import {BaseSchema, StringSchema} from "./index";
import {failure, ValidationResult} from "../problems";

export class NumberSchema extends BaseSchema<any, number> {
  conform(value: any): ValidationResult<number> {
    if (typeof value === 'number' || value instanceof Number)
      return value as number;
    return failure('expected a number');
  }
}
