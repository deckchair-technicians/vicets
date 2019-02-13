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

export type Constructor<T = any> = new(...args: any[]) => T ;

export function unsafeCast<T>(x: any): T {
  return x as T;
}

export function mapKeyValue<K, V, NEWK, NEWV>(f: (k: K, v: V) => [NEWK, NEWV], m: Map<K, V>): Map<NEWK, NEWV> {
  const result = new Map<NEWK, NEWV>();
  for (const [k, v] of m.entries()) {
    const [nk, nv] = f(k, v);
    result.set(nk, nv);
  }
  return result;
}

export function mapKeys<K, V, NEWK>(f: (k: K) => NEWK, m: Map<K, V>): Map<NEWK, V> {
  return mapKeyValue((k, v) => [f(k), v], m);
}

export function mapValues<K, V, NEWV>(f: (v: V) => NEWV, m: Map<K, V>): Map<K, NEWV> {
  return mapKeyValue((k, v) => [k, f(v)], m);
}

export function first<T>(coll: Iterable<T>): T | undefined {
  // noinspection LoopStatementThatDoesntLoopJS
  for (const v of coll) {
    return v;
  }
}

export function typeDescription(x: any): string {
  if (x === null)
    return 'null';

  let t = typeof x;
  if (t !== 'object') return t;

  const p = Object.getPrototypeOf(x);
  if (p !== Object.prototype)
    return p.constructor.name;

  return t
}

export function entries(x: {}): [string, any][] {
  return Object.keys(x).map((k: string): [string, any] => [k, x[k]]);
}

export function toMap<K, V>(x: {}): Map<K, V> {
  const result = new Map<K, V>();
  for (let [k, v] of entries(x)) {
    result.set(
      k as any as K,
      v as any as V);
  }
  return result;
}

export function merge<A extends object, B extends object>(a: A, b: B, conflictFn: (a, b) => any): A & B {
  const result = {};
  for (const k in a) {
    result[k.toString()] = a[k];
  }
  for (const k in b) {
    if (k in result) {
      const kk = k as any as keyof A & keyof B;
      result[k.toString()] = conflictFn(a[kk], b[kk]);
    }
    else {
      result[k.toString()] = b[k];
    }
  }
  return result as any as A & B;
}

export function mergeMaps<K, V>(a: Map<K, V>, b: Map<K, V>, conflictFn: (a: V, b: V) => V): Map<K, V> {
  const result = new Map<K, V>();
  for (const [k, v] of a.entries()) {
    result.set(k, v);
  }
  for (const [k, v] of b.entries()) {
    if (result.has(k)) {
      result.set(k, conflictFn(a.get(k)!, v));
    }
    else {
      result.set(k, v);
    }
  }
  return result;
}

export function identity<T>(t: T): T {
  return t;
}

export function utcDate(year: number, month: number, date: number, hours?: number, minutes?: number, seconds?: number, ms?: number): Date {
  const ts = ms ? Date.UTC(year, month, date, hours, minutes, seconds, ms)
    :seconds ? Date.UTC(year, month, date, hours, minutes, seconds)
      : minutes ? Date.UTC(year, month, date, hours, minutes)
        : hours ? Date.UTC(year, month, date, hours)
          : Date.UTC(year, month, date);
  return new Date(ts)
}

export function addGetter<T, K extends keyof T>(obj: T, k: K, getter: () => T[K]): T {
  Object.defineProperty(obj, k, {
    enumerable: true,
    configurable: true,
    get: getter
  });
  return obj;
}

export type GetterMapper<A, B extends { [K in keyof A]: B[K] }> = <K extends keyof A>(original: A, mapped: B, k: K) => () => B[K];

export function mapGetters<A, B extends { [K in keyof A]: B[K] }>(original: A, mapper: GetterMapper<A, B>): B {
  return Object
    .keys(original)
    .reduce((mapped, k) => addGetter(mapped, k as any, mapper(original, mapped, k as keyof A)), <B>{});
}

export function copyGetters<T>(original: T): T {
  return Object
    .keys(original)
    .reduce((mapped, k) => addGetter(mapped, k as any, ()=>original[k]),
      <T>{});
}
