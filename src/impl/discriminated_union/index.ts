import {DataSchema} from "../../data";
import {failure, Problems} from "../../problems";
import {Schema} from "../../schema";
import {UnexpectedItemBehaviour} from "../../unexpected_items";
import {BaseSchema} from "../";
import {Constructor} from "../util/types";
import {mapValues} from "../util/maps";
import {PrimitiveValue} from "../util/types";
import {discriminatorReports} from "./find_discriminators";

export class DiscriminatedUnionSchema<T extends object> extends BaseSchema<any, T> {
  private readonly discriminator: keyof T;
  private readonly schemasByDiscriminatorValue: Map<PrimitiveValue, Schema<any, T>>;

  constructor(ctors: Constructor<T>[], discriminator: keyof T, unexpected: UnexpectedItemBehaviour = UnexpectedItemBehaviour.PROBLEM) {
    super();

    this.discriminator = discriminator;

    const report = discriminatorReports(ctors);
    const schemasByValue = report.validFields.get(this.discriminator);
    if (schemasByValue === undefined)
      throw new Error(`Discriminator '${discriminator}' is not valid: ${report.problems.get(discriminator) || 'not found in classes'}.`);

    this.schemasByDiscriminatorValue = mapValues((v) => new DataSchema(v, unexpected), schemasByValue);
  }

  conform(value: object): Problems | T {
    if (typeof value !== 'object')
      return failure(`expected an object but got ${typeof value}`);

    if (!(this.discriminator in value))
      return failure(
        "no value",
        [this.discriminator]);

    const schema = this.schemaFor(value);
    if (schema === undefined)
      return failure(
        `expected one of [${Array.from(this.schemasByDiscriminatorValue.keys()).join(", ")}]`,
        [this.discriminator]);

    return schema.conform(value);
  }

  private schemaFor(value: object): Schema<any, T> | undefined {
    const discriminatorValue = value[this.discriminator as string | symbol];
    return this.schemasByDiscriminatorValue.get(discriminatorValue);
  }
}

