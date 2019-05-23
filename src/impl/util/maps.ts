export function mapKeyValue<K, V, NEWK, NEWV>(f: (k: K, v: V) => [NEWK, NEWV], m: Map<K, V>): Map<NEWK, NEWV> {
  const result = new Map<NEWK, NEWV>();
  for (const [k, v] of m.entries()) {
    const [nk, nv] = f(k, v);
    result.set(nk, nv);
  }
  return result;
}

export function mapValues<K, V, NEWV>(f: (v: V) => NEWV, m: Map<K, V>): Map<K, NEWV> {
  return mapKeyValue((k, v) => [k, f(v)], m);
}

export function merge<K, V>(a: Map<K, V>, b: Map<K, V>, conflictFn: (a: V, b: V) => V): Map<K, V> {
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

export function toMap<K, V>(x: {}): Map<K, V> {
  const result = new Map<K, V>();
  for (let [k, v] of Object.entries(x)) {
    result.set(
      k as any as K,
      v as any as V);
  }
  return result;
}