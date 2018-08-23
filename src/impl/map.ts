import {failure, ValidationResult} from "../problems";
import {Schema} from "../schema";
import {entries, merge, typeDescription} from "./util";
import {AssociativeSchema, AssociativeStrategies} from "./associative";

class MapStrategies<K,V> implements AssociativeStrategies<Map<K,V>> {
  set(result: Map<K,V>, k: any, v: any): Map<K,V> {
    result.set(k,v);
    return result
  }

  has(result: Map<K,V>, k: any): boolean {
    return result.has(k);
  }

  get(result: Map<K,V>, k: any): any {
    return result.get(k);
  }
}

export class MapSchema<K,V> extends AssociativeSchema<Map<K,V>> {
  constructor(fieldSchemas: object) {
    super(fieldSchemas, new MapStrategies<K,V>());
  }

  conform(value: any): ValidationResult<Map<K,V>> {
    if (value === undefined || value === null)
      return failure('no value');

    if (!(value instanceof Map || typeof value === 'object'))
      return failure(`expected a Map or object but got ${typeDescription(value)}`);

    const instance = new Map<K,V>();
    const kvs = value instanceof Map ? value.entries() : entries(value);
    for (let [k, v] of kvs) {
      instance.set(k,v);
    }
    const problems = this.conformInPlace(instance);
    return problems ? problems : instance;
  }

  intersect(other: this): this {
    const mergedSchemas = merge(this.fieldSchemas, other.fieldSchemas, (a: Schema, b: Schema) => a.and(b));
    return new MapSchema(mergedSchemas) as this;
  }
}



