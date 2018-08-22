import {expect} from 'chai';
import {__, data, failure, isdata} from "../../";
import {arrayof} from "../../src/schemas";

describe('Recursion', () => {
  @data
  class Me {
    constructor(public field: Me[] = __(arrayof(isdata(Me)))) {
    }
  }

  it('conforms valid values', () => {
    expect(new Me([new Me([])])).deep.equals({field: [{field: []}]});
  });

  it('fails as expected', () => {
    expect(isdata(Me).conform({field: [{field: "not valid"}]}))
      .deep.equals(failure("string was not an Array", ["field", 0, "field"]));
  });
});