import {__, build, data, discriminated, discriminatedBy, eq, isdata} from "../../src";
import {expect} from "chai";

describe('discriminated unions', () => {
  @data
  class DiscriminatedUnion1 {
    discriminator = 1;
  }

  @data
  class DiscriminatedUnion2 {
    discriminator = 2
  }

  @data
  class DiscriminatedUnion3 {
    discriminator = 3;
    someOtherField: string = __(eq("valid value"));
  }

  type DiscriminatedUnion = DiscriminatedUnion1 | DiscriminatedUnion2 | DiscriminatedUnion3

  const discriminatedUnionSchema = discriminated(DiscriminatedUnion1, DiscriminatedUnion2, DiscriminatedUnion3);

  it('passes through discriminator value', () => {
    expect(discriminatedUnionSchema.conform({discriminator: 1}))
      .deep.equals({discriminator: 1});
  });
  it('constructs correct type', () => {
    expect(discriminatedUnionSchema.conform({discriminator: 1}))
      .instanceOf(DiscriminatedUnion1);

    expect(discriminatedUnionSchema.conform({discriminator: 2}))
      .instanceOf(DiscriminatedUnion2);
  });

  it('supports setting other fields as well as discriminator', () => {
    expect(discriminatedUnionSchema.conform({discriminator: 3, someOtherField: "valid value"}))
      .deep.equals({discriminator: 3, someOtherField: "valid value"});
  });

  it('validates other fields as well as discriminator', () => {
    expect(discriminatedUnionSchema.conform({discriminator: 3, someOtherField: "not valid"}))
      .deep.equals({
      problems: [
        {
          message: "expected 'valid value' but got string: \"not valid\"",
          path: [
            "someOtherField"
          ]
        }
      ]
    });
  });

  it('provides nice message on invalid discriminator value', () => {
    expect(discriminatedUnionSchema.conform({discriminator: 4})).deep.equals({
      problems: [
        {
          message: "expected one of [1, 2, 3]",
          path: ["discriminator"]
        }
      ]
    })
  });

  @data
  class HasDiscriminatedUnionField {
    field: DiscriminatedUnion = discriminatedUnionSchema.__()
  }

  it('can be used as fields on a class', () => {
    expect(build(HasDiscriminatedUnionField, {field: {discriminator: 2}}).field).instanceOf(DiscriminatedUnion2);

    expect(isdata(HasDiscriminatedUnionField).conform({field: {discriminator: 4}})).deep.equals({
      problems: [
        {
          message: "expected one of [1, 2, 3]",
          path: [
            "field",
            "discriminator"
          ]
        }
      ]
    });
  })
});

describe('detecting discriminator fields', () => {
  @data
  class Duplicate_Value_A {
    type = 1;
    notInAllClasses = 1;
  }

  @data
  class Duplicate_Value_B {
    type = 1
  }

  it('nice error messages for failed discriminator fields', () => {

    expect(() => discriminated(Duplicate_Value_A, Duplicate_Value_B))
      .to.throw(/.*type: value '1' is repeated in: Duplicate_Value_A, Duplicate_Value_B/);

    expect(() => discriminated(Duplicate_Value_A, Duplicate_Value_B))
      .to.throw(/notInAllClasses: field is not present in all classes/);
  });

  @data
  class MultipleDiscriminators_A {
    type = 1;
    discriminator = 1;
  }

  @data
  class MultipleDiscriminators_B {
    type = 2;
    discriminator = 2;
  }

  it('nice error message when multiple discriminators are found', () => {
    expect(() => discriminated(MultipleDiscriminators_A, MultipleDiscriminators_B))
      .to.throw('Multiple possible discriminator fields: [type, discriminator]');
  });

  describe('allows disambiguating discriminator using discriminatedBy', () => {
    const explicitlyDiscriminated = discriminatedBy("type", MultipleDiscriminators_A, MultipleDiscriminators_B);

    it('works', ()=>{
      expect(explicitlyDiscriminated.conform({type: 1, discriminator: 1}))
        .deep.equals({type: 1, discriminator: 1}).instanceOf(MultipleDiscriminators_A);

      expect(explicitlyDiscriminated.conform({type: 2, discriminator: 2}))
        .deep.equals({type: 2, discriminator: 2}).instanceOf(MultipleDiscriminators_B);
    });
    it('fails as expected', ()=>{
      expect(explicitlyDiscriminated.conform({type:1, discriminator: "not valid"}))
        .deep.equals({
        problems: [
          {
            message: "expected '1' but got string: \"not valid\"",
            path: [
              "discriminator"
            ]
          }
        ]
      });
    });
  });
});