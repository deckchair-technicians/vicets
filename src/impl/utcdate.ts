import {BaseSchema} from "./index";
import {failure, ValidationResult} from "../problems";

const dateRegex = /^([1-9][0-9]{3})-([0-1][0-9])-([0-3][0-9])T([0-2][0-9]):([0-6][0-9])(:([0-6][0-9])(\.([0-9]{3}))?)?((Z)|(\+([0-2][0-9]):([0-6][0-9])))$/;
export class UtcDateSchema extends BaseSchema<any, Date> {
  conform(value: any): ValidationResult<Date> {
    if(typeof value === 'string'){
      const match = dateRegex.exec(value);
      if(!match)
        return failure("expected a valid ISO8601 string");

      try{
        const year = Number.parseInt(match[1]);
        const month = Number.parseInt(match[2]) - 1;
        const date = Number.parseInt(match[3]);
        const hours = Number.parseInt(match[4]);
        const minutes = Number.parseInt(match[5]);
        const seconds = match[7] ? Number.parseInt(match[7]) : 0;
        const millis = match[9] ? Number.parseInt(match[9]) : 0;

        const offsetHours = match[13] ? Number.parseInt(match[13]) : 0;
        const offsetMinutes = match[14] ? Number.parseInt(match[14]) : 0;

        if(offsetHours !==0 || offsetMinutes !== 0)
          return failure("expected a UTC date, with timezone specified as Z or 00:00");

        value = new Date(Date.UTC(
          year,
          month,
          date,
          hours,
          minutes,
          seconds,
          millis
        ));
        if(
          value.getUTCFullYear() !== year ||
          value.getUTCMonth() !== month ||
          value.getUTCDate() !== date ||
          value.getUTCHours() !== hours ||
          value.getUTCMinutes() !== minutes ||
          value.getUTCMilliseconds() !== millis
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