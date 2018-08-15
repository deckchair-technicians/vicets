import {expect} from "chai";
import {__, discriminated, eq, isdata, schema, build, data} from "../src";

@data
class Test {
  equals1: number = __(eq(1));
  coercedValue: number = __(schema((_) => 123));
}


@data
class Parent {
  parentField: number = __(eq(1));
}

@data
class Child extends Parent {
  childField: number = __(eq(1));
}

@data
class Nested {
  constructor(public a: string = __(eq("valid"))) {
  }
}

@data
class HasNested {
  constructor(public nested: Nested = __(isdata(Nested))) {
  }
}

@data
class Union {
  constructor(public union: string | number
                = eq("valid").or(eq(1)).__(),
              public single: string
                = eq("valid").or(eq("also valid")).__()) {
  }
}

describe('Defining fields in constructor', () => {
  @data
  class FieldsInConstructor {
    constructor(public field: number = __(eq(1))) {
    }
  }

  it('Should allow fields to be defined in the constructor', () => {
    expect(new FieldsInConstructor(1)).deep.equals({field: 1});
    expect(() => new FieldsInConstructor(0)).to.throw();
  });

  @data
  class ChildWithFieldsInConstructor extends FieldsInConstructor {
    constructor(public childField: number = __(eq(1)),
                field: number) {

      super(field);
    }
  }

  it('Should allow fields to be defined in the constructor, and work with inheritance', () => {
    expect(build(ChildWithFieldsInConstructor, {childField: 1, field: 1}),
      "valid object")
      .deep.equals({field: 1, childField: 1});
    expect(() => build(ChildWithFieldsInConstructor, {childField: 1, field: 0}),
      "invalid parent __").to.throw(Error);
    expect(() => build(ChildWithFieldsInConstructor, {childField: 0, field: 1}),
      "invalid child __").to.throw(Error);

    expect(new ChildWithFieldsInConstructor(1, 1)).deep.equals({field: 1, childField: 1});
    expect(() => new ChildWithFieldsInConstructor(1, 0)).to.throw(Error);
    expect(() => new ChildWithFieldsInConstructor(0, 1)).to.throw(Error);
  });

  it('Should apply schema when constructing', () => {
    expect(build(Test,
      {
        equals1: 1,
        coercedValue: 456
      })).deep.equals(
      {
        equals1: 1,
        coercedValue: 123
      });

  });

  it('Should cope with inheritance', () => {
    expect(build(Parent, {parentField: 1})).deep.equals({parentField: 1});
    expect(() => build(Parent, {parentField: 0})).to.throw(Error);

    expect(build(Child, {parentField: 1, childField: 1})).deep.equals({parentField: 1, childField: 1});
    expect(() => build(Child, {
        parentField: 0,
        childField: 0
      }
    )).to.throw(Error);
  });
  it('Should cope with inheritance where parent is also data', () => {
    expect(build(Parent, {parentField: 1})).deep.equals({parentField: 1});
    expect(() => build(Parent, {parentField: 0})).to.throw(Error);

    expect(build(Child, {parentField: 1, childField: 1})).deep.equals({parentField: 1, childField: 1});
    expect(() => build(Child, {parentField: 0, childField: 0})).to.throw(Error);
  });
});

