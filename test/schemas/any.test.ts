import {expect} from 'chai';
import {isany} from "../../src";

describe('isany', () => {
  it('works', () => {
    expect(isany().conform('a')).to.equal('a');
  })
});