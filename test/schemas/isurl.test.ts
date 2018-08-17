import {expect} from 'chai';
import {isurl, Schema} from "../../";

describe('isurl', () => {
  const s: Schema<any, string> = isurl();
  it('passes through valid values', () => {
    expect(s.conform("http://google.com")).to.equal("http://google.com");
    expect(s.conform("http://google.com/test.html")).to.equal("http://google.com/test.html");
  });
  it('fails if value doesnt match pattern', () => {
    expect(s.conform("http://?google.com/test.html"))
      .deep.equals({problems: [{message: 'not a valid url: http://?google.com/test.html', path: []}]});

    expect(s.conform("http://localhost"))
      .deep.equals({problems: [{message: 'not a valid url: http://localhost', path: []}]});
  });
  it('passes through options', () => {
    const s: Schema<any, string> = isurl({require_tld:false});
    expect(s.conform("http://localhost/test.html")).to.equal("http://localhost/test.html");
  });
});