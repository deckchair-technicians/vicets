import {isSuccess, Problems, Schema} from "../";
import {failure} from "../problems";

export abstract class BaseSchema<IN, OUT> implements Schema<IN, OUT> {
    or<NEWIN extends IN, NEWOUT>(this: this, s: Schema<NEWIN, NEWOUT>): Schema<IN, OUT | NEWOUT> {
        return new OrSchema(this, s)
    }

    and<NEWOUT>(this: this, s: Schema<OUT, NEWOUT>): Schema<IN, NEWOUT> {
        return new AndSchema(this, s)
    }

    __<FAKED extends OUT>(this: this): FAKED {
        return this as any as FAKED;
    }

    abstract conform(value: IN): Problems | OUT;

}

export class AndSchema<IN, INTERMEDIATE, OUT> extends BaseSchema<IN, OUT> {
  constructor(private readonly first: Schema<IN, INTERMEDIATE>,
              private readonly second: Schema<INTERMEDIATE, OUT>) {
    super();
  }

  conform(value: IN): Problems | OUT {
    let intermediate = this.first.conform(value);

    if (intermediate instanceof Problems) return intermediate;

    return this.second.conform(intermediate)
  }
}

export class OrSchema<IN, OUT1, OUT2> extends BaseSchema<IN, OUT1 | OUT2> {
  constructor(private readonly first: Schema<IN, OUT1>,
              private readonly second: Schema<IN, OUT2>) {
    super();
  }

  conform(value: IN): Problems | (OUT1 | OUT2) {
    const failures: Problems[] = [];
    for (let s of [this.first, this.second]) {
      let result = s.conform(value);

      if (isSuccess(result)) return result;

      failures.push(result as Problems);
    }
    return failures.reduce((a: Problems | null, ps: Problems) => a ? a.merge(ps) : ps);
  }

}




}

export class DelegatingSchema<IN, OUT> extends BaseSchema<IN, OUT> {
    constructor(private readonly delegatedConform: (value: IN) => Problems | OUT) {
        super();
    }

    conform(value: IN): Problems | OUT {
        return this.delegatedConform(value);
    }
}