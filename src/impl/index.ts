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

export abstract class StringSchema extends BaseSchema<any, string> {
  conform(value: any): Problems | string {
    if(typeof value === 'string' || value instanceof String)
      return this.conformString(value as string);
    return failure('expected a string');
  }

  abstract conformString(value: string) : Problems | string;
}

export abstract class NumberSchema extends BaseSchema<any, number> {
  conform(value: any): Problems | number {
    if(typeof value === 'number' || value instanceof Number)
      return this.conformNumber(value as number);
    return failure('expected a number');
  }

  abstract conformNumber(value: number) : Problems | number;
}

export class DelegatingSchema<IN, OUT> extends BaseSchema<IN, OUT> {
    constructor(private readonly delegatedConform: (value: IN) => Problems | OUT) {
        super();
    }

    conform(value: IN): Problems | OUT {
        return this.delegatedConform(value);
    }
}