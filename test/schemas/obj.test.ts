import {expect} from 'chai';
import {eq, failure, object, Schema, UnexpectedItemBehaviour} from "../..";

describe('object', () => {
  it('Appends key to path in problems', () => {
    const s: Schema<object, object> = object({a: eq(1)});

    expect(s.conform({a: 2})).deep.equals(failure(
      "expected '1' but got number: 2",
      ['a']));
    expect(s.conform({a: 1})).deep.equals({a: 1});
  });
  it('Complains when additional fields exist', () => {
    const s: Schema<object, object> = object({});

    expect(s.conform({unexpected: "whatever"})).deep.equals(failure(
      "Unexpected item",
      ['unexpected']));
  });
  it('Can specify additional fields should be deleted', () => {
    const s: Schema<object, object> = object({})
      .onUnexpected(UnexpectedItemBehaviour.DELETE);

    expect(s.conform({unexpected: 'whatever'}))
      .deep.equals({});
  });
  it('Can specify additional fields should be ignored', () => {
    const s: Schema<object, object> = object({})
      .onUnexpected(UnexpectedItemBehaviour.IGNORE);

    expect(s.conform({unexpected: 'whatever'}))
      .deep.equals({unexpected: 'whatever'});
  });
  it('Can be nested', () => {
    const s: Schema<object, object> = object({a: {b: eq(1)}});

    expect(s.conform({a: {b: 2}})).deep.equals(failure(
      "expected '1' but got number: 2",
      ['a', 'b']));
    expect(s.conform({a: {b: 1}})).deep.equals({a: {b: 1}});
  });
});