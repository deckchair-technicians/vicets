import {expect} from 'chai';
import {failure, isnull} from "../../src/vice";

describe('isnull', () => {
  it('works', () => {
    expect(isnull().conform(null)).to.equal(null);
    expect(isnull().conform(123))
      .deep.equals(failure('expected "null" but got number: 123'));
  });
  it('json schema', async () => {
    expect(isnull().toJSON()).deep.eq({const:null});
  });
});
