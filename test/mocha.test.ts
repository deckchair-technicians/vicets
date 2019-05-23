import {expect} from "chai";
import {like} from "../src/mocha";
import {eq} from "../src/schemas";

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
      wrong: 'incorrect value',
      array: [
        'right',
        'right',
        'incorrect value'],
      right: 'right'
    };

    const pattern = {
      wrong: 'right',
      array: ['right', /right/, eq('right')], // can use schemas and regexp as values
      right: 'right',
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
          wrong: {
            value: 'incorrect value',
            errors: ["expected 'right' but got string: \"incorrect value\""]
          },
          array: [
            'right',
            'right',
            {
              value: 'incorrect value',
              errors: ["expected 'right' but got string: \"incorrect value\""]
            }],
          right: 'right',
          missing: {
            value: undefined,
            errors: ["No value"]
          }
        });
    }
  });
});