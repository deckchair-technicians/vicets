import {BaseSchema} from "./index";
import {failure, Problems, ValidationResult} from "../problems";
import {Schema} from "../schema";
import {typeDescription} from "./util";

export class ArraySchema<T> extends BaseSchema<any,T[]> {
  constructor(private readonly itemSchema: Schema<any,T>){
    super();
  }
  conform(value: any): ValidationResult<T[]> {
    if(!(value instanceof Array))
      return failure(`${typeDescription(value)} was not an Array`);

    const conformed : T[] = new Array(value.length);
    let problems  = new Problems([]);
    for (let i = 0; i < value.length; i++) {
      const conformedItem = this.itemSchema.conform(value[i]);
      if(conformedItem instanceof Problems)
        problems = problems.merge(conformedItem.prefixPath([i]));
      else
        conformed[i] = conformedItem
    }
    if(problems.length > 0)
      return problems;

    return conformed;
  }

}