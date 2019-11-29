import {expect} from 'chai';
import {eq, failure, object, onUnexpected, opt, Schema, UnexpectedItemBehaviour} from "../../src/vice";

describe('object', () => {
  it('Appends key to path in problems', () => {
    const s: Schema<object, object> = object({a: eq(1)});

    expect(s.conform({a: 2})).deep.equals(failure(
      'expected "1" but got number: 2',
      ['a']));
    expect(s.conform({a: 1})).deep.equals({a: 1});
  });

  it('Treats non-schema primitive values as eq(value)', () => {
    const s: Schema<object, object> = object({a: 1});

    expect(s.conform({a: 2})).deep.equals(failure(
      'expected "1" but got number: 2',
      ['a']));
    expect(s.conform({a: 1})).deep.equals({a: 1});
  });

  it('Treats non-schema object values as further Schemas', () => {
    const s: Schema<object, object> = object({a: {b: 1}});

    expect(s.conform({a: {b: 2}})).deep.equals(failure(
      'expected "1" but got number: 2',
      ['a', 'b']));
    expect(s.conform({a: {b: 1}})).deep.equals({a: {b: 1}});
  });

  it('Complains when additional fields exist', () => {
    const s: Schema<object, object> = object({});

    expect(s.conform({unexpected: "whatever"})).deep.equals(failure(
      "Unexpected item",
      ['unexpected']));
  });

  it('Can specify additional fields should be deleted', () => {
    const s: Schema<object, object> =
      onUnexpected(
        object({}),
        UnexpectedItemBehaviour.DELETE);

    expect(s.conform({unexpected: 'whatever'}))
      .deep.equals({});
  });

  it('Can specify additional fields should be ignored', () => {
    const s: Schema<object, object> =
      onUnexpected(
        object({}),
        UnexpectedItemBehaviour.IGNORE);

    expect(s.conform({unexpected: 'whatever'}))
      .deep.equals({unexpected: 'whatever'});
  });

  it('Can be nested', () => {
    const s: Schema<object, object> = object({a: object({b: eq(1)})});

    expect(s.conform({a: {b: 2}})).deep.equals(failure(
      'expected "1" but got number: 2',
      ['a', 'b']));
    expect(s.conform({a: {b: 1}})).deep.equals({a: {b: 1}});
  });

  it('works with nulls', () => {
    const s: Schema<any, any> = object({a: null as any});

    expect(s.conform({a: null})).deep.equals({a: null});
    expect(s.conform({a: 'not null'})).deep.equals(failure(
      'expected "null" but got string: "not null"',
      ['a']));
  });

  it('works with undefined', () => {
    const s: Schema<object, object> = object({a: undefined as any});

    expect(s.conform({a: undefined})).deep.equals({a: undefined});
    expect(s.conform({a: 'not undefined'})).deep.equals(failure(
      'expected "undefined" but got string: "not undefined"',
      ['a']));
  });
  it('json schema',  () => {
    expect(object({a: eq(1)}).toJSON()).deep.eq({
      type: "object",
      properties: {
        a: {const: 1}
      },
      required: ['a']
    });
  });
  it('json schema with opt fields',  () => {
    expect(object({a: opt(eq(1))}).toJSON()).deep.eq({
      type: "object",
      properties: {
        a: {const: 1}
      },
      required: []
    });
  })
});
