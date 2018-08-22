import {BaseSchema} from "./index";
import {Problems} from "../problems";
import {Schema} from "../schema";

export class DeferredSchema<IN, OUT> extends BaseSchema<IN, OUT> {
  constructor(private readonly deferred: () => Schema<IN, OUT>) {
    super();
  }

  conform(value: IN): Problems | OUT {
    return this.deferred().conform(value);
  }
}