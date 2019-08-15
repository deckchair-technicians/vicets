import {expect} from 'chai';
import {fail, failure, isany} from "../../src/vice";

describe('fail()', () => {
  it('works', () => {
    expect(fail().conform('a'))
      .deep.eq(failure('always fails'));
  });
  it('can set custom message', () => {
    expect(fail(failure('oh dear')).conform('a'))
      .deep.eq(failure('oh dear'));
  });
  it('json schema', () => {
    expect(fail().toJSON()).to.equal(false);
  });
});
