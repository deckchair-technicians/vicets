import {build, data, eq, __opt, schema} from "../..";
import {expect} from "chai";

describe('Optional fields', () => {
  @data
  class OptionalFields {
    optional?: string = __opt(eq("valid"));
  }

  it('works when field is present', () => {
    expect(build(OptionalFields, {optional: "valid"}))
      .deep.equals({optional: "valid"});
  });
  it('works when field is not present', () => {
    expect(build(OptionalFields, {}))
      .deep.equals({});
  });
  it('works for invalid input', () => {
    expect(() => build(OptionalFields, {optional: "moomin"}))
      .to.throw(/moomin/);
  });

  it('does not add field to class, even if the schema conforms undefined into a value', () => {
    @data
    class WeirdOptionalField {
      optional?: string = __opt(schema((x)=>"schema conforms undefined to some value"));
    }

    expect(build(WeirdOptionalField, {}))
      .deep.equals({});
  });
});
