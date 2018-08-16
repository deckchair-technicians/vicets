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

export type PrimitiveValue = string | number | boolean;

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

export type Constructor<T={}> =  new(...args: any[]) => T ;

export function unsafeCast<T>(x: any): T {
  return x as T;
}

export function mapKeyValue<K,V, NEWK, NEWV>(f:(k:K,v:V)=>[NEWK,NEWV], m:Map<K,V>):Map<NEWK,NEWV>{
  const result = new Map<NEWK,NEWV>();
  for (let [k, v] of m.entries()) {
    const [nk,nv] = f(k,v);
    result.set(nk,nv);
  }
  return result;
}

export function mapKeys<K,V,NEWK>(f:(k:K)=>NEWK, m:Map<K,V>):Map<NEWK,V>{
  return mapKeyValue((k,v)=>[f(k), v], m);
}

export function mapValues<K,V,NEWV>(f:(v:V)=>NEWV, m:Map<K,V>):Map<K,NEWV>{
  return mapKeyValue((k,v)=>[k, f(v)], m);
}

export function first<T>(coll:Iterable<T>) : T | undefined{
  // noinspection LoopStatementThatDoesntLoopJS
  for (let v of coll) {
    return v;
  }
}

export function typeDescription(x: any): string {
  const t = typeof x;
  if (t !== 'object')
    return t;

  let p = Object.getPrototypeOf(x);
  if (p !== Object.prototype)
    return p.constructor.name;

  return t
}