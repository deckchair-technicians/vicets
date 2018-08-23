import {BaseSchema} from "./index";
import {failure, Problems, ValidationResult} from "../problems";
import {typeDescription} from "./util";

export class LookupSchema<T extends object,V> extends BaseSchema<any, T[keyof T]> {
  constructor(private readonly e: T) {
    super();
  }

  conform(value: any): ValidationResult<T[keyof T]>  {
    if(typeof value !== 'string')
      return failure(`expected a string but got ${typeDescription(value)}`);

    if(value in this.e)
      return this.e[value];

    return failure(`expected one of [${Object.keys(this.e).map((k) => JSON.stringify(k)).join(', ')}]`)
  }
}