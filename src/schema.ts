import {Problems} from "./problems";

export interface Schema<IN=any, OUT=any> {
  conform(this: this, value: IN): Problems | OUT

  and<NEWOUT>(this: this, s: Schema<OUT, NEWOUT>): Schema<IN, NEWOUT>

  or<NEWIN extends IN, NEWOUT>(this: this, s: Schema<IN, NEWOUT>): Schema<IN, OUT | NEWOUT>

  __(this: this): OUT
}