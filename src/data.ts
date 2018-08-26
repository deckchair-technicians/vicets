import {BaseSchema, isSchema} from "./impl";
import {ObjectSchema} from "./impl/associative/obj";
import {Constructor, entries, isPrimitive} from "./impl/util";
import {failure, Problems, ValidationError} from "./problems";
import {schematizeEntries} from "./schematize";

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
  for (let search: Function = ctor; search; search = Object.getPrototypeOf(search)) {
    const pd = Object.getOwnPropertyDescriptor(search, SCHEMA_SYMBOL);
    if (pd !== undefined)
      return pd.value;
  }
  throw new Error(`No schema on ${ctor.name}- not annotated with @data?`);
}

// TODO: add generic constraints to IN/OUT on Schema?
export function hasSchema(schema: ObjectSchema): <C extends { new(...args: any[]): object }>(c: C) => C {
  return function <C extends { new(...args: any[]): object }>(c: C): C {
    const hackClassName = {};
    hackClassName[c.name] = class extends c {
      constructor(...args: any[]) {
        super(...args);
        if (BUILDING_SCHEMA_USING_DEFAULT_FIELD_VALUES)
          return;

        for (const [k, v] of entries(this)) {
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
    Object.defineProperty(c, SCHEMA_SYMBOL, {value: schema, writable: false});
    return decorated;
  }
}

export function data<C extends { new(...args: any[]): any }>(c: C): C {
  // buildSchemaUsingDefaultFieldValues is required to allow calling parent constructor
  const objectWithDefaults = buildSchemaUsingDefaultFieldValues(() => new c());

  for (const [k, v] of entries(objectWithDefaults)) {
    if (!(isSchema(v) || isPrimitive(v)))
      throw new Error(`Field '${k}' on ${c.name} is neither a schema nor a primitive value`);
  }

  const schema = new ObjectSchema(schematizeEntries(objectWithDefaults)) as ObjectSchema;
  return hasSchema(schema)(c);
}

export function conform<T>(c: Constructor<T>, values: {}): Problems | T {
  const conformed = extractSchema(c).conform(values);
  if (conformed instanceof Problems) {
    return conformed;
  }
  return Object.assign(Object.create(c.prototype), conformed);
}

export function build<T>(c: Constructor<T>, values: {}): T {
  const conformed = conform(c, values);
  if (conformed instanceof Problems) {
    throw new ValidationError(values, conformed);
  }
  return conformed;
}

/**
 * Call this instead of build() when constructing data instances
 * by specifying fields in code. The compiler will complain if
 * fields are missing.
 *
 * `construct(A, {})` will cause the compiler to complain that
 * `{}` is missing whatever fields A requires.
 */
export function construct<T>(c: Constructor<T>, value: T): T {
  return build(c, value);
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
