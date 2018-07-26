import {expect} from "chai";
import {build, data, Record} from "../src/records";
import {gt, schema} from "../src/schema";

@data
class Test extends Record {
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
class Parent extends Record {
    parentField: number = gt(1);
}

@data
class Child extends Parent {
    childField: number = gt(1);
}

@data
class NotARecord extends Record{
    field: number = gt(1);
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

    it('Should apply schema when constructing', () => {
        expect(new Test(
            {
                greaterThan1: 123,
                coercedValue: "original value"
            })).deep.equals(
            {
                greaterThan1: 123,
                coercedValue: "coerced"
            });
        expect(() => new Test({greaterThan1: 0})).to.throw(Error);
    });

    it('Should cope with inheritance', () => {
        expect(new Parent({parentField: 123})).deep.equals({parentField: 123});
        expect(() => new Parent({parentField: 0})).to.throw(Error);

        expect(new Child({parentField: 123, childField: 456})).deep.equals({parentField: 123, childField: 456});
        expect(() => new Child({parentField: 0, childField: 0})).to.throw(Error);
    });
    it('Should cope with inheritance where parent is also data', () => {
        expect(new Parent({parentField: 123})).deep.equals({parentField: 123});
        expect(() => new Parent({parentField: 0})).to.throw(Error);

        expect(new Child({parentField: 123, childField: 456})).deep.equals({parentField: 123, childField: 456});
        expect(() => new Child({parentField: 0, childField: 0})).to.throw(Error);
    });
});
