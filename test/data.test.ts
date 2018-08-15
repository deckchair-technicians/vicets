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



  it('Should cope with nesting', () => {
    expect(new HasNested(new Nested("valid"))).deep.equals({nested: {a: "valid"}});
    expect(() => new HasNested()).to.throw(Error);

    expect(build(HasNested, {nested: {a: "valid"}})).deep.equals({nested: {a: "valid"}});
    expect(() => build(HasNested, {nested: {a: "not valid"}})).to.throw(Error);
  });
  it('Should support union types', () => {
    expect(new Union(1, "also valid")).deep.equals({union: 1, single: "also valid"});
    expect(() => new Union(2, "valid")).to.throw(Error);
    expect(() => new Union(1, "not valid")).to.throw(Error);

    expect(build(Union, {union: 1, single: "also valid"})).deep.equals({union: 1, single: "also valid"});
    expect(build(Union, {union: "valid", single: "valid"})).deep.equals({union: "valid", single: "valid"});
    expect(() => build(Union, {union: "not valid", single: "valid"})).to.throw(Error);
    expect(() => build(Union, {union: "valid", single: "not valid"})).to.throw(Error);
  });
  xit('should support custom constructors(?)', () => {
  });
  xit('should complain if subclasses redefine fields', () => {
  });
  xit('should provide indication of field requirements if a field is missing', () => {
  });
  xit('should support optional fields', () => {
  });
  xit('missing fields', () => {
  });
  xit('additional fields', () => {
  });
  xit('nice error message for fields missing schema', () => {
  });
  xit('should support adding additional methods', () => {
  });
});

describe('', ()=>{
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


