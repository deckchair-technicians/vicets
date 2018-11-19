import {failure, conform, eq, select, validate} from "../../index";
import {expect} from "chai";

describe('select', () => {
  const s = select(
    ["a", "b"],
    eq("valid"));

  it('passes through correct values', () => {
    expect(validate(
      s,
      {a: {b: "valid"}}))
      .eq("valid")
  });

  it('complains if keys dont exist', () => {
    expect(conform(s, {})).deep.eq(failure("no value", ["a"]));
    expect(conform(s, {a: {}})).deep.eq(failure("no value", ["a", "b"]))
  });

  it('complains if value does not conform', () => {
    expect(conform(s, {a: {b: "not valid"}})).deep.eq(failure("expected 'valid' but got string: \"not valid\"", ["a", "b"]))
  })
});