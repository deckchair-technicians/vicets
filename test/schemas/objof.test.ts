import {expect} from "chai";
import {isstring, matches, object, objof, schema} from "../../src/vice";


describe('objof', () => {
  it('returns array of conformed values', () => {
    const s = objof(schema((v) => v + " conformed"));
    expect(s.conform({a: "abc1", b: "abc2", c: "abc3"}))
      .deep.equals({a: "abc1 conformed", b: "abc2 conformed", c: "abc3 conformed"})
  });

  it('returns problems with path containing index of each item', () => {
    const s = objof(matches(/abc/));
    expect(s.conform({a: "invalid value", b: "abc2", c: "abc3", d: "another invalid value"}))
      .deep.equals({
      problems: [
        {
          message: "did not match /abc/",
          path: [
            'a'
          ]
        },
        {
          message: "did not match /abc/",
          path: [
            'd'
          ]
        }
      ]
    })
  });
  it('stacks paths correctly with object schema paths', () => {
    const schema = object({a: matches(/abc/)});
    const outerObject = object({obj: objof(schema)});
    expect(outerObject.conform({obj: {a: {a: "invalid value"}, b: {a: "invalid value"}}}))
      .deep.equals({
      problems: [
        {
          message: "did not match /abc/",
          path: [
            "obj",
            "a",
            "a"
          ]
        },
        {
          message: "did not match /abc/",
          path: [
            "obj",
            "b",
            "a"
          ]
        }
      ]
    })
  });
  it('json schema', async () => {
    expect(objof(isstring()).toJSON()).deep.eq({
      type: "object",
      patternProperties: {
        ".*": {
          type: "string"
        }
      }
    });
  })
});
