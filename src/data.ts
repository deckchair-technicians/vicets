import {BaseSchema, isSchema} from "./impl";
import {ObjectSchema} from "./impl/obj";
import {Constructor, entries, isPrimitive} from "./impl/util";
import {failure, ValidationError, Problems} from "./problems";
import {object, schema} from "./schemas";

let BUILDING_SCHEMA_USING_DEFAULT_FIELD_VALUES = false;

function buildSchemaUsingDefaultFieldValues<T>(f: () => T): T {
  try {
    BUILDING_SCHEMA_USING_DEFAULT_FIELD_VALUES = true;
    return f();
  } finally {
    BUILDING_SCHEMA_USING_DEFAULT_FIELD_VALUES = false;
  }
}

const SCHEMA_SYMBOL = Symbol('schema');

export function extractSchema<T>(ctor: Constructor<T>): ObjectSchema {
  const schema = Object.getOwnPropertyDescriptor(ctor, SCHEMA_SYMBOL);
  if (schema === undefined)
    throw new Error(`No schema on ${ctor.name}- not annotated with @data?`);
  return schema.value;
}

export function data<C extends { new(...args: any[]): any }>(c: C): C {
  // buildSchemaUsingDefaultFieldValues is required to allow calling parent constructor
  const objectWithDefaults = buildSchemaUsingDefaultFieldValues(() => new c());

  for (const [k,v] of entries(objectWithDefaults)) {
    if (!(isSchema(v) || isPrimitive(v)))
      throw new Error(`Field '${k}' on ${c.name} is neither a schema nor a primitive value`);
  }

  const schema = object(objectWithDefaults) as ObjectSchema;

  const hackClassName = {};
  hackClassName[c.name] = class extends c {
    constructor(...args: any[]) {
      super(...args);
      if (BUILDING_SCHEMA_USING_DEFAULT_FIELD_VALUES)
        return;

      for (const [k,v] of entries(this)) {
        if (isSchema(v))
          this[k] = undefined;
      }
      const conformed = schema.conformInPlace(this);
      if (conformed instanceof Problems) {
        throw new ValidationError(this, conformed);
      }
    };
  };

  const decorated = hackClassName[c.name];
  Object.defineProperty(decorated, SCHEMA_SYMBOL, {value: schema, writable: false});
  return decorated;
}

export function build<T>(c: Constructor<T>, values: {}): T {
  const conformed = extractSchema(c).conform(values);
  if (conformed instanceof Problems) {
    throw new ValidationError(values, conformed);
  }
  // Skip the constructor
  return Object.assign(Object.create(c.prototype), conformed);
}

export class DataSchema<T> extends BaseSchema<any, T> {
  constructor(private readonly c: Constructor<T>) {
    super();
  }

  conform(value: any): Problems | T {
    if (value instanceof this.c) return value;
    if (typeof value !== 'object') return failure(`Expected an object but got a ${typeof value}`);

    try {
      return build(this.c, value);
    } catch (e) {
      if (e instanceof ValidationError) {
        return e.problems;
      }
      throw e;
    }
  }

}

