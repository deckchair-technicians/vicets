import {failure, ValidationResult} from "../problems";
import {Schema} from "../schema";
import {typeDescription} from "./util";
import {BaseSchema} from "./index";
import phone from "phone";

export class E164PhoneNumberSchema extends BaseSchema<any, string> {
  constructor() {
    super();
  }

  conform(value: any): ValidationResult<string> {

    if (typeof value !== 'string')
      return failure(`expected a string but got ${typeDescription(value)}`);

    const result = phone(value);

    if (result.length === 0) {
      return failure(`Phone number ${value} is not a valid E.164 phone number`)
    } else {
      return result[0]
    }

  }
}
