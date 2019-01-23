import {expect} from "chai";
import {__, conformAs, data, eq, failure, partial, pick, ValidationResult} from "../../index";


describe('Using build() on @data classes', () => {
  @data
  class Thing {
    a: string = __(eq("valid"));
    b: string = __(eq("valid"));
    c: string = __(eq("valid"));
  }

  const s = pick(Thing, ['b', 'c']);

  it('sets the right values', () => {
    const conformed = s.conform({b: "valid", c: "valid"});
    expect(conformed)
      .deep.eq({b: "valid", c: "valid"});
  });
  it('returns errors', () => {
    expect(s.conform({b: "valid", c: "not valid"}))
      .deep.eq(failure("expected 'valid' but got string: \"not valid\"", ["c"]));
  });
  it('complains when field is missing', () => {
    expect(s.conform({b: "valid"}))
      .deep.equals(failure("No value", ["c"]));
  });
  it('complains when additional fields exist', () => {
    expect(s.conform({b: "valid", c: "valid", additionalField: "should not be here"}))
      .deep.equals(failure("Unexpected item", ["additionalField"]));
  });
});
