import {expect} from "chai";
import {defaultValue, eq, failure, isIn} from "../../";

describe('defaultValue', () => {
  const s = defaultValue(() => "default", isIn("default", "also valid"));
  it('sets a default value', () => {
    expect(s.conform(undefined)).eq("default");
  });
  it('sets a default value', () => {
    expect(s.conform(undefined)).eq("default");
  });
  it('passes through value if present', () => {
    expect(s.conform("also valid")).eq("also valid");
  });
  it('fails if default is not valid', () => {
    const s = defaultValue(() => "not valid", eq("valid"));
    expect(s.conform(undefined)).deep.eq(failure("expected 'valid' but got string: \"not valid\""));
  });
});