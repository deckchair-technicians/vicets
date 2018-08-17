import {expect} from 'chai';
import {predicate, problem, problems} from "../../";

describe('or', () => {
  it('Returns the result of the first schema that passes, or all problems from all schemas', () => {
    const s =
      predicate(
        (x) => x === "passes first",
        "failed first predicate")
        .or(predicate(
          (x) => x === "passes second",
          "failed second predicate"));

    expect(s.conform("passes first")).equals("passes first");
    expect(s.conform("passes second")).equals("passes second");

    expect(s.conform("fails both")).deep.equals(problems(
      problem("failed first predicate"),
      problem("failed second predicate")
    ));
  });
})