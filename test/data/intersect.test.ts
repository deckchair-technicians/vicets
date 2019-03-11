import {expect} from "chai";
import {__, intersect, conformAs, construct, data, eq, failure, matches, problem, problems, schema} from "../../src/vice";

describe('Intersecting @data classes', () => {
  @data
  class A {
    a: string = __(eq("valid a"));
  }

  @data
  class B {
    b: string = __(eq("valid b"));
  }

  class C extends intersect(A, B) {
  }

  const valid: A & B = construct(C, {a: "valid a", b: "valid b"});

  it('passes through valid data', () => {
    expect(valid)
      .deep.equals({a: "valid a", b: "valid b"});

  });
  it('reports errors from left @data class', () => {
    expect(conformAs(C, {a: "INVALID", b: "valid b"}))
      .deep.equals(failure("expected 'valid a' but got string: \"INVALID\"", ["a"]));

  });
  it('reports errors from right @data class', () => {
    expect(conformAs(C, {a: "valid a", b: "INVALID"}))
      .deep.equals(failure("expected 'valid b' but got string: \"INVALID\"", ["b"]));

  });
  it('instanceof does not work for source classes, if it needs saying', () => {
    expect(valid)
      .not.instanceOf(A);
    expect(valid)
      .not.instanceOf(B);
  });
  describe('Shared field', () => {
    @data
    class Abc {
      a: string | number = __(matches(/abc/));
    }

    @data
    class Def {
      a: string = __(matches(/def/));
    }

    class AbcDef extends intersect(Abc, Def) {
    }

    it('values for shared keys must be valid in both classes', () => {
      const valid = conformAs(AbcDef, {a: "abcdef"});
      expect(valid).deep.equals({a: "abcdef"});
    });
    it('conformed result is passed left to right', () => {
      @data
      class CoerceToUpper {
        a: string = __(schema((x: string) => x.toUpperCase()));
      }

      @data
      class RequiresUpperCase {
        a: string = __(matches(/[A-Z]+/));
      }

      class CoerceAndValidate extends intersect(CoerceToUpper, RequiresUpperCase) {
      }

      expect(conformAs(CoerceAndValidate, {a: "lowercase"}))
        .deep.equals({a: "LOWERCASE"});

      class ValidateAndCoerce extends intersect(RequiresUpperCase, CoerceToUpper) {
      }

      expect(conformAs(ValidateAndCoerce, {a: "lowercase"}))
        .deep.equals(failure("did not match /[A-Z]+/", ["a"]));

      expect(conformAs(ValidateAndCoerce, {a: "UPPERCASE"}))
        .deep.equals({a: "UPPERCASE"});
    });
    it('values for shared keys must be valid in both classes', () => {
      expect(conformAs(AbcDef, {a: "def"}))
        .deep.equals(problems(
        problem("did not match /abc/", ["a"])));

      expect(conformAs(AbcDef, {a: "abc"}))
        .deep.equals(problems(
        problem("did not match /def/", ["a"])));
    });
  });
});
