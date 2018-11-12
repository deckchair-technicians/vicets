import {expect} from "chai";
import {__, data, eq, failure, MissingItemBehaviour, Schema, schemaOf} from "../../index";
import {Constructor} from "../../src/impl/util";
import {ObjectSchema} from "../../src/impl/associative/obj";

function partial<T>(type: Constructor<T>): Schema<any, Partial<T>> {
  const objectSchema: ObjectSchema = schemaOf(type);
  return objectSchema.onMissing(MissingItemBehaviour.IGNORE);
}

describe('Using build() on @data classes', () => {
  @data
  class Thing {
    a: string = __(eq("valid"));
    b: string = __(eq("valid"));
  }

  const s = partial(Thing);

  it('sets the right values', () => {
    expect(s.conform({a: "valid", b: "valid"}))
      .deep.eq({a: "valid", b: "valid"});
  });
  it('returns errors', () => {
    expect(s.conform({a: "valid", b: "not valid"}))
      .deep.eq(failure("expected 'valid' but got string: \"not valid\"", ["b"]));
  });
  it('does not complain when field is missing', () => {
    expect(s.conform({a: "valid"}))
      .deep.eq({a: "valid"});
  });
  it('complains when one field is wrong, even if the other is missing', () => {
    expect(s.conform({a: "invalid"}))
      .deep.eq(failure("expected 'valid' but got string: \"invalid\"", ["a"]));
  });
  it('complains when additional fields exist', () => {
    expect(s.conform({a: "valid", b: "valid", additionalField: "should not be here"}))
      .deep.equals(failure("Unexpected item", ["additionalField"]));
  });
});
