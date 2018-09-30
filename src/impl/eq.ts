import {failure, ValidationResult} from "../problems";
import {BaseSchema} from "./index";
import {typeDescription} from "./util";

export class EqualsSchema<T> extends BaseSchema<any, T> {
  constructor(public readonly expected: T) {
    super();
  }

  conform(value: any): ValidationResult<T> {
    if (value !== this.expected)
      return failure(`expected '${this.expected}' but got ${typeDescription(value)}: ${JSON.stringify(value)}`);
    return value;
  }

}