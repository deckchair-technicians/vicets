import {expect} from "chai";
import {__, build, data, eq, isdata} from "../../src/vice";

describe('Nesting', () => {
  @data
  class Nested {
    a: string = __(eq("valid"));
  }

  @data
  class HasNested {
    nested: Nested = __(isdata(Nested));
  }

  it('works for valid input', () => {
    expect(build(HasNested, {nested: {a: "valid"}}))
      .deep.equals({nested: {a: "valid"}});
  });
  it('works for invalid input', () => {
    expect(() => build(HasNested, {nested: {a: "not a valid value"}}))
      .to.throw(/not a valid value/);
  });
});
