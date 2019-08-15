import {BaseSchema, failure, ValidationResult} from "./";
import {typeDescription} from "./util/types";

export class LookupSchema<T extends object, V> extends BaseSchema<any, T[keyof T]> {
  constructor(private readonly lookup: T) {
    super();
  }

  conform(value: any): ValidationResult<T[keyof T]> {
    if (typeof value !== 'string')
      return failure(`expected a string but got ${typeDescription(value)}`);

    if (value in this.lookup)
      return this.lookup[value];

    return failure(`expected one of [${Object.keys(this.lookup).map((k) => JSON.stringify(k)).join(', ')}]`)
  }

  toJSON(): any {
    return {
      type: "string",
      enum: Object.keys(this.lookup)
    }
  }
}