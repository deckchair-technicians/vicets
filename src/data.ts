import {hasSchema, schemaOf, suspendValidation} from "./hasschema";
import {BaseSchema, isSchema} from "./impl";
import {StrictPattern} from "./impl/associative/associative";
import {ObjectSchema} from "./impl/associative/obj";
import {Constructor} from "./impl/util/types";
import {isPrimitive} from "./impl/util/types";
import {failure, Problems, ValidationError, ValidationResult} from "./problems";
import {schematizeEntries} from "./schematize";
import {MissingItemBehaviour, UnexpectedItemBehaviour} from "./unexpected_items";


export function data<C extends Constructor>(c: C): C {
  // suspendValidation is required to allow calling parent constructor
  const objectWithDefaults = suspendValidation(() => new c() as StrictPattern<C>);

  for (const [k, v] of Object.entries(objectWithDefaults)) {
    if (!(isSchema(v) || isPrimitive(v)))
      throw new Error(`Field '${k}' on ${c.name} is neither a schema nor a primitive value`);
  }

  const schema = new ObjectSchema<C>(schematizeEntries(objectWithDefaults), UnexpectedItemBehaviour.PROBLEM, MissingItemBehaviour.PROBLEM);
  return hasSchema(schema)(c);
}

export function intersect<A extends object, B extends object>
(a: Constructor<A>, b: Constructor<B>): Constructor<A & B> {

  const schema: ObjectSchema<A & B> = schemaOf(a).intersect(schemaOf(b));

  @hasSchema(schema as any)
  class Intersection {
  }

  for (let id in a.prototype) {
    (<any>Intersection.prototype)[id] = (<any>a.prototype)[id];
  }
  for (let id in b.prototype) {
    if (!Intersection.prototype.hasOwnProperty(id)) {
      (<any>Intersection.prototype)[id] = (<any>b.prototype)[id];
    }
  }
  return Intersection as any as Constructor<A & B>;
}

export function makeInstance<T>(c: Constructor<T>, obj: object): T {
  return Object.assign(Object.create(c.prototype), obj);
}

export function conformAs<T extends object>(c: Constructor<T>, obj: object, unexpected: UnexpectedItemBehaviour = UnexpectedItemBehaviour.PROBLEM): ValidationResult<T> {
  const result = schemaOf(c).onUnexpected(unexpected).conform(obj);
  if (result instanceof Problems)
    return result;
  return makeInstance(c, result);
}

export function build<T extends object>(c: Constructor<T>, values: {}, unexpected: UnexpectedItemBehaviour = UnexpectedItemBehaviour.PROBLEM): T {
  const conformed = conformAs(c, values, unexpected);
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
export function construct<T extends object>(c: Constructor<T>, value: T): T {
  return build(c, value);
}

export class DataSchema<T extends object> extends BaseSchema<any, T> {
  constructor(private readonly c: Constructor<T>, private readonly unexpected: UnexpectedItemBehaviour) {
    super();
    schemaOf(c);
  }

  conform(value: any): Problems | T {
    if (value instanceof this.c) return value;
    if (typeof value !== 'object') return failure(`Expected an object but got a ${typeof value}`);

    try {
      return build(this.c, value, this.unexpected)
        ;
    } catch (e) {
      if (e instanceof ValidationError) {
        return e.problems;
      }
      throw e;
    }
  }
}
