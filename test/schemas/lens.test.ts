import {failure} from "../../src/problems";
import {conform, eq, lens, validate, LensBehaviour} from "../../index";
import {expect} from "chai";


describe('lens', () => {
  const s = lens(
    ["a", "b"],
    eq("valid"),
    LensBehaviour.MODIFY_IN_PLACE);

  it('passes through correct values', () => {
    expect(validate(
      s,
      {a: {b: "valid"}}))
      .deep.eq({a: {b: "valid"}})
  });

  it('complains if keys dont exist', () => {
    expect(conform(s, {})).deep.eq(failure("no value", ["a"]));
    expect(conform(s, {a: {}})).deep.eq(failure("no value", ["a", "b"]))
  });

  it('complains if value does not conform', () => {
    expect(conform(s, {a: {b: "not valid"}})).deep.eq(failure("expected 'valid' but got string: \"not valid\"", ["a", "b"]))
  })
});