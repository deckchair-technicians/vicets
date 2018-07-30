import {Problems, schematize} from "./schema";
import {BaseSchema} from "./impl/schema";
import * as util from "util";

function renameFunction(name, fn) {
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


// Custom Error 1
const ValidationError = function (problems: Problems) {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = `Validation failed: ${problems}`;
    this.problems = problems;
};
util.inherits(ValidationError, Error);

export function data(c: { new(...args: any[]): {} }) {
    let objectWithDefaults = suspendValidation(() => new c());

    let schema = schematize(objectWithDefaults);

    let newConstructor = function (...args: any[]) {
        if (BUILD_FROM_POJO === true) {
            let values = args[0];
            let conformed = schema.conform(values);
            if (conformed instanceof Problems) {
                const e = new ValidationError(conformed);
                e['problems'] = conformed;
                throw e;
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
                const e = new ValidationError(conformed);
                e['problems'] = conformed;
                throw e;
            }
            for (let k in conformed) {
                this[k] = conformed[k];
            }
        }
    };

    const decorated = renameFunction(c.name, newConstructor);
    decorated.prototype = c.prototype;
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