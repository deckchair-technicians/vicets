import {
  Associative,
  BaseSchema,
  conformInPlace,
  failure,
  HasItemBehaviour,
  MissingItemBehaviour,
  Schema,
  strictestUnexpected,
  UnexpectedItemBehaviour,
  ValidationResult
} from "../";
import {merge} from "../util/maps";
import {typeDescription} from "../util/types";

export class MapSchema<K, V> extends BaseSchema<string, Map<K, V>> implements HasItemBehaviour {
  constructor(private readonly itemSchemas: Map<K, Schema<any, V>>,
              private readonly unexpectedItems: UnexpectedItemBehaviour) {
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
    const problems = conformInPlace(this.unexpectedItems, MissingItemBehaviour.PROBLEM, instance as any as Associative<K, V>, this.itemSchemas.entries());
    return problems ? problems : instance;
  }

  intersect(other: this): this {
    const mergedSchemas = merge(this.itemSchemas, other.itemSchemas, (a: Schema, b: Schema) => a.and(b));
    return new MapSchema(mergedSchemas, strictestUnexpected(this.unexpectedItems, other.unexpectedItems)) as this;
  }

  onUnexpected(behaviour: UnexpectedItemBehaviour): this {
    return new MapSchema(this.itemSchemas, behaviour) as this;
  }

  onMissing(behaviour: MissingItemBehaviour): this {
    throw new Error("Not implemented");
  }
}



