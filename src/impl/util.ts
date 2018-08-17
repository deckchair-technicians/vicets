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

export type Constructor<T={}> =  new(...args: any[]) => T ;

export function unsafeCast<T>(x: any): T {
  return x as T;
}

export function mapKeyValue<K,V, NEWK, NEWV>(f:(k:K,v:V)=>[NEWK,NEWV], m:Map<K,V>):Map<NEWK,NEWV>{
  const result = new Map<NEWK,NEWV>();
  for (const [k, v] of m.entries()) {
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
  for (const v of coll) {
    return v;
  }
}

export function typeDescription(x: any): string {
  if(x===null)
    return 'null';

  let t = typeof x;
  if(t!=='object')return t;

  const p = Object.getPrototypeOf(x);
  if (p !== Object.prototype)
    return p.constructor.name;

  return t
}

export function entries(x:{}) : [string, any][] {
  return Object.keys(x).map((k:string):[string,any]=>[k,x[k]]);
}