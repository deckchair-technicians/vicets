import {failure, Problems, ValidationResult} from "../problems";
import {BaseSchema} from "./index";

export class InSchema<T> extends BaseSchema<any, T> {
  private readonly values: Set<T>;

  constructor(values: T[]) {
    super();
    this.values = new Set(values);
  }

  conform(value: any): ValidationResult<T> {
    if (!this.values.has(value))
      return failure(`expected one of [${Array.from(this.values).join(', ')}]`);
    return value;
  }

}