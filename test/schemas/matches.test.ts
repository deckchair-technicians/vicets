import {expect} from 'chai';
import {matches, Schema} from "../../src/vice";

describe('matches', () => {
  const s: Schema<any, string> = matches(/.*abc.*/);
  it('passes through valid values', () => {
    expect(s.conform("123abc456")).to.equal('123abc456');
    expect(s.conform("abcabc")).to.equal('abcabc');
  });
  it('fails if value doesnt match pattern', () => {
    expect(s.conform("does not match")).deep.equals({problems: [{message: 'did not match /.*abc.*/', path: []}]});
  });
  it('json schema', async () => {
    expect(s.toJSON()).deep.eq({
      type: "string",
      pattern: ".*abc.*",
    });
  })});
