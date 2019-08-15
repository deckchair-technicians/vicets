import {ValidationResult} from "./impl";

export type SchemaDefinitions = { [k: string]: Schema | SchemaDefinitions };

export interface Schema<IN = any, OUT = any> {
  conform(value: IN): ValidationResult<OUT>

  and<NEWOUT>(s: Schema<OUT, NEWOUT>): Schema<IN, NEWOUT>

  or<NEWIN extends IN, NEWOUT>(s: Schema<IN, NEWOUT>): Schema<IN, OUT | NEWOUT>

  __(): OUT

  /**
   * Produces JSON schema
   * @toJson: function to turn subschemas into json
   */
  toJSON(toJson?:(s:Schema)=>any): any;
}