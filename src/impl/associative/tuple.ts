import {failure, ValidationResult} from "../../problems";
import {Schema} from "../../schema";
import {typeDescription} from "../util/types";
import {Associative, conformInPlace} from "./associative";
import {BaseSchema} from "../index";
import {HasItemBehaviour, MissingItemBehaviour, UnexpectedItemBehaviour} from "../../unexpected_items";

class TupleStrategies<T extends any[]> implements Associative<number, any> {
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

export class TupleSchema<T extends any[]> extends BaseSchema<T> implements HasItemBehaviour {
  private readonly itemSchemas: [number, Schema][];

  constructor(schemas: Schema[],
              private readonly unexpectedItems: UnexpectedItemBehaviour) {
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
    const problems = conformInPlace(this.unexpectedItems, MissingItemBehaviour.PROBLEM, result, this.itemSchemas);
    return problems ? problems : result.result;
  }

  onUnexpected(behaviour: UnexpectedItemBehaviour): this {
    return new TupleSchema(this.itemSchemas.map(([n, s]) => s), behaviour) as this;
  }

  onMissing(behaviour: MissingItemBehaviour): this {
    throw new Error("Not implemented");
  }
}