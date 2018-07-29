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
  constructor(values: object) {}
}

export function data<T extends { new (...args: any[]): {} }>(constructor: T) {

  let recordConstructor = class extends constructor {
    constructor(...args: any[]) {
      super(false, ...args);

      if(typeof args[0] === 'boolean' && !args[0]) return;

      let schema = schematize(this);
      let conformed = schema.conform(args[0]);

      if(isError(conformed)) {
        const e = new Error(`Error constructing instance of ${constructor.name}: ${conformed}`);
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

    }
  };

  recordConstructor.prototype.constructor = constructor;
  return recordConstructor;
}

export function build<T extends Record>(c: { new(...args: any[]): T }, values: object): T {
    return new c(values);
}