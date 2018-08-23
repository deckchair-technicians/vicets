import {expect} from "chai";
import {
  __,
  conform,
  construct,
  data,
  eq,
  extractSchema,
  failure,
  hasSchema,
  matches,
  problem,
  problems,
  schema
} from "../../";
import {Constructor} from "../../src/impl/util";

function intersect<A, B>
(a: Constructor<A>, b: Constructor<B>): Constructor<A & B> {

  const schema = extractSchema(a).intersect(extractSchema(b));

  @hasSchema(schema)
  class Intersection {
  }

  for (let id in a.prototype) {
    (<any>Intersection.prototype)[id] = (<any>a.prototype)[id];
  }
  for (let id in b.prototype) {
    if (!Intersection.prototype.hasOwnProperty(id)) {
      (<any>Intersection.prototype)[id] = (<any>b.prototype)[id];
    }
  }
  return Intersection as any as Constructor<A & B>;
}

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
    expect(conform(C, {a: "INVALID", b: "valid b"}))
      .deep.equals(failure("expected 'valid a' but got string: \"INVALID\"", ["a"]));

  });
  it('reports errors from right @data class', () => {
    expect(conform(C, {a: "valid a", b: "INVALID"}))
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
      const valid = conform(AbcDef, {a: "abcdef"});
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

      expect(conform(CoerceAndValidate, {a: "lowercase"}))
        .deep.equals({a: "LOWERCASE"});

      class ValidateAndCoerce extends intersect(RequiresUpperCase, CoerceToUpper) {
      }

      expect(conform(ValidateAndCoerce, {a: "lowercase"}))
        .deep.equals(failure("did not match /[A-Z]+/",["a"]));

      expect(conform(ValidateAndCoerce, {a: "UPPERCASE"}))
        .deep.equals({a: "UPPERCASE"});
    });
    it('values for shared keys must be valid in both classes', () => {
      expect(conform(AbcDef, {a: "def"}))
        .deep.equals(problems(
        problem("did not match /abc/", ["a"])));

      expect(conform(AbcDef, {a: "abc"}))
        .deep.equals(problems(
        problem("did not match /def/", ["a"])));
    });
  });
});