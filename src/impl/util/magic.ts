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
    .reduce((mapped, k) => addGetter(mapped, k as any, () => original[k]),
      <T>{});
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