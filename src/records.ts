import {isError, schematize} from "./schema";

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
    VALIDATE = false;
    const result = f();
    VALIDATE = true;
    return result;
}

export function data(c: { new(...args: any[]): {} }) {
    let objectWithDefaults = suspendValidation(() => new c());

    let schema = schematize(objectWithDefaults);

    let newConstructor = function (...args: any[]) {
        if (BUILD_FROM_POJO === true) {
            let conformed = schema.conform(args[0]);
            if (isError(conformed)) {
                const e = new Error(`${conformed}`);
                e['problems'] = conformed;
                throw e;
            }
            for (let k in conformed) {
                let value = conformed[k];
                Object.seal(value);
                Object.freeze(value);
                this[k] = value;
            }
        } else {
            let instance = new c(...args);
            if (VALIDATE === false) {
                return instance;
            }
            let conformed = schema.conform(instance);
            if (isError(conformed)) {
                const e = new Error(`${conformed}`);
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
    BUILD_FROM_POJO = true;
    let instance = new c(values);
    BUILD_FROM_POJO = false;
    return instance;
}