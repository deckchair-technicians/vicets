import {expect} from 'chai';
import {failure, isundefined} from "../../index";

describe('isundefined', () => {
  it('works', () => {
    expect(isundefined().conform(undefined)).to.equal(undefined);
    expect(isundefined().conform(123))
      .deep.equals(failure("expected 'undefined' but got number: 123"));
  })
});