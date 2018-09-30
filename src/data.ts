import {BaseSchema, isSchema} from "./impl";
import {ObjectSchema} from "./impl/associative/obj";
import {Constructor, entries, isPrimitive} from "./impl/util";
import {failure, Problems, ValidationError} from "./problems";
import {schematizeEntries} from "./schematize";
import {UnexpectedItemBehaviour} from "./unexpected_items";
import {suspendValidation, hasSchema, schemaOf} from "./hasschema";



export function data<C extends Constructor>(c: C): C {
  // suspendValidation is required to allow calling parent constructor
  const objectWithDefaults = suspendValidation(() => new c());

  for (const [k, v] of entries(objectWithDefaults)) {
    if (!(isSchema(v) || isPrimitive(v)))
      throw new Error(`Field '${k}' on ${c.name} is neither a schema nor a primitive value`);
  }

  const schema = new ObjectSchema(schematizeEntries(objectWithDefaults), UnexpectedItemBehaviour.PROBLEM) as ObjectSchema;
  return hasSchema(schema)(c);
}

export function conform<T>(c: Constructor<T>, values: {}): Problems | T {
  const conformed = schemaOf(c).conform(values);
  if (conformed instanceof Problems) {
    return conformed;
  }
  return Object.assign(Object.create(c.prototype), conformed);
}

export function build<T>(c: Constructor<T>, values: {}): T {
  const conformed = conform(c, values);
  if (conformed instanceof Problems) {
    throw new ValidationError(values, conformed);
  }
  return conformed;
}

/**
 * Call this instead of build() when constructing data instances
 * by specifying fields in code. The compiler will complain if
 * fields are missing.
 *
 * `build(A, {})` will NOT cause the compiler to complain,
 * even if `{}` is missing fields `A` requires.
 *
 * `construct(A, {})` WILL cause the compiler to complain if
 * `{}` is missing fields `A` requires.
 */
export function construct<T>(c: Constructor<T>, value: T): T {
  return build(c, value);
}

export class DataSchema<T> extends BaseSchema<any, T> {
  constructor(private readonly c: Constructor<T>) {
    super();
  }

  conform(value: any): Problems | T {
    if (value instanceof this.c) return value;
    if (typeof value !== 'object') return failure(`Expected an object but got a ${typeof value}`);

    try {
      return build(this.c, value);
    } catch (e) {
      if (e instanceof ValidationError) {
        return e.problems;
      }
      throw e;
    }
  }

}
