import {DataSchema} from "./data";
import {isSchema} from "./impl";
import {merge} from "./impl/util/maps";
import {Schema, SchemaDefinitions} from "./schema";

export function subSchemaJson(schema: Schema | Schema[], toJson?: (s: Schema) => any): any {
  toJson = toJson || ((s: Schema) => s.toJSON());
  return Array.isArray(schema)
    ? schema.map(toJson)
    : toJson(schema);
}

function refLookup(defs: SchemaDefinitions, path: string = "#/definitions"): Map<Schema, object> {
  return Object.entries(defs)
    .reduce((result, [k, schemaOrDefs]) => {
      const itemPath = `${path}/${k}`;
      if (isSchema(schemaOrDefs)) {
        if (schemaOrDefs instanceof DataSchema)
          schemaOrDefs = schemaOrDefs.subSchema;
        result.set(schemaOrDefs, {$ref: itemPath});
        return result;
      }
      else {
        const lookup = refLookup(schemaOrDefs, itemPath);
        return merge(result, lookup, () => {
          throw new Error('Should never happen')
        });
      }

    }, new Map<Schema, object>());

}

function definitionsJson(defs: SchemaDefinitions, toJson: (s: Schema) => any): object {
  return Object.entries(defs)
    .reduce((result, [k, schemaOrDefs]) => {
      if (isSchema(schemaOrDefs))
        result[k] = schemaOrDefs.toJSON(toJson);
      else
        result[k] = definitionsJson(schemaOrDefs, toJson);
      return result;
    }, {});

}

export interface JsonSchemaOpts {
  id: string,
  definitions: SchemaDefinitions;
}

export function jsonSchema(opts: JsonSchemaOpts) {
  const lookup = refLookup(opts.definitions);

  function subschema(schema: Schema): any {
    if (schema instanceof DataSchema)
      schema = schema.subSchema;
    const ref = lookup.get(schema);
    const result = ref || schema.toJSON(subschema);
    return result;
  }

  const definitions = definitionsJson(opts.definitions, subschema);

  return {
    ...(opts.id && {id: opts.id}),
    $schema: "http://json-schema.org/draft-07/schema#",
    definitions,
  };
}