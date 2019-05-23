import {expect} from 'chai';
import {addGetter} from "../../src/impl/util/magic";
import {deepPartial, eq, failure, Schema} from "../../src/vice";

describe('deepPartial()', () => {
  it('works with simple scalar values', () => {
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

  it('works with more complex values', () => {
    type Example = { a: { b: number }, c: number }

    const s: Schema<object, Example> = deepPartial<Example>({a: {b: eq(1)}});

    expect(s.conform({a: {b: 2}})).deep.equals(failure(
      "expected '1' but got number: 2",
      ['a', 'b']));
    expect(s.conform({a: {b: 1}, c: 1})).deep.equals({a: {b: 1}, c: 1});
  });

  it('works with arrays', () => {
    type Example = { a: number[] }

    const s: Schema<object, Example> = deepPartial<Example>({a: [1, 2, eq(3)]});

    expect(s.conform({a: [1, 2, 2]})).deep.equals(failure(
      "expected '3' but got number: 2",
      ['a', 2]));

    expect(s.conform({a: [1, 2]})).deep.equals(failure(
      "No value",
      ['a', 2]));

    expect(s.conform({a: [1, 2, 3]})).deep.equals({a: [1, 2, 3]});
  });

  it('does not execute getters', () => {
    const obj = {
      a: 1,
      b: 2
    };
    let bGetterCalled = false;
    addGetter(obj, 'b', () => {
      bGetterCalled = true;
      return 3;
    });

    const conformed = deepPartial({a: eq(1)}).conform(obj);

    expect(bGetterCalled).eq(false);
    expect(conformed).deep.equals({a: 1, b: 3});
    expect(bGetterCalled).eq(true);
  });
});
