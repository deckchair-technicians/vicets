import {__, build, data, defaultValue, eq, opt, schema} from "../../src/vice";
import {expect} from "chai";

describe('Optional fields', () => {
  @data
  class OptionalFields {
    optional?: string = __(opt(eq("valid")));
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
  it('works for default ', () => {
    @data
    class DefaultField {
      default: string = __(defaultValue(() => "valid", eq("valid")));
    }

    expect(build(DefaultField, {}))
      .deep.eq({default: "valid"});
  });

  it('does not add field to class, even if the schema conforms undefined into a value', () => {
    @data
    class WeirdOptionalField {
      optional?: string = __(opt(schema((x) => "schema conforms undefined to some value")));
    }

    expect(build(WeirdOptionalField, {}))
      .deep.equals({});
  });
});
