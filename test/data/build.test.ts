import {expect} from "chai";
import {__, build, data, eq, isdata, isundefined} from "../..";


describe('Using build() on @data classes', () => {
  describe('Basics', () => {
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
  });
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
  describe('Invalid inputs', () => {
    it('gives useful exception when asked to build a non-@data class', () => {
      class NotData{}
      expect(()=>build(NotData, {})).to.throw(/No schema/);
    });
  });
  describe('Nesting', () => {
    @data
    class Nested {
      a: string = __(eq("valid"));
    }

    @data
    class HasNested {
      nested: Nested = __(isdata(Nested));
    }

    it('works for valid input', () => {
      expect(build(HasNested, {nested: {a: "valid"}}))
        .deep.equals({nested: {a: "valid"}});
    });
    it('works for invalid input', () => {
      expect(() => build(HasNested, {nested: {a: "not a valid value"}}))
        .to.throw(/not a valid value/);
    });
  });

  describe('Optional fields', () => {
    @data
    class OptionalFields {
      optional?: string = __(eq("valid").or(isundefined()));
    }

    const p = Object.getOwnPropertyDescriptor(OptionalFields, "optional");
    let m = build(OptionalFields, {optional: "valid", notoptional: "valid"});

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
  });

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
xit('supports recursion', () => {
});


