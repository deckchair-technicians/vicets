import {BaseSchema, failure, ValidationResult} from "./";
export interface RangeOpts{
  lowerInclusive:boolean;
  upperInclusive:boolean;
}
export class GtSchema extends BaseSchema<any, number> {
  constructor(
    public readonly compare: number
  ) {
    super();
  }

  conform(value: any): ValidationResult<number> {
    if (typeof value !== 'number')
      return failure('expected a number');

    if (value > this.compare)
      return value;
    else
      return failure(`must be greater than ${this.compare}`);

  }

}

export class LtSchema extends BaseSchema<any, number> {
  constructor(
    public readonly compare: number
  ) {
    super();
  }

  conform(value: any): ValidationResult<number> {
    if (typeof value !== 'number')
      return failure('expected a number');

    if (value < this.compare)
      return value;
    else
      return failure(`must be less than ${this.compare}`);

  }

}

export class LteSchema extends BaseSchema<any, number> {
  constructor(
    public readonly compare: number
  ) {
    super();
  }

  conform(value: any): ValidationResult<number> {
    if (typeof value !== 'number')
      return failure('expected a number');

    if (value <= this.compare)
      return value;
    else
      return failure(`must be less than or equal to ${this.compare}`);

  }

}

export class GteSchema extends BaseSchema<any, number> {
  constructor(
    public readonly compare: number
  ) {
    super();
  }

  conform(value: any): ValidationResult<number> {
    if (typeof value !== 'number')
      return failure('expected a number');

    if (value >= this.compare)
      return value;
    else
      return failure(`must be greater than or equal to ${this.compare}`);

  }

}

