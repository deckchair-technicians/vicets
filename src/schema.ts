import {Problems, ValidationResult} from "./problems";

export interface Schema<IN=any, OUT=any> {
  conform(value: IN): ValidationResult<OUT>

  and<NEWOUT>(s: Schema<OUT, NEWOUT>): Schema<IN, NEWOUT>

  or<NEWIN extends IN, NEWOUT>(s: Schema<IN, NEWOUT>): Schema<IN, OUT | NEWOUT>

  __(): OUT
}