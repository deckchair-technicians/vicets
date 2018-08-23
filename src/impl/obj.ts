import {failure, ValidationResult} from "../problems";
import {Schema} from "../schema";
import {merge} from "./util";
import {AssociativeSchema, AssociativeStrategies} from "./associative";

class ObjectStrategies implements AssociativeStrategies<object> {
  set(result: {}, k: any, v: any): {} {
    result[k] = v;
    return result
  }

  has(result: {}, k: any): boolean {
    return k in result;
  }

  get(result: {}, k: any): any {
    return result[k];
  }
}

export class ObjectSchema extends AssociativeSchema<object> {
  constructor(fieldSchemas: object) {
    super(fieldSchemas, new ObjectStrategies());
  }

  conform(value: any): ValidationResult<object> {
    if (value === undefined || value === null)
      return failure('no value');

    if (typeof value !== 'object')
      return failure(`expected an object but got ${typeof value}`);

    const instance = {};
    Object.assign(instance, value);
    const problems = this.conformInPlace(instance);
    return problems ? problems : instance;
  }

  intersect(other: this): this {
    const mergedSchemas = merge(this.fieldSchemas, other.fieldSchemas, (a: Schema, b: Schema) => a.and(b));
    return new ObjectSchema(mergedSchemas) as this;
  }
}



