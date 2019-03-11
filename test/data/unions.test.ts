import {build, data, eq} from "../../src/vice";
import {expect} from "chai";

describe('Union type fields', () => {
  it('can use .or() to specify schema', () => {
    @data
    class OrSchemaWithUnionType {
      union: string | number = eq("valid").or(eq(1)).__();
    }

    expect(build(OrSchemaWithUnionType, {union: 1})).deep.equals({union: 1});
    expect(build(OrSchemaWithUnionType, {union: "valid"})).deep.equals({union: "valid"});
    expect(() => build(OrSchemaWithUnionType, {union: "some bad value"})).to.throw(/some bad value/);
  });
  it('.or() works as expected when all schemas produce the same type', () => {
    // We're just checking that this compiles
    @data
    class OrSchemaWithSingleType {
      // Note- field type is string
      union: string = eq("valid").or(eq("also valid")).__();
    }
  });
});
