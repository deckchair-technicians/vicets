import {expect} from 'chai';
import {failure, range} from "../../src/vice";

describe('range(), gt(), gte(), lt(), lte()', () => {

  it('gte()', () => {
    const s = range(1, 10, {lowerInclusive: true});
    expect(s.conform(1))
      .deep.equals(1);
    expect(s.conform(0.9))
      .deep.equals(failure('must be greater than or equal to 1'));
  });

  it('gt()', () => {
    const s = range(1, 10, {lowerInclusive: false});
    expect(s.conform(1))
      .deep.equals(failure('must be greater than 1'));
    expect(s.conform(1.1))
      .deep.equals(1.1);
  });

  it('lte()', () => {
    const s = range(1, 10, {upperInclusive: true});
    expect(s.conform(10))
      .deep.equals(10);
    expect(s.conform(10.1))
      .deep.equals(failure('must be less than or equal to 10'));
  });

  it('lt()', () => {
    const s = range(1, 10, {upperInclusive: false});
    expect(s.conform(10))
      .deep.equals(failure('must be less than 10'));
    expect(s.conform(9.9))
      .deep.equals(9.9);
  });
});
