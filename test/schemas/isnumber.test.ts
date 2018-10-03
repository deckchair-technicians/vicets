import {expect} from 'chai';
import {isnumber, Schema} from "../..";
import {failure} from "../../src/problems";

describe('isnumber', () => {
  const s: Schema<any, number> = isnumber();

  it('works for numbers', () => {
    expect(s.conform(123)).to.equal(123);
    expect(s.conform(1.23)).to.equal(1.23);
  });
  it('rejects non-numbers', () => {
    expect(s.conform("not a number")).deep.equals(failure("expected a number", []));
  });
});