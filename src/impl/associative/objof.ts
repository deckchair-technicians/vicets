import {BaseSchema} from "../index";
import {Schema} from "../../schema";
import {failure, ValidationResult} from "../../problems";
import {conformInPlace} from "./associative";
import {MissingItemBehaviour, UnexpectedItemBehaviour} from "../../unexpected_items";
import {ObjectStrategies} from "./obj";

export class ObjOfSchema<T> extends BaseSchema<any, { [k: string]: T }> {
  constructor(private readonly valueSchema: Schema<any, T>) {
    super()
  }

  conform(value: any): ValidationResult<{ [p: string]: T }> {
    if (value === undefined || value === null)
      return failure('no value');

    if (typeof value !== 'object')
      return failure(`expected an object but got ${typeof value}`);

    const itemSchemas = Object.keys(value).map(k => [k, this.valueSchema] as [string, Schema<any, T>]);
    const instance = <{ [p: string]: T }>{};
    Object.assign(instance, value);
    const problems = conformInPlace(UnexpectedItemBehaviour.PROBLEM, MissingItemBehaviour.PROBLEM, new ObjectStrategies(instance), itemSchemas);
    return problems ? problems : instance;
  }
}