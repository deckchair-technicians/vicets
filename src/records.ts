import {isError, schematize} from "./schema";

function renameFunction(name, fn) {
    // It seems like we should be able to
    // Object.defineProperty("name" ...
    // But in practise this doesn't seem to work- the debugger still lists the original name.
    let function2 = new Function("return function (call) { return function " + name +
        " () { return call(this, arguments) }; };");
    return (function2())(Function.apply.bind(fn));
}

export class Record {
    constructor(values: object) {
    }
}

export function data(c: { new(values: object): {} }) {
    let objectWithDefaults = new c({});

    let schema = schematize(objectWithDefaults);

    let newConstructor = function (plainObject: object) {
        let conformed = schema.conform(plainObject);
        if(isError(conformed)) {
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
        Object.seal(this);
        Object.freeze(this);
    };

    const decorated = renameFunction(c.name, newConstructor);
    decorated.prototype = c.prototype;
    return decorated;
}

export function build<T extends Record>(c: { new(...args: any[]): T }, values: object): T {
    return new c(values);
}