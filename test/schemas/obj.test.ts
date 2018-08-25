import {expect} from 'chai';
import {failure, object, Schema, eq} from "../..";

describe('object', () => {
  it('Appends key to path in problems', () => {
    const s: Schema<object, object> = object({a: eq(1)});

    expect(s.conform({a: 2})).deep.equals(failure(
      "expected '1' but got number: 2",
      ['a']));
    expect(s.conform({a: 1})).deep.equals({a: 1});
  });

  it('Can be nested', () => {
    const s: Schema<object,object> = object({a: {b: eq(1)}});

    expect(s.conform({a: {b: 2}})).deep.equals(failure(
      "expected '1' but got number: 2",
      ['a', 'b']));
    expect(s.conform({a: {b: 1}})).deep.equals({a: {b: 1}});
  });
});