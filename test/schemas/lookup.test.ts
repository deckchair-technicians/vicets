import {expect} from 'chai';
import {lookup, Schema, Problems} from "../../";

describe('lookup', () => {
  describe('Basics', () => {
    const s: Schema<any, string> = lookup({
      a: "a value",
      b: "b value"
    });

    it('looks values up in the provided object', () => {
      expect(s.conform('a')).to.equal('a value');
      expect(s.conform('b')).to.equal('b value');
    });
    it("returns problems if the key doesn't exist", () => {
      expect(s.conform('c')).deep.equals({
        problems: [
          {
            message: 'expected one of ["a", "b"]',
            path: []
          }
        ]
      });
    });
    it("returns problems if value isn't a string", () => {
      expect(s.conform({})).deep.equals({
        problems: [
          {
            message: 'expected a string but got object',
            path: []
          }
        ]
      });
    });
  });
  describe('Generic signature', () => {
    it('figures out type of output based on shape of class', () => {
      // Mostly just demonstrating that this compiles
      class A {
        constructor(public a: string,
                    public b: number) {
        }
      }

      const s: Schema<any, A[keyof A]> = lookup(new A('a value', 123));
      const value: Problems | string | number = s.conform('a');
      expect(value).to.equal('a value')
    });

    it('figures out type of output based on shape of literal', () => {
      // Mostly just  demonstrating that this compiles
      const s: Schema<any, string | number> = lookup({a: "a value", b: 123});
      const value: Problems | string | number = s.conform('a');
      expect(value).to.equal('a value')
    });
  });
});