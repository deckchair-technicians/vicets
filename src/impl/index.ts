import {failure, isSuccess, Problems, ValidationResult} from "../problems";
import {typeDescription} from "./util";
import {Schema} from "../schema";

export abstract class BaseSchema<IN=any, OUT=any> implements Schema<IN, OUT> {
  or<NEWIN extends IN, NEWOUT>(s: Schema<IN, NEWOUT>): Schema<IN, OUT | NEWOUT> {
    return new OrSchema<IN, OUT, NEWOUT>(this, s);
  }

  and<NEWOUT>(s: Schema<OUT, NEWOUT>): Schema<IN, NEWOUT> {
    return new AndSchema(this, s)
  }

  __<FAKED extends OUT>(): FAKED {
    return this as any as FAKED;
  }

  abstract conform(value: IN): ValidationResult<OUT>;

}

export class AndSchema<IN, INTERMEDIATE, OUT> extends BaseSchema<IN, OUT> {
  constructor(private readonly first: Schema<IN, INTERMEDIATE>,
              private readonly second: Schema<INTERMEDIATE, OUT>) {
    super();
  }

  conform(value: IN): ValidationResult<OUT> {
    const intermediate = this.first.conform(value);

    if (intermediate instanceof Problems) return intermediate;

    return this.second.conform(intermediate)
  }
}

export class OrSchema<IN, OUT1, OUT2> extends BaseSchema<IN, OUT1 | OUT2> {
  constructor(private readonly first: Schema<IN, OUT1>,
              private readonly second: Schema<IN, OUT2>) {
    super();
  }

  conform(value: IN): ValidationResult<OUT1 | OUT2> {
    const failures: Problems[] = [];
    for (const s of [this.first, this.second]) {
      const result = s.conform(value);

      if (isSuccess(result)) return result;

      failures.push(result as Problems);
    }
    return failures.reduce((a: Problems | null, ps: Problems) => a ? a.merge(ps) : ps);
  }

}

export abstract class StringSchema extends BaseSchema<any, string> {
  conform(value: any): ValidationResult<string> {
    if (typeof value === 'string' || value instanceof String)
      return this.conformString(value as string);
    return failure(`expected a string but got ${typeDescription(value)}`);
  }

  abstract conformString(value: string): ValidationResult<string>;
}


export class DelegatingSchema<IN, OUT> extends BaseSchema<IN, OUT> {
  constructor(private readonly delegatedConform: (value: IN) => Problems | OUT) {
    super();
  }

  conform(value: IN): ValidationResult<OUT> {
    return this.delegatedConform(value);
  }
}

export function isSchema(value: any): boolean {
  return value instanceof BaseSchema;
}