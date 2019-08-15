import {failure, RegExpSchema, ValidationResult} from "./";

const REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89ab][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

export class UuidSchema extends RegExpSchema {
  constructor() {
    super(REGEX);
  }

  conformString(value: string): ValidationResult<string> {
    const conformed = value.toLowerCase();
    return REGEX.test(conformed) ? conformed : failure(`not a valid uuid: ${value}`);
  }
  toJSON(): any {
    return {...super.toJSON(), format: "uuid"}
  }
}