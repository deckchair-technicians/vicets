import {__, build, data} from "../../index";
import {eq} from "../../src/schemas";
import {expect} from "chai";

describe('Defining fields in constructor', () => {
  @data
  class FieldsInConstructor {
    constructor(public field: number = __(eq(1))) {
    }
  }

  describe('Basics', () => {
    it('should allow fields to be defined in the constructor', () => {
      expect(new FieldsInConstructor(1)).deep.equals({field: 1});
      expect(() => new FieldsInConstructor(0)).to.throw(/expected '1'/);
    });

    it('returns the right type', () => {
      expect(new FieldsInConstructor(1)).instanceOf(FieldsInConstructor);
    });

    it('has the right constructor name', () => {
      let fieldsInConstructor = new FieldsInConstructor(1);
      expect(Object.getPrototypeOf(fieldsInConstructor).constructor.name).equals('FieldsInConstructor');
    });

    it('still works with build', () => {
      expect(build(FieldsInConstructor, {field:1})).deep.equals({field: 1});
      expect(() => build(FieldsInConstructor, {field:2})).to.throw(/expected '1'/);
    });

    it('does not keep constructor defaults if not overridden in constructor arguments', () => {
      // Without removing field values that are schemas, this would be complaining that field
      // is an EqualsSchema
      expect(() => new FieldsInConstructor()).to.throw(/expected '1' but got undefined/);
    });
  });

  @data
  class ChildWithFieldsInConstructor extends FieldsInConstructor {
    constructor(public childField: number = __(eq(2)),
                field: number) {

      super(field);
    }
  }

  describe('Inheritance', () => {
    it('works with valid values', ()=>{
      expect(new ChildWithFieldsInConstructor( 2, 1))
        .deep.equals({field: 1, childField: 2});
    });
    it('works with invalid child value', ()=>{
      expect(()=>new ChildWithFieldsInConstructor(0, 1)).to.throw(Error);
    });
    it('works with invalid parent value', ()=>{
      expect(()=>new ChildWithFieldsInConstructor(2, 2)).to.throw(Error);
    });
    it('still works with build', () => {
      expect(build(ChildWithFieldsInConstructor, {field:1, childField:2})).deep.equals({field:1, childField:2});
      expect(() => build(ChildWithFieldsInConstructor, {field:2, childField:2})).to.throw(/expected '1'/);
      expect(() => build(ChildWithFieldsInConstructor, {field:1, childField:1})).to.throw(/expected '2'/);
    });
  });
});