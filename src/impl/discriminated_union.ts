import {Problems} from "../";
import {Constructor, isPrimitive, primitive} from "./util";
import {EqualsSchema} from "./eq";
import {BaseSchema} from "./index";
import {failure} from "../problems";
import {isdata, Schema} from "../schema";
import {ObjectSchema} from "./obj";
import {SCHEMA_SYMBOL} from "../data";

function extractSchema(ctor): ObjectSchema {
  if (!(SCHEMA_SYMBOL in ctor))
    throw new Error(`No 'schema' on ${ctor.name}- not annotated with @data?`);
  return ctor[SCHEMA_SYMBOL];
}

type Discriminators<T> = { [k: string]: Map<primitive, Schema<any, T>> };

export function discriminators<T>(ctors: Constructor<T>[]): Discriminators<T> {
  return ctors.reduce(collectDiscriminators, {});
}

function collectDiscriminators<T>(found: Discriminators<T>,
                                         ctor: Constructor<T>): Discriminators<T> {
  let s = extractSchema(ctor);
  for (let [k, v] of s.schemas.entries()) {
    if (v instanceof EqualsSchema && isPrimitive(v.expected)) {
      if (!found[k]) found[k] = new Map();
      found[k] = found[k].set(v.expected, isdata(ctor));
    }
  }
  return found;
}

export class DiscriminatedUnionSchema<T> extends BaseSchema<object, T> {
  private readonly discriminator: string;
  private readonly schemasByDiscriminatorValue: Map<primitive, Schema<any, T>>;

  constructor(ctors: Constructor<T>[], discriminator: keyof T) {
    super();

    const ds = discriminators(ctors);

    if (!(discriminator in ds))
      throw new Error(`Discriminator '${discriminator}' is not shared between: ${ctors.map(c => c.name).join(", ")}.`);

    this.discriminator = discriminator ? discriminator.toString() : Object.keys(ds)[0];
    this.schemasByDiscriminatorValue = ds[this.discriminator];
  }


  conform(value: object): Problems | T {
    let discriminatorValue = value[this.discriminator];
    if (!(this.discriminator in value))
      return failure(
        "no value",
        [this.discriminator]);

    let schema = this.schemasByDiscriminatorValue.get(discriminatorValue);
    if (schema === undefined)
      return failure(
        `expected one of [${Array.from(this.schemasByDiscriminatorValue.keys()).join(", ")}]`,
        [this.discriminator]);

    return schema.conform(value);
  }

}