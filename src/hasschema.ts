import {ObjectSchema} from "./impl/associative/obj";
import {Constructor, entries} from "./impl/util";
import {isSchema} from "./impl";
import {Problems, ValidationError} from "./problems";

const SCHEMA_SYMBOL = Symbol('schema');

export function schemaOf<T extends object>(ctor: Constructor<T>): ObjectSchema<T> {
  for (let search: Function = ctor; search; search = Object.getPrototypeOf(search)) {
    const pd = Object.getOwnPropertyDescriptor(search, SCHEMA_SYMBOL);
    if (pd !== undefined)
      return pd.value;
  }
  throw new Error(`No schema on ${ctor.name}- not annotated with @data?`);
}

let SUSPEND_VALIDATION = false;
export function suspendValidation<T>(f: () => T): T {
  try {
    SUSPEND_VALIDATION = true;
    return f();
  } finally {
    SUSPEND_VALIDATION = false;
  }
}


// TODO: add generic constraints to IN/OUT on Schema?
export function hasSchema<C extends { new(...args: any[]): object }>(schema: ObjectSchema<C> ): (c: C) => C {
  return function <C extends { new(...args: any[]): object }>(c: C): C {
    const hackClassName = {};
    hackClassName[c.name] = class extends c {
      constructor(...args: any[]) {
        super(...args);
        if (SUSPEND_VALIDATION)
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
    return decorated;
  }
}

