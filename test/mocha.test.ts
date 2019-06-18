import {expect} from "chai";
import {like} from "../src/mocha";
import {problem, problems} from "../src/problems";
import {arrayof, eq, object, schema} from "../src/schemas";

describe('vice mocha integration', () => {
  it('passes', () => {
    like(
      {thing: 1},
      {thing: 1});
  });

  it('ignores extra fields by default', () => {
    like(
      {thing: 1, ignored: 'ignored'},
      {thing: 1});
  });

  it('fails with an AssertionError with expected, actual and showDiff=true', () => {
    const actual = {
      right: 'right',
      wrong: 'incorrect value',
      array: [
        'right',
        'right',
        'incorrect value'],
      nested: [{
        right: 'right',
        wrong: 'incorrect value'
      }],
      notInPattern: 'right',
      multipleProblems: 'incorrect value',
    };

    const pattern = {
      right: 'right',
      wrong: 'right',
      nested: arrayof(object({
        right: 'right',
        wrong: 'right',
        missing: 'right'
      })),
      array: ['right', /right/, eq('right')], // can use schemas and regexp as values
      missing: 'right',
      multipleProblems: schema(() => problems(problem("first problem"), problem("second problem")))
    };

    try {
      like(actual, pattern);

      throw new Error('Expected exception');

    } catch (e) {

      expect(e.message).contains('wrong').contains('incorrect value');

      expect(e.actual).deep.eq(actual);

      expect(e.expected).deep.eq(
        {
          right: 'right',
          wrong: "expected 'right' but got string: \"incorrect value\"",
          nested: [
            {
              right: 'right',
              wrong: "expected 'right' but got string: \"incorrect value\"",
              missing: "No value"
            }],
          array: [
            'right',
            'right',
            "expected 'right' but got string: \"incorrect value\""
          ],
          missing: "No value",
          notInPattern: "right",
          multipleProblems: ["first problem", "second problem"],
        });
    }
  });

  it('fails with an AssertionError when passed an array', () => {
    const actual = [{
      wrong: 'incorrect value',
    }];

    const pattern = [{
      wrong: 'right',
    }];

    try {
      like(actual, pattern);
      throw new Error('Expected exception');

    } catch (e) {

      expect(e.message).contains('wrong').contains('incorrect value');

      expect(e.actual).deep.eq(actual);

      expect(e.expected).deep.eq([
        {
          wrong: "expected 'right' but got string: \"incorrect value\"",
        }]);
    }
  });

});