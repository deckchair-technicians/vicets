import {
  Associative,
  BaseSchema,
  conformInPlace,
  failure,
  ObjectSchema,
  Schema,
  subSchemaJson,
  ValidationResult
} from "../";
import {typeDescription} from "../util/types";

export class MapSchema<K, V> extends BaseSchema<any, Map<K, V>> {
  constructor(private readonly subSchema: ObjectSchema<any>) {
    super();
  }

  conform(value: any): ValidationResult<Map<K, V>> {
    if (value === undefined || value === null)
      return failure('no value');

    if (!(value instanceof Map || typeof value === 'object'))
      return failure(`expected a Map or object but got ${typeDescription(value)}`);

    const instance = new Map<K, V>();
    const kvs = value instanceof Map ? value.entries() : Object.entries(value);
    for (let [k, v] of kvs) {
      instance.set(k, v);
    }
    const problems = conformInPlace(
      instance as any as Associative<K, V>,
      this.subSchema.fieldSchemaArray as any);
    return problems ? problems : instance;
  }

  toJSON(toJson?: (s: Schema) => any): any {
    return subSchemaJson(this.subSchema, toJson);
  }
}



