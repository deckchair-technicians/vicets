import {expect} from "chai";
import {
  __,
  data,
  eq,
  failure, problem,
  problems,
  ValidationResult,
  DeepNullable,
  deepNullable, object,
} from "../../src/vice";


describe('Deep nullable', () => {
  @data
  class Thing {
    a: string = __(eq("valid"));
    b: string = __(eq("valid"));
  }
  const s = deepNullable(Thing);

  it('sets the right values', () => {
    const conformed: ValidationResult<DeepNullable<Thing>> = s.conform({a: "valid", b: "valid"});
    expect(conformed).deep.eq({a: "valid", b: "valid"});
  });
  it('returns errors', () => {
    expect(s.conform({a: "valid", b: "not valid"}))
      .deep.eq(problems(
      problem("expected 'valid' but got string: \"not valid\"", ["b"]),
      problem("expected 'null' but got string: \"not valid\"", ["b"]),
    ));
  });
  it('does not complain when field is null', () => {
    expect(s.conform({a: null, b: "valid"}))
      .deep.eq({a: null, b: "valid"});
  });

  it('does not complain when field is null with complex data', () => {
    @data
    class ComplexThing {
      a: number = __(eq(1));
      b = __(object({
        c: __(eq("valid"))
      }))
    }
    const cs = deepNullable(ComplexThing);

    expect(cs.conform({a: 1, b: null}))
    .deep.eq({a: 1, b: null});
    expect(cs.conform({a: 1, b: {c: null}}))
      .deep.eq({a: 1, b: {c: null}});
  });
  it('complains when field is missing', () => {
    expect(s.conform({a: "valid"}))
      .deep.equals(failure("No value", ["b"]));
  });
  it('complains when additional fields exist', () => {
    expect(s.conform({a: "valid", b: "valid", additionalField: "should not be here"}))
      .deep.equals(failure("Unexpected item", ["additionalField"]));
  });
});
