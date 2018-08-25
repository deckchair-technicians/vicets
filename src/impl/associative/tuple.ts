import {failure, ValidationResult} from "../../problems";
import {Schema} from "../../schema";
import {typeDescription} from "../util";
import {Associative, conformInPlace} from "./associative";
import {BaseSchema} from "../index";

class TupleStrategies<T extends any[]> implements Associative<number, any> {
  constructor(public readonly result: T) {

  }

  set(k: number, v: any): this {
    this.result[k] = v;
    return this;
  }

  has(k: number): boolean {
    return k < this.result.length;
  }

  get(k: number): any {
    return this.result[k];
  }
}

export class TupleSchema<T extends any[]> extends BaseSchema<T> {
  private readonly itemSchemas: [number, Schema][];

  constructor(schemas: Schema[]) {
    super();
    this.itemSchemas = schemas.map((v, i) => [i, v] as [number, Schema]);
  }

  conform(value: any): ValidationResult<T> {
    if (value === undefined || value === null)
      return failure('no value');

    if (!(value instanceof Array))
      return failure(`expected an array but got ${typeDescription(value)}`);

    const instance = [] as any as T;
    for (let i = 0; i < value.length; i++) {
      instance[i] = value[i];
    }
    const problems = conformInPlace(new TupleStrategies(instance), this.itemSchemas);
    return problems ? problems : instance;
  }
}



