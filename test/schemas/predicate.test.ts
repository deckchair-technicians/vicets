import {expect} from 'chai';
import {failure, predicate} from "../../src";

describe('predicate', () => {
  it('Uses function body as failure message', () => {
    const isEven = predicate<number>((x) => x % 2 === 0);

    expect(isEven.conform(1)).deep.equals(failure("(x) => x % 2 === 0"));
    expect(isEven.conform(2)).equals(2);
  });

  it('Accepts a failure message string', () => {
    const s = predicate((x) => x === 2, "!== 2");

    expect(s.conform(1)).deep.equals(failure("!== 2"));
    expect(s.conform(2)).equals(2);
  });

  it('Accepts a failure message function', () => {
    const s = predicate((x) => x === 2, (v) => `${v} !== 2`);

    expect(s.conform(1)).deep.equals(failure("1 !== 2"));
    expect(s.conform(2)).equals(2);
  })
})