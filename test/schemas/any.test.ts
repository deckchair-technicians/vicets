import {expect} from 'chai';
import {isany} from "../../";

describe('isany', () => {
  it('works', () => {
    expect(isany().conform('a')).to.equal('a');
  })
});