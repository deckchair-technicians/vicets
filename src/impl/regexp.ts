import {BaseStringSchema, failure, ValidationResult} from "./";

export class RegExpSchema extends BaseStringSchema {
  constructor(private readonly r: RegExp) {
    super();
  }

  conformString(value: string): ValidationResult<string> {
    return this.r.test(value) ? value : failure(`did not match ${this.r}`);
  }

  toJSON(): any {
    return {
      ...super.toJSON(),
      pattern: this.r.toString().replace(/^\//, '').replace(/\/$/, '')
    }
  }
}