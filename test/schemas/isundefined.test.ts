import {expect} from 'chai';
import {failure, isundefined} from "../../src/vice";

describe('isundefined', () => {
  it('works', () => {
    expect(isundefined().conform(undefined)).to.equal(undefined);
    expect(isundefined().conform(123))
      .deep.equals(failure('expected "undefined" but got number: 123'));
  });
  it('json schema', async () => {
    // TODO: this is stupid and wrong
    expect(isundefined().toJSON()).deep.eq({const: undefined});
  });
});
