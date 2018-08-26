import {Schema} from "./schema";
import {entries} from "./impl/util";
import {EqualsSchema} from "./impl/eq";
import {ObjectSchema} from "./impl/associative/obj";

export type Schemaish = Schema<any, any> | Function | number | string | boolean | object;

export function schematizeEntries(object: Object) {
  const fixed = {};
  for (const [k, v] of entries(object)) {
    fixed[k] = schematize(v);
  }
  return fixed;
}

export function schematize<IN, OUT>(x: Schemaish): Schema<IN, OUT> {
  switch (typeof x) {
    case "string":
    case "number":
    case "boolean":
      return new EqualsSchema(x)  as any as Schema<IN, OUT>;

    case "object":
      const obj = (x as object);

      if ('conform' in obj && typeof x['conform'] === "function")
        return x as Schema<IN, OUT>;

      else if (Object.getPrototypeOf(x) === Object.prototype)
        return new ObjectSchema(schematizeEntries(obj)) as any as Schema<IN, OUT>;

      else
        throw Error(`Cannot build schema from non-plain object ${Object.getPrototypeOf(x).name}`);

    default:
      throw Error(`Cannot build schema from ${typeof x}: ${x}`);
  }
}