import {conform} from "../helpers"
import {
  BaseSchema,
  BehaviourSchema,
  failure,
  isSchema,
  isSuccess,
  ObjectSchema,
  Pattern,
  Problems,
  Schema,
  UnexpectedItemBehaviour,
  ValidationResult
} from "../impl";
import {subSchemaJson} from "../jsonSchema";

export class ConditionalSchema<IN extends object, OUT, MATCH = any> extends BaseSchema<IN, OUT> {
  constructor(
    private readonly matches: [Schema<IN>, Schema<IN, OUT>][]) {
    super();
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

  case<OTHER extends object>(case_: Pattern<OTHER> | Schema<IN, any>, schema: Schema<IN, OTHER>): ConditionalSchema<IN, OUT | OTHER> {
    const caseSchema = isSchema(case_)
      ? case_
      : new BehaviourSchema({unexpected: UnexpectedItemBehaviour.IGNORE}, new ObjectSchema(case_));

    return new ConditionalSchema<IN, OUT | OTHER>(
      [...this.matches, [caseSchema, schema]]);
  }

  toJSON(toJson?: (s: Schema) => any): any {
    if (this.matches.length === 0)
      return false;

    function subs(schema:Schema):any{
      const result = subSchemaJson(schema, toJson);
      delete result['additionalProperties'];
      delete result['required'];
      delete result['type'];
      return result;
    }
    return this.matches
      .reverse()
      .reduce((result, [condition, schema]) => {
        return {
          if: subs(condition),
          then: subSchemaJson(schema, toJson),
          ...(result ? {else: result} : {})
        };
      }, undefined);
  }
}

