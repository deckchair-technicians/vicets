import {expect} from 'chai';
import {eq, failure, matches, object, problem, problems, schema, setof} from "../../src/vice";

describe('setof', () => {
  it('converts arrays into sets- this is natural when using JSON as the source', () => {
    const s = setof(eq("valid"));

    const conformed = s.conform(["valid"]);
    expect(conformed)
      .instanceOf(Set);
  });

  it('conforms values', () => {
    const s = setof(schema((v) => v + " conformed"));

    expect(s.conform(["abc1", "abc2", "abc3"]))
      .to.have.keys(["abc1 conformed", "abc2 conformed", "abc3 conformed"]);

    expect(s.conform(new Set(["abc1", "abc2", "abc3"])))
      .to.have.keys(["abc1 conformed", "abc2 conformed", "abc3 conformed"]);
  });

  it('if passed an array, returns problems using index as path', () => {
    const s = setof(matches(/abc/));
    expect(s.conform(["invalid value", "abc2", "abc3", "another invalid value"]))
      .deep.equals(problems(
      problem("did not match /abc/", [0]),
      problem("did not match /abc/", [3])))
  });

  it('if passed a set, returns problems using value as path (the values in sets are also their keys)', () => {
    const s = setof(eq("valid"));
    expect(s.conform(new Set(["invalid value", "valid"])))
      .deep.equals(failure(
      "expected 'valid' but got string: \"invalid value\"",
      ["invalid value"]));
  });

  it('stacks paths correctly with subschema problems', () => {
    const schema = object({a: matches(/abc/)});
    const outerObject = setof(schema);
    expect(outerObject.conform([{a: "invalid value 1"}, {a: "invalid value 2"}]))
      .deep.equals(problems(
      problem("did not match /abc/", [0, "a"]),
      problem("did not match /abc/", [1, "a"])));
  });
});
