import {expect} from 'chai';
import {isnull, failure} from "../../";

describe('isnull', ()=>{
  it('works', ()=>{
    expect(isnull().conform(null)).to.equal(null);
    expect(isnull().conform(123))
      .deep.equals(failure("expected 'null' but got number: 123"));
  })
});