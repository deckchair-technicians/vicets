import {expect} from "chai";
import {__, build, data, eq} from "../../src/vice";

describe('Inheritance', () => {
  @data
  class Parent {
    parentField: string = __(eq("valid"));
  }

  @data
  class Child extends Parent {
    childField: string = __(eq("valid"));
  }

  it('does not affect parent', () => {
    expect(build(Parent, {parentField: "valid"})).deep.equals({parentField: "valid"});
    expect(() => build(Parent, {parentField: "some bad value"})).to.throw(/some bad value/);
  });
  it('returns errors from parent schema', () => {
    expect(() => build(Child, {childField: "valid", parentField: "some bad value"})).to.throw(/some bad value/);
  });
  it('returns errors from child schema', () => {
    expect(() => build(Child, {childField: "some bad value", parentField: "valid"})).to.throw(/some bad value/);
  });
});
