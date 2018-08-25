import {failure, ValidationResult} from "../../problems";
import {Schema} from "../../schema";
import {entries, mergeMaps, typeDescription} from "../util";
import {conformInPlace} from "./associative";
import {BaseSchema} from "../index";

export class MapSchema<K, V> extends BaseSchema<string, Map<K, V>> {
  constructor(private readonly itemSchemas: Map<K, Schema<any, V>>) {
    super();
  }

  conform(value: any): ValidationResult<Map<K, V>> {
    if (value === undefined || value === null)
      return failure('no value');

    if (!(value instanceof Map || typeof value === 'object'))
      return failure(`expected a Map or object but got ${typeDescription(value)}`);

    const instance = new Map<K, V>();
    const kvs = value instanceof Map ? value.entries() : entries(value);
    for (let [k, v] of kvs) {
      instance.set(k, v);
    }
    const problems = conformInPlace(instance, this.itemSchemas.entries());
    return problems ? problems : instance;
  }

  intersect(other: this): this {
    const mergedSchemas = mergeMaps(this.itemSchemas, other.itemSchemas, (a: Schema, b: Schema) => a.and(b));
    return new MapSchema(mergedSchemas) as this;
  }
}



