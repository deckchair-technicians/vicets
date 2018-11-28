import {failure, ValidationResult} from "../problems";
import {typeDescription} from "./util";
import {BaseSchema} from "./index";
import phone from "phone";

export class E164PhoneNumberSchema extends BaseSchema<any, string> {
  constructor(private readonly defaultCountryIso3166?: string) {
    super();
  }

  conform(value: any): ValidationResult<string> {

    if (typeof value !== 'string')
      return failure(`expected a string but got ${typeDescription(value)}`);

    const result = this.defaultCountryIso3166 ? phone(value, this.defaultCountryIso3166) : phone(value);

    if (result.length === 0) {
      return failure(`expected a valid E.164 phone number`)
    } else {
      return result[0]
    }

  }
}
