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
import {RegExpSchema} from "../regexp";
import {addGetter, copyGetters, merge} from "../util/magic";
import {mapValues} from "../util/maps";
import {Associative, conformInPlace, Pattern, PatternItem, StrictPattern} from "./associative";

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

export function patternItemToSchema<T>(item: PatternItem<T>,
                                       unexpected: UnexpectedItemBehaviour,
                                       missing: MissingItemBehaviour): Schema {
  if (typeof item !== 'object')
    return new EqualsSchema(item);

  if (item instanceof RegExp)
    return new RegExpSchema(item);

  if (typeof item['conform'] === 'function')
    return item as Schema;

  return new ObjectSchema(item, unexpected, missing);
}

function patternToSchemas<T extends object>(pattern: Pattern<T>,
                                            unexpected: UnexpectedItemBehaviour,
                                            missing: MissingItemBehaviour): { [K in keyof T]: Schema<T[K]> } {

  const result = {};
  for (const k of Object.keys(pattern)) {
    const s = pattern[k];
    result[k] = patternItemToSchema(s, unexpected, missing);
  }
  return result as any;
}

export class ObjectStrategies implements Associative<string, any> {
  constructor(public readonly result: any) {
  }

  set(k: any, v: any): this {
    addGetter(this.result, k, () => v);
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

  constructor(private readonly pattern: Pattern<T>,
              private readonly unexpectedItems: UnexpectedItemBehaviour,
              private readonly missingItems: MissingItemBehaviour) {
    super();
    this.fieldSchemaArray = objectEntries(patternToSchemas(pattern, unexpectedItems, missingItems));
  }

  conform(value: any): ValidationResult<T> {
    if (value === undefined || value === null)
      return failure('no value');

    if (typeof value !== 'object')
      return failure(`expected an object but got ${typeof value}`);

    const instance = copyGetters(value);
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
    const mergedSchemas = merge(this.pattern, other.pattern, (a: Schema, b: Schema) => a.and(b)) as StrictPattern<T & U>;
    return new ObjectSchema<T & U>(mergedSchemas, strictestUnexpected(this.unexpectedItems, other.unexpectedItems), strictestMissing(this.missingItems, other.missingItems));
  }

  onUnexpected(behaviour: UnexpectedItemBehaviour): this {
    return new ObjectSchema(this.pattern, behaviour, this.missingItems) as this;
  }

  onMissing(behaviour: MissingItemBehaviour): this {
    return new ObjectSchema(this.pattern, this.unexpectedItems, behaviour) as this;
  }
}



