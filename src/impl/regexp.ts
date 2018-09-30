import {StringSchema} from "./index";
import {failure, ValidationResult} from "../problems";

export class RegExpSchema extends StringSchema {
  constructor(private readonly r: RegExp) {
    super();
  }

  conformString(value: string): ValidationResult<string> {
    return this.r.test(value) ? value : failure(`did not match ${this.r}`);
  }
}