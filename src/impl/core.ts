import {conform} from "../helpers";
import {failure, isError, isSuccess, Problems, ValidationResult} from "../problems";
import {Schema} from "../schema";
import {subSchemaJson} from "./";
import {typeDescription} from "./util/types";

export abstract class BaseSchema<IN = any, OUT = any> implements Schema<IN, OUT> {

  or<NEWOUT>(s: Schema<IN, NEWOUT>): Schema<IN, OUT | NEWOUT> {
    return new OrSchema<IN, OUT | NEWOUT>([this, s]);
  }

  and<NEWOUT>(s: Schema<OUT, NEWOUT>): Schema<IN, NEWOUT> {
    return new AndSchema([this, s])
  }

  __<FAKED extends OUT>(): FAKED {
    return this as any as FAKED;
  }

  abstract conform(value: IN): ValidationResult<OUT>;

  abstract toJSON(toJson?: (s: Schema) => any): any;


}

export class AndSchema<IN, OUT> extends BaseSchema<IN, OUT> {
  constructor(private readonly subSchemas: Schema[]) {
    super();
  }

  conform(value: IN): ValidationResult<OUT> {
    return this.subSchemas.reduce((result, schema) => {
      if (isError(result))
        return result;
      return conform(schema, result);
    }, value);
  }

  and<NEWOUT>(s: Schema<OUT, NEWOUT>): Schema<IN, NEWOUT> {
    return s instanceof AndSchema
      ? new AndSchema([...this.subSchemas, ...s.subSchemas])
      : new AndSchema([...this.subSchemas, s])
  }

  toJSON(toJson?: (s: Schema) => any) {
    return {
      allOf: subSchemaJson(this.subSchemas,toJson)
    };
  }
}

export class OrSchema<IN, OUT> extends BaseSchema<IN, OUT> {
  constructor(private readonly subSchemas: Schema<IN, OUT>[]) {
    super();
  }

  conform(value: IN): ValidationResult<OUT> {
    const failures: Problems[] = [];
    for (const s of this.subSchemas) {
      const result = s.conform(value);

      if (isSuccess(result)) return result;

      failures.push(result as Problems);
    }
    return failures.reduce((a: Problems | null, ps: Problems) => a ? a.merge(ps) : ps);
  }


  or<NEWOUT>(s: Schema<IN, NEWOUT>): Schema<IN, OUT | NEWOUT> {
    return s instanceof OrSchema
      ? new OrSchema<IN, OUT | NEWOUT>([...this.subSchemas, ...s.subSchemas])
      : new OrSchema<IN, OUT | NEWOUT>([...this.subSchemas, s])
  }

  toJSON(toJson?: (s: Schema) => any) {
    return {
      anyOf: subSchemaJson(this.subSchemas, toJson)
    }
  }

}

export abstract class BaseStringSchema extends BaseSchema<any, string> {
  conform(value: any): ValidationResult<string> {
    if (typeof value === 'string' || value instanceof String)
      return this.conformString(value as string);
    return failure(`expected a string but got ${typeDescription(value)}`);
  }

  abstract conformString(value: string): ValidationResult<string>;

  toJSON(): any {
    return {type: "string"}
  }
}

export class StringSchema extends BaseStringSchema {
  conformString(value: string): ValidationResult<string> {
    return value;
  }
}


export class DelegatingSchema<IN, OUT> extends BaseSchema<IN, OUT> {
  constructor(private readonly delegatedConform: (value: IN) => Problems | OUT,
              public readonly toJSON: () => any = () => {
                throw new Error('toJSON not implemented')
              }) {
    super();
  }

  conform(value: IN): ValidationResult<OUT> {
    return this.delegatedConform(value);
  }
}

export function isSchema(value: any): value is Schema {
  // TODO: probably wrong?
  return value instanceof BaseSchema;
}