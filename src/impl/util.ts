import { discriminators} from "./discriminated_union";

export function detectDiscriminator<T>(ctors: Constructor<T>[]): keyof T {
  let ds = discriminators(ctors);
  if (!ds)
    throw new Error(`No discriminating field is shared between: ${ctors.map(c => c.name).join(", ")}.`);

  if (Object.keys(ds).length > 1)
    throw new Error(`Multiple possible discriminators - pick one from [${Object.keys(ds).join(", ")}].`);

  return Object.keys(ds)[0] as keyof T;

}

export function buildPredicateMessageFunction(message: ((value: any) => string) | string | undefined, predicate: (x: any) => boolean): (value: any) => string {
  switch (typeof  message) {
    case 'string':
      return () => message as string;
    case 'function':
      return message as () => string;
    case 'undefined':
      return () => predicate.toString();
    default:
      throw new Error(`Not a valid message ${message}`);
  }
}

export type primitive = string | number | boolean;

export function isPrimitive(value: any): boolean {
  return (typeof value !== 'object' && typeof value !== 'function') || value === null
}

export function renameFunction(name: string, fn: (...args: any[]) => any) {
  // It seems like we should be able to
  // Object.defineProperty("name" ...
  // But in practise this doesn't seem to work- the debugger still lists the original name.
  let function2 = new Function("return function (call) { return function " + name +
    " () { return call(this, arguments) }; };");
  return (function2())(Function.apply.bind(fn));
}

export type Constructor<T> = { new(...args: any[]): T };