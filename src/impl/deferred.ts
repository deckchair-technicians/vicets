import {BaseSchema} from "./index";
import {ValidationResult} from "../problems";
import {Schema} from "../schema";

export class DeferredSchema<IN, OUT> extends BaseSchema<IN, OUT> {
  constructor(private readonly deferred: () => Schema<IN, OUT>) {
    super();
  }

  conform(value: IN): ValidationResult<OUT> {
    return this.deferred().conform(value);
  }
}