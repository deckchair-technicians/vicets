import {Problems, schematize} from "./index";
import {BaseSchema} from "./impl/index";

function renameFunction(name: string, fn: (...args: any[]) => any) {
  // It seems like we should be able to
  // Object.defineProperty("name" ...
  // But in practise this doesn't seem to work- the debugger still lists the original name.
  let function2 = new Function("return function (call) { return function " + name +
    " () { return call(this, arguments) }; };");
  return (function2())(Function.apply.bind(fn));
}

let VALIDATE = true;

function suspendValidation<T>(f: () => T): T {
    try {
        VALIDATE = false;
        return f();
    } finally {
        VALIDATE = true;
    }
}


class ValidationError extends Error {
  constructor(public readonly problems: Problems) {
      super(`Validation failed: ${problems}`);
  }
}

export function data<T extends Object>(c: { new(...args: any[]): T }) {
    let objectWithDefaults = suspendValidation(() => new c());

    let schema = schematize(objectWithDefaults);

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
    decorated.schema = schema;
    return decorated;
}

let BUILD_FROM_POJO = false;

export function build<T>(c: { new(...args: any[]): T }, values: object): T {
    try {
        BUILD_FROM_POJO = true;
        return new c(values);
    } finally {
        BUILD_FROM_POJO = false;
    }
}

export class RecordSchema<T> extends BaseSchema<any, T> {
    constructor(private readonly c: { new(...args: any[]): T }) {
        super();
    }

    conform(value: any): Problems | T {
        if(value instanceof this.c) return value;

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