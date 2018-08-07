import {isdata, isin, object, Problems, Schema} from "../";
import {entries, isPrimitive, primitive} from "./util";
import {ObjectSchema} from "./obj";
import {EqualsSchema} from "./eq";
import {BaseSchema} from "./index";

export class DiscriminatedUnionSchema<T> extends BaseSchema<object, T> {
  private schema: Schema<any, T>;

  constructor(ctors: { new(...args: any[]): T }[], discriminator: keyof T) {
    super();

    const discriminators = DiscriminatedUnionSchema.discriminatorValues(ctors);

    if (!discriminators.hasOwnProperty(discriminator))
      throw new Error(`Discriminator '${discriminator}' is not shared between: ${ctors.map(c => c.name).join(", ")}.`);

    const d = discriminator ? discriminator.toString() : Object.keys(discriminators)[0];
    const o = {};
    o[d] = isin(...discriminators[d]);
    const validDiscriminator = object(o);

    this.schema = validDiscriminator.and(Array.from(ctors).map(isdata).reduce((prev, curr) => prev.or(curr)));
  }

  static discriminatorValues<T>(ctors: { new(...args: any[]): T }[]): { [k: string]: primitive[] } {
    return ctors.map(ctor => ctor['schema']).reduce(DiscriminatedUnionSchema.possibleDiscriminators, {});
  }

  private static possibleDiscriminators(found: { [k: string]: primitive[] }, s: ObjectSchema): { [k: string]: primitive[] } {
    for (let [k, v] of entries(s.schemas)) {
      if (v instanceof EqualsSchema && isPrimitive(v.expected)) {
        if (!found[k]) found[k] = [];
        found[k] = [...found[k], v.expected];
      }

    }
    return found;
  }

  conform(value: object): Problems | T {
    return this.schema.conform(value);
  }

}