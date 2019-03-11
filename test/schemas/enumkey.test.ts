import {expect} from 'chai';
import {enumkey} from "../../src/vice";

describe('enumkey', () => {
  describe('String enums', () => {
    enum WithStringValues {
      a = 'a value',
      b = 'b value'
    }

    const s = enumkey(WithStringValues);

    it('works for keys', () => {
      expect(s.conform('a')).to.equals(WithStringValues.a);
      expect(s.conform('b')).to.equals(WithStringValues.b);
    });
    it('does not work for values', () => {
      expect(s.conform('a value')).deep.equals({
        problems: [
          {
            message: 'expected one of ["a", "b"]',
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

    const s = enumkey(NoValues);
    it('accepts keys', () => {
      expect(s.conform('a')).to.equals(NoValues.a);
      expect(s.conform('b')).to.equals(NoValues.b);
    });
    it('fails for invalid input, including values', () => {
      expect(s.conform('0'))
        .deep.equals({
        problems: [
          {
            message: 'expected one of ["a", "b"]',
            path: []
          }
        ]
      });
    });
  });

  describe('Enums with mixed initializers', () => {
    enum NumericValues {
      a,
      b = 2,
      c = 'c value'
    }

    const s = enumkey(NumericValues);
    it('accepts keys', () => {
      expect(s.conform('a')).to.equals(NumericValues.a);
      expect(s.conform('b')).to.equals(NumericValues.b);
      expect(s.conform('c')).to.equals(NumericValues.c);
    });
    it('fails for invalid input, including values', () => {
      expect(s.conform('c value'))
        .deep.equals({
        problems: [
          {
            message: 'expected one of ["a", "b", "c"]',
            path: []
          }
        ]
      });
    });
  });
});
