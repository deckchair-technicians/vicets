import {expect} from "chai";
import {__, build, conform, data, eq, failure} from "../..";


describe('Using build() on @data classes', () => {
  @data
  class A {
    field: string = __(eq("valid"));
  }

  it('sets the right values', () => {
    expect(build(A, {field: "valid"})).deep.equals({field: "valid"});
  });
  it('returns the right type', () => {
    expect(build(A, {field: "valid"})).instanceOf(A);
  });
  it('has the right constructor name', () => {
    expect(Object.getPrototypeOf(build(A, {field: "valid"})).constructor.name).equals('A');
  });
  it('returns errors', () => {
    expect(() => build(A, {field: "some bad value"})).to.throw(/some bad value/);
  });
  it('complains when field is missing', () => {
    expect(conform(A, {}))
      .deep.equals(failure("No value", ["field"]));
  });
  it('complains when additional fields exist', () => {
    expect(conform(A, {field: "valid", additionalField: "should not be here"}))
      .deep.equals(failure("Unexpected item", ["additionalField"]));
  });

  it('gives useful exception when asked to build a non-@data class', () => {
    class NotData {
    }

    expect(() => build(NotData, {})).to.throw(/No schema/);
  });
});

xit('should support custom constructors(?)', () => {
});
xit('should complain if subclasses redefine fields', () => {
});
xit('nice error message for fields missing schema', () => {
});
xit('should support adding additional methods', () => {
});


