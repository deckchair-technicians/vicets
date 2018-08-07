import {StringSchema} from "./index";
import {Problems} from "../";
import {failure} from "../problems";

export class RegExpSchema extends StringSchema {
  constructor(private readonly r: RegExp) {
    super();
  }

  conformString(value: string): Problems | string {
    return this.r.test(value) ? value : failure(`did not match ${this.r}`);
  }
}