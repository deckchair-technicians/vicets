import {expect} from 'chai';
import {deepPartial, eq, failure, matches, object, Schema} from "../../index";

describe('deepPartial()', () => {
  it('object with deepPartial', () => {
    type Example = {
      a: number,
      b: number
    }
    const s: Schema<object, Example> = deepPartial<Example>({a: eq(1)});

    expect(s.conform({a: 2})).deep.equals(failure(
      "expected '1' but got number: 2",
      ['a']));
    expect(s.conform({})).deep.equals(failure(
      "No value",
      ['a']));
    expect(s.conform({a: 1})).deep.equals({a: 1});
  });

  it('object with deepPartial- nesting', () => {
    type Example = { a: { b: number }, c: number }

    object({url: {path: matches(/asdsa/)}});

    const s: Schema<object, Example> = deepPartial<Example>({a: {b: eq(1)}});

    expect(s.conform({a: {b: 2}})).deep.equals(failure(
      "expected '1' but got number: 2",
      ['a', 'b']));
    expect(s.conform({a: {b: 1}, c: 1})).deep.equals({a: {b: 1}, c: 1});
  });
});