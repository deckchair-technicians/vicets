import {
  BaseSchema,
  conform,
  DelegatingSchema, failure,
  isSchema,
  isSuccess,
  MissingItemBehaviour,
  ObjectSchema,
  Pattern,
  predicate,
  Problems,
  Schema,
  UnexpectedItemBehaviour,
  ValidationResult
} from "../impl";

export class ConditionalSchema<IN extends object, OUT, MATCH = any> extends BaseSchema<IN, OUT> {
  private readonly matchesAnyCondition: Schema<IN>;

  constructor(
    private readonly matches: [Schema<IN>, Schema<IN, OUT>][]) {
    super();
    this.matchesAnyCondition = matches
      .map(([case_,]) => case_)
      .reduce((s, c) => s.or(c),
        new DelegatingSchema((x) => x));
  }

  conform(value: IN): ValidationResult<OUT> {
    let problems = failure('could not match any case');
    for (const [case_, schema] of this.matches) {
      const matchResult = conform(case_, value);
      if (isSuccess(matchResult))
        return conform(schema, value);
      else
        problems = problems.merge(matchResult);
    }
    return problems as Problems;
  }

  case<OTHER extends object>(case_: Pattern<OTHER> | Schema<IN, any> | ((value: IN) => boolean), schema: Schema<IN, OTHER>): ConditionalSchema<IN, OUT | OTHER> {
    const caseSchema = typeof case_ === 'function'
      ? predicate(case_)
      : isSchema(case_)
        ? case_
        : new ObjectSchema(case_, UnexpectedItemBehaviour.IGNORE, MissingItemBehaviour.PROBLEM);

    return new ConditionalSchema<IN, OUT | OTHER>(
      [...this.matches, [caseSchema, schema]]);
  }
}

