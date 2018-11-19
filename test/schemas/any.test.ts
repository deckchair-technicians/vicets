import {expect} from 'chai';
import {isany} from "../../index";

describe('isany', () => {
  it('works', () => {
    expect(isany().conform('a')).to.equal('a');
  })
});