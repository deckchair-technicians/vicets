import {Problems} from "./";
import {BaseSchema} from "./impl";
import {ObjectSchema} from "./impl/obj";
import {Constructor, renameFunction} from "./impl/util";
import {ValidationError} from "./problems";

let VALIDATE = true;

function suspendValidation<T>(f: () => T): T {
  try {
    VALIDATE = false;
    return f();
  } finally {
    VALIDATE = true;
  }
}


export const SCHEMA_SYMBOL = Symbol('schema');

export function data<T extends Object>(c: Constructor<T>) {
  let objectWithDefaults = suspendValidation(() => new c());

  let schema = new ObjectSchema(objectWithDefaults);

  let newConstructor = function (...args: any[]) {
    if (BUILD_FROM_POJO === true) {
      let values = args[0];
      let conformed = schema.conform(values);
      if (conformed instanceof Problems) {
        throw new ValidationError(conformed);
      }
      for (let k in conformed) {
        this[k] = conformed[k];
      }
    } else {
      let instance = new c(...args);
      if (VALIDATE === false) {
        return instance;
      }
      let conformed = schema.conform(instance);
      if (conformed instanceof Problems) {
        throw new ValidationError(conformed);
      }
      for (let k in conformed) {
        this[k] = conformed[k];
      }
    }
  };

  const decorated = renameFunction(c.name, newConstructor);
  decorated.prototype = c.prototype;
  decorated[SCHEMA_SYMBOL] = schema;
  return decorated;
}

let BUILD_FROM_POJO = false;

export function build<T>(c: Constructor<T>, values: object): T {
  try {
    BUILD_FROM_POJO = true;
    return new c(values);
  } finally {
    BUILD_FROM_POJO = false;
  }
}

export class DataSchema<T> extends BaseSchema<any, T> {
  constructor(private readonly c: Constructor<T>) {
    super();
  }

  conform(value: any): Problems | T {
    if (value instanceof this.c) return value;

    try {
      return new this.c(value);
    } catch (e) {
      if (e instanceof ValidationError) {
        return e.problems;
      }
      throw e;
    }
  }

}