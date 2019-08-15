import {Associative, BaseSchema, conformInPlace, failure, Schema, subSchemaJson, ValidationResult} from "../";
import {typeDescription} from "../util/types";

export class TupleStrategies<T extends any[]> implements Associative<number, any> {
  private readonly deleted: number[] = [];

  constructor(private readonly resultIn: T) {

  }

  get result(): T {
    return Array.from(this.keys()).filter(n => this.deleted.indexOf(n) < 0).map(n => this.resultIn[n]) as T;
  }

  set(k: number, v: any): this {
    this.resultIn[k] = v;
    return this;
  }

  has(k: number): boolean {
    return k < this.resultIn.length;
  }

  get(k: number): any {
    return this.resultIn[k];
  }

  delete(k: number): boolean {
    if (this.resultIn.length <= k) return false;
    this.deleted.push(k);
    return true;
  }

  keys(): Iterable<number> {
    return Array(this.resultIn.length).keys();
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
    const result = new TupleStrategies(instance);
    const problems = conformInPlace(result, this.itemSchemas);
    return problems ? problems : result.result;
  }

  toJSON(toJson?: (s: Schema) => any): any {
    return {
      type: "array",
      items: subSchemaJson(this.itemSchemas.map(([k, v]) => v), toJson)
    }
  }
}