import {failure, ValidationResult} from "../../problems";
import {Schema} from "../../schema";
import {
  HasItemBehaviour,
  MissingItemBehaviour,
  strictestMissing,
  strictestUnexpected,
  UnexpectedItemBehaviour
} from "../../unexpected_items";
import {EqualsSchema} from "../eq";
import {BaseSchema} from "../index";
import {merge} from "../util";
import {Associative, conformInPlace, Schemas} from "./associative";

function objectEntries(object: object): [string, Schema][] {
  const result: [string, Schema][] = [];
  for (const k of Object.keys(object)) {
    const s = object[k];
    if (typeof s['conform'] !== 'function')
      throw new Error(`Not a schema ${s}`);
    else
      result.push([k, s]);
  }
  return result;
}

function valuesToSchemas<T>(object: Schemas<T>,
                            unexpected: UnexpectedItemBehaviour,
                            missing: MissingItemBehaviour): { [K in keyof T]: Schema<T[K]> } {

  //object : {a:{b:1}}
  const result = {};
  for (const k of Object.keys(object)) {
    const s = object[k];
    if (typeof s !== 'object')
      result[k] = new EqualsSchema(s);
    else if (typeof s['conform'] === 'function')
      result[k] = s;
    else
      result[k] = new ObjectSchema(s, unexpected, missing);
  }
  return result as any;
}

export class ObjectStrategies implements Associative<string, any> {
  constructor(public readonly result: {}) {
  }

  set(k: any, v: any): this {
    this.result[k] = v;
    return this
  }

  delete(k: any): boolean {
    return delete this.result[k];
  }

  has(k: any): boolean {
    return k in this.result;
  }

  get(k: any): any {
    return this.result[k];
  }

  keys(): Iterable<string> {
    return Object.keys(this.result);
  }
}

export class ObjectSchema<T extends object> extends BaseSchema<any, T> implements HasItemBehaviour {
  public readonly fieldSchemaArray: [string, Schema][];

  constructor(private readonly fieldSchemasAsObject: Schemas<T>,
              private readonly unexpectedItems: UnexpectedItemBehaviour,
              private readonly missingItems: MissingItemBehaviour) {
    super();
    this.fieldSchemaArray = objectEntries(valuesToSchemas(fieldSchemasAsObject, unexpectedItems, missingItems));
  }

  conform(value: any): ValidationResult<T> {
    if (value === undefined || value === null)
      return failure('no value');

    if (typeof value !== 'object')
      return failure(`expected an object but got ${typeof value}`);

    const instance = {};
    Object.assign(instance, value);
    return this.conformInPlace(instance) as T;
  }

  /**
   * Required to allow @hasSchema to conform 'this'
   */
  public conformInPlace(instance: {}): ValidationResult<{}> {
    const problems = conformInPlace(
      this.unexpectedItems,
      this.missingItems,
      new ObjectStrategies(instance),
      this.fieldSchemaArray);

    return problems ? problems : instance;
  }

  intersect<U extends object>(other: ObjectSchema<U>): ObjectSchema<T & U> {
    const mergedSchemas = merge(this.fieldSchemasAsObject, other.fieldSchemasAsObject, (a: Schema, b: Schema) => a.and(b)) as Schemas<T & U>;
    return new ObjectSchema<T & U>(mergedSchemas, strictestUnexpected(this.unexpectedItems, other.unexpectedItems), strictestMissing(this.missingItems, other.missingItems));
  }

  onUnexpected(behaviour: UnexpectedItemBehaviour): this {
    return new ObjectSchema(this.fieldSchemasAsObject, behaviour, this.missingItems) as this;
  }

  onMissing(behaviour: MissingItemBehaviour): this {
    return new ObjectSchema(this.fieldSchemasAsObject, this.unexpectedItems, behaviour) as this;
  }
}



