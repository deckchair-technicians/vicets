import {expect} from "chai";
import {build, data} from "../src/records";
import {eq, def, schema} from "../src/schema";

@data
class Test {
    equals1: number = def(eq(1));
    coercedValue: number = def(schema((v) => 123));
}

// Schema and class are the same thing
// No decorators
// Schema can be separated from the class, and created without a class
// Type checking between def types and schema output < NOT QUITE DONE YET
// Cannot create a class in an invalid state (class stands in for validity)


// Generate OpenAPI/json schema
// Generate test data
// Figure out how to cleanly have schema with dependencies

@data
class Parent {
    parentField: number = def(eq(1));
}

@data
class Child extends Parent {
    childField: number = def(eq(1));
}

@data
class FieldsInConstructor {
    constructor(public field: number = def(eq(1))) {
    }
}

@data
class ChildWithFieldsInConstructor extends FieldsInConstructor {
    constructor(
        public childField: number = def(eq(1)),
        field: number) {

        super(field);
    }
}

describe('Records', () => {
    it('Should allow fields to be defined in the constructor', () => {
        expect(new FieldsInConstructor(1)).deep.equals({field: 1});
        expect(() => new FieldsInConstructor(0)).to.throw(Error);
    });

    it('Should allow fields to be defined in the constructor, and work with inheritance', () => {
        expect(build(ChildWithFieldsInConstructor, {childField:1, field: 1}),
            "valid object")
            .deep.equals({field: 1, childField: 1});
        expect(() => build(ChildWithFieldsInConstructor, {childField:1, field: 0}),
            "invalid parent def").to.throw(Error);
        expect(() => build(ChildWithFieldsInConstructor, {childField:0, field: 1}),
            "invalid child def").to.throw(Error);

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
