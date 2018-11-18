import {expect} from 'chai';
import {arrayof, matches, object, schema} from "../../src";

describe('arrayof', () => {
  it('returns array of conformed values', () => {
    const s = arrayof(schema((v) => v + " conformed"));
    expect(s.conform(["abc1", "abc2", "abc3"]))
      .deep.equals(["abc1 conformed", "abc2 conformed", "abc3 conformed"])
  });
  it('returns problems with path containing index of each item', () => {
    const s = arrayof(matches(/abc/));
    expect(s.conform(["invalid value", "abc2", "abc3", "another invalid value"]))
      .deep.equals({
      problems: [
        {
          message: "did not match /abc/",
          path: [
            0
          ]
        },
        {
          message: "did not match /abc/",
          path: [
            3
          ]
        }
      ]
    })
  });
  it('stacks paths correctly with object schema paths', () => {
    const schema = object({a: matches(/abc/)});
    const outerObject = object({array: arrayof(schema)});
    expect(outerObject.conform({array: [{a: "invalid value 1"}, {a: "invalid value 2"}]}))
      .deep.equals({
      problems: [
        {
          message: "did not match /abc/",
          path: [
            "array",
            0,
            "a"
          ]
        },
        {
          message: "did not match /abc/",
          path: [
            "array",
            1,
            "a"
          ]
        }
      ]
    })
  });

});