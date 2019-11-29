import {
  Associative,
  BaseSchema,
  conformInPlace,
  EqualsSchema,
  failure,
  isOptional,
  Pattern,
  PatternItem,
  RegExpSchema,
  Schema,
  StrictPattern, subSchemaJson,
  TupleSchema,
  ValidationResult
} from "../";
import {addGetter, copyGetters, merge} from "../util/magic";

export function objectEntries(object: object): [string, Schema][] {
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

export function patternItemToSchema<T>(item: PatternItem<T>): Schema {
  if (typeof item !== 'object')
    return new EqualsSchema(item);

  if (item instanceof Array)
    return new TupleSchema(item.map(v => patternItemToSchema(v)));

  if (typeof item === 'undefined')
    return new EqualsSchema(undefined);

  if (item === null)
    return new EqualsSchema(null);

  if (typeof item['conform'] === 'function')
    return item as Schema;

  return new ObjectSchema(item as Pattern<T>);
}

export function patternToSchemas<T extends object>(pattern: Pattern<T>): { [K in keyof T]: Schema<T[K]> } {

  const result = {};
  for (const k of Object.keys(pattern)) {
    const s = pattern[k];
    result[k] = patternItemToSchema(s);
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

export class ObjectSchema<T extends object> extends BaseSchema<any, T> {
  public readonly fieldSchemaArray: [string, Schema][];

  constructor(public readonly pattern: Pattern<T>) {
    super();
    this.fieldSchemaArray = objectEntries(patternToSchemas(pattern));
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
  conformInPlace(instance: {}): ValidationResult<{}> {
    const problems = conformInPlace(
      new ObjectStrategies(instance),
      this.fieldSchemaArray);

    return problems ? problems : instance;
  }

  intersect<U extends object>(other: ObjectSchema<U>): ObjectSchema<T & U> {
    const mergedSchemas = merge(this.pattern, other.pattern, (a: Schema, b: Schema) => a.and(b)) as StrictPattern<T & U>;
    return new ObjectSchema<T & U>(mergedSchemas);
  }

  toJSON(toJson?: (s: Schema) => any): any {
    const properties = this.fieldSchemaArray.reduce((result, [k, subSchema]) => {
      result[k] = subSchemaJson(subSchema,toJson);
      return result;
    }, {});

    const required = this.fieldSchemaArray
      .filter(([k, schema]) => !isOptional(schema))
      .map(([k]) => k);

    return {
      type: "object",
      properties: properties,
      required: required,
    }
  }
}



