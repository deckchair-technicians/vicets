import {BaseSchema} from "./index";
import {failure, ValidationResult} from "../problems";

const regex = /^([1-9][0-9]{3})-([0-1][0-9])-([0-3][0-9])$/;
export class IsoDateSchema extends BaseSchema<any,Date>{
  conform(value: any): ValidationResult<Date> {
    if(typeof value === 'string'){
      const match = regex.exec(value);
      if(!match)
        return failure("expected a valid ISO8601 string");

      try{
        const year = Number.parseInt(match[1]);
        const month = Number.parseInt(match[2]) - 1;
        const date = Number.parseInt(match[3]);
        value = new Date(Date.UTC(
          year,
          month,
          date
        ));
        if(
          value.getUTCFullYear() !== year ||
          value.getUTCMonth() !== month ||
          value.getUTCDate() !== date
        ) return failure("expected a valid date");
      }
      catch {
        return failure("expected a valid date")
      }
    }
    if(! (value instanceof Date))
      return failure("expected a date or string");

    return value;
  }
}