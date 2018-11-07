import {expect} from "chai";
import {problem, problems} from "../../src/problems";
import {unique} from "../../src/schemas";

describe('unique', () => {
  it('passes through values', () => {
    const s = unique();
    expect(s.conform([1, 2, 3])).deep.eq([1, 2, 3])
  });
  it('fails on non-unique', () => {
    const s = unique();
    expect(s.conform([1, 1, 1])).deep.eq(
      problems(
        problem("duplicate at indexes: [0,1,2]", [0]),
        problem("duplicate at indexes: [0,1,2]", [1]),
        problem("duplicate at indexes: [0,1,2]", [2])))
  })
});