import {expect} from 'chai';
import {enumvalue, Problems} from "../../src/vice";

describe('enumvalue', () => {
  describe('String enums', () => {
    enum WithStringValues {
      a = 'a value',
      b = 'b value'
    }

    const s = enumvalue(WithStringValues);

    it('works for values', () => {
      expect(s.conform('a value')).to.equals(WithStringValues.a);
      expect(s.conform('b value')).to.equals(WithStringValues.b);
    });
    it('does not work for keys', () => {
      expect(s.conform('a')).deep.equals({
        problems: [
          {
            message: 'expected one of ["a value", "b value"]',
            path: []
          }
        ]
      });
    });
  });

  describe('Enums with no initializers (numeric enums)', () => {
    enum NoValues {
      a,
      b
    }

    const s = enumvalue(NoValues);
    it('accepts values', () => {
      expect(s.conform(0)).to.equals(NoValues.a);
      expect(s.conform(1)).to.equals(NoValues.b);
    });
    it('fails for invalid input, including keys', () => {
      expect(s.conform('a'))
        .deep.equals({
        problems: [
          {
            message: "expected one of [0, 1]",
            path: []
          }
        ]
      });
    });
  });

  describe('Enums with mixed initializers', () => {
    enum MixedValues {
      a,
      b = 2,
      c = 'c value'
    }

    const s = enumvalue(MixedValues);
    it('accepts values', () => {
      expect(s.conform(0)).to.equals(MixedValues.a);
      expect(s.conform(2)).to.equals(MixedValues.b);
      expect(s.conform('c value')).to.equals(MixedValues.c);
    });
    it('fails for invalid input, including keys', () => {
      expect(s.conform('a'))
        .deep.equals({
        problems: [
          {
            message: 'expected one of [0, 2, "c value"]',
            path: []
          }
        ]
      });
    });
  });

  describe('Using artificial enums', () => {
    it('can fake numeric enums', () => {
      const OkNumericEnum = {
        a: 0,
        b: 1,
        '0': 'a',
        '1': 'b'
      };

      const s = enumvalue(OkNumericEnum);
      expect(s.conform(0)).to.equal(OkNumericEnum.a);
      expect(s.conform(1)).to.equal(OkNumericEnum.b);
      expect(s.conform('a')).instanceOf(Problems);
    });

    it('can fake string enums', () => {
      const OkStringEnum = {
        a: 'a value',
        b: 'b value',
      };

      const s = enumvalue(OkStringEnum);
      expect(s.conform('a value')).to.equal(OkStringEnum.a);
      expect(s.conform('b value')).to.equal(OkStringEnum.b);
      expect(s.conform('a')).instanceOf(Problems);
    });

    it('can fake mixed enums', () => {
      const OkMixedEnum = {
        a: 0,
        '0': 'a',
        b: 'b value',
      };

      const s = enumvalue(OkMixedEnum);
      expect(s.conform(0)).to.equal(OkMixedEnum.a);
      expect(s.conform('b value')).to.equal(OkMixedEnum.b);
      expect(s.conform('a')).instanceOf(Problems);
    });

    it('spots invalid value types', () => {
      const ValueIsNotStringOrNumber = {
        a: {}
      };

      expect(() => enumvalue(ValueIsNotStringOrNumber))
        .to.throw("Entries must be string:number, number:string or string:string. Field 'a' was string:object");
    });
    it('spots numeric keys with numeric values', () => {
      const NumericKeyAndValue = {
        '0': 1
      };

      expect(() => enumvalue(NumericKeyAndValue))
        .to.throw("Entries must be string:number, number:string or string:string. Field '0' was number:number");
    });
    it('spots missing reverse lookup', () => {
      const MissingReverseLookup = {
        a: 0,
      };
      expect(() => enumvalue(MissingReverseLookup)).to.throw('Not a proper enum. e["a"] = 0 but e["0"] = undefined');
    });
    it('spots reverse lookup for missing key', () => {
      const ReverseLookupForMissingKey = {
        '0': 'a'
      };
      expect(() => enumvalue(ReverseLookupForMissingKey)).to.throw('Not a proper enum. e["0"] = "a" but e["a"] = undefined');
    });
    describe('Weird enums', () => {
      it('are supported in typescript', () => {
        enum WeirdEnum {
          a = 0,
          'b' = '0'
        }

        const s = enumvalue(WeirdEnum);
        expect(s.conform(0)).to.equal(WeirdEnum.a);
        expect(s.conform('a')).deep.equals({
          problems: [
            {
              message: 'expected one of [0, "0"]',
              path: []
            }
          ]
        });
      });
      it("here's what's going on underneath", () => {
        const WeirdFakeEnum = {
          a: 0,
          '0': 'a',
          'b': '0'
        };
        const s = enumvalue(WeirdFakeEnum);
        expect(s.conform(0)).to.equal(WeirdFakeEnum.a);
        expect(s.conform('a')).deep.equals({
          problems: [
            {
              message: 'expected one of [0, "0"]',
              path: []
            }
          ]
        });
      })
    })
  });

});
