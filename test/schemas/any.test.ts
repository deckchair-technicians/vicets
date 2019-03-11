import {expect} from 'chai';
import {isany} from "../../src/vice";

describe('isany', () => {
  it('works', () => {
    expect(isany().conform('a')).to.equal('a');
  })
});
