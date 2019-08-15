import {BaseSchema, failure, problem, Problem, problems, ValidationResult} from "./";

export interface Opts {
  minimum?: number;
  exclusiveMinimum?: number;
  maximum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;
}

export class NumberSchema extends BaseSchema<any, number> {
  constructor(
    private readonly opts: Opts
  ) {
    super();
  }

  conform(value: any): ValidationResult<number> {
    if (typeof value !== 'number')
      return failure('expected a number');

    const {minimum, exclusiveMinimum, maximum, exclusiveMaximum, multipleOf} = this.opts;
    const p: Problem[] = [];

    if (minimum && !(value >= minimum))
      p.push(problem(`must be greater than or equal to ${minimum}`));

    if (exclusiveMinimum && !(value > exclusiveMinimum))
      p.push(problem(`must be greater than ${exclusiveMinimum}`));

    if (maximum && !(value <= maximum))
      p.push(problem(`must be less than or equal to ${maximum}`));

    if (exclusiveMaximum && !(value < exclusiveMaximum))
      p.push(problem(`must be less than ${exclusiveMaximum}`));

    if (multipleOf && value % multipleOf !== 0)
      p.push(problem(`must be multiple of ${multipleOf}`));

    return (p.length > 0)
      ? problems(...p)
      : value;
  }

  toJSON(): any {
    const {minimum, exclusiveMinimum, maximum, exclusiveMaximum, multipleOf} = this.opts;
    return {
      type: "number",
      ...(minimum && {minimum}),
      ...(exclusiveMinimum && {exclusiveMinimum}),
      ...(maximum && {maximum}),
      ...(exclusiveMaximum && {exclusiveMaximum}),
      ...(multipleOf && {multiple: multipleOf}),
    }
  }

}