import {BaseSchema} from "./index";
import {failure, isError, Problems, ValidationResult} from "../problems";
import {Schema} from "../schema";
import {typeDescription} from "./util";

export class ObjectSchema extends BaseSchema<object, object> {
  public readonly fieldSchemas: Map<string,Schema<any, any>> = new Map<string, Schema<any, any>>();

  constructor(object: object) {
    super();
    for (const k in object) {
      const s = object[k];
      if(!('conform' in s))
        throw new Error(`${k} was a ${typeDescription(s)}. Expected a schema`);

      this.fieldSchemas.set(k, s);
    }
  }

  conform(value: any): ValidationResult {
    if(value === undefined || value === null)
      return failure('no value');

    if(typeof value !== 'object')
      return failure(`expected an object but got ${typeof value}`);

    const instance = {};
    Object.assign(instance, value);
    const problems = this.conformInPlace(instance);
    return problems ? problems : instance;
  }

  conformInPlace(result: {}): Problems | undefined {
    let problems = new Problems([]);

    for (const [k,s] of this.fieldSchemas.entries()) {
      const v: ValidationResult = s.conform(result[k]);

      if (isError(v)){
        if(!(k in result))
          problems = problems.merge(failure("No value", [k]));
        problems = problems.merge((v as Problems).prefixPath([k]));
      }
      else
        if(k in result)
          result[k] = v;
    }

    return problems.problems.length > 0 ? problems : undefined;
  }

  toString(): string {
    return this.fieldSchemas.toString();
  }
}

