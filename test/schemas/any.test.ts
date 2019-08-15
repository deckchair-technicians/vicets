import {expect} from 'chai';
import {isany} from "../../src/vice";

describe('isany', () => {
  it('works', () => {
    expect(isany().conform('a')).to.equal('a');
  });
  it('json schema', () => {
    expect(isany().toJSON()).to.equal(true);
  });
});
