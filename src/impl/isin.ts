import {BaseSchema, failure, ValidationResult} from "./";
import {toJSON} from "./util/json";

export class InSchema<T extends number | string | null> extends BaseSchema<any, T> {
  private readonly values: Set<T>;

  constructor(values: T[]) {
    super();
    if(values.length===0)
      throw new Error('At least one value is required');
    this.values = new Set(values);
  }

  conform(value: any): ValidationResult<T> {
    if (!this.values.has(value))
      return failure(`expected one of [${Array.from(this.values).join(', ')}]`);
    return value;
  }

  toJSON(): any {
    const values = [...this.values].map(v => toJSON(v));
    const types = new Set(values.map(v => typeof v));

    return {
      type: types.size === 1 ? types.values().next().value : [...types],
      enum: values
    };
  }
}