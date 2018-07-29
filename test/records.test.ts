import {expect} from "chai";
import {build, data} from "../src/records";
import {gt, gte, schema} from "../src/schema";

@data
class Test {
    greaterThan1: number = gt(1);
    coercedValue: number = schema((v) => "coerced");
}

// Schema and class are the same thing
// No decorators
// Schema can be separated from the class, and created without a class
// Type checking between field types and schema output < NOT QUITE DONE YET
// Cannot create a class in an invalid state (class stands in for validity)


// Generate OpenAPI/json schema
// Generate test data
// Figure out how to cleanly have schema with dependencies

@data
class Parent {
    parentField: number = gt(1);
}

@data
class Child extends Parent {
    childField: number = gt(1);
}

@data
class NotARecord {
    field: number = gt(1);
}

@data
class FieldsInConstructor {
    constructor(public field: number = gte(1)) {
    }
}

describe('Records', () => {
    it('Should be buildable', () => {
        expect(build(NotARecord,
            {
                field: 123
            })).deep.equals(
            {
                field: 123
            });
    });

    it('Should allow fields to be defined in the constructor', () => {
        expect(new FieldsInConstructor(1)).deep.equals({field: 1});
        expect(() => new FieldsInConstructor(0)).to.throw(Error);
    });

    it('Should apply schema when constructing', () => {
        expect(build(Test,
            {
                greaterThan1: 123,
                coercedValue: "original value"
            })).deep.equals(
            {
                greaterThan1: 123,
                coercedValue: "coerced"
            });

    });

    it('Should cope with inheritance', () => {
        expect(build(Parent, {parentField: 123})).deep.equals({parentField: 123});
        expect(() => build(Parent, {parentField: 0})).to.throw(Error);

        expect(build(Child, {parentField: 123, childField: 456})).deep.equals({parentField: 123, childField: 456});
        expect(() => build(Child, {
                parentField: 0,
                childField:
                    0
            }
        )).to.throw(Error);
    });
    it('Should cope with inheritance where parent is also data', () => {
        expect(build(Parent, {parentField: 123})).deep.equals({parentField: 123});
        expect(() => build(Parent, {parentField: 0})).to.throw(Error);

        expect(build(Child, {parentField: 123, childField: 456})).deep.equals({parentField: 123, childField: 456});
        expect(() => build(Child, {parentField: 0, childField: 0})).to.throw(Error);
    });
});
