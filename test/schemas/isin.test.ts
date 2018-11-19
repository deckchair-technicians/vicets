import {expect} from 'chai';
import {isIn, Schema} from "../../index";

describe('isin', () => {
  const s: Schema<any, string> = isIn('a', 'b', 'c');
  it('passes through valid values', () => {
    expect(s.conform("a")).to.equal('a');
    expect(s.conform("b")).to.equal('b');
    expect(s.conform("c")).to.equal('c');
  });
  it('fails if value not in set', () => {
    expect(s.conform("not in set")).deep.equals({problems: [{message: 'expected one of [a, b, c]', path: []}]});
  })
});
