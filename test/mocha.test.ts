import {expect} from "chai";
import {like} from "../src/mocha";
import {arrayof, eq, object} from "../src/schemas";

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

  it('fails with an AssertionError expected, actual and ', () => {
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
      notInPattern: 'right'
    };

    const pattern = {
      right: 'right',
      wrong: 'right',
      nested: arrayof(object({
        right: 'right',
        wrong: 'right'
      })),
      array: ['right', /right/, eq('right')], // can use schemas and regexp as values
      missing: 'right',
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
          wrong: ["expected 'right' but got string: \"incorrect value\""],
          nested: [
            {
              right: 'right',
              wrong: ["expected 'right' but got string: \"incorrect value\""]
            }],
          array: [
            'right',
            'right',
            ["expected 'right' but got string: \"incorrect value\""]
          ],
          missing: ["No value"],
          notInPattern: "right"
        });
    }
  });
});