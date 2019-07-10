import {failure, StringSchema, ValidationResult} from "./";

const REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class UuidSchema extends StringSchema {
  constructor() {
    super();
  }

  conformString(value: string): ValidationResult<string> {
    const conformed = value.toLowerCase();
    return REGEX.test(conformed) ? conformed : failure(`not a valid uuid: ${value}`)
  }
}