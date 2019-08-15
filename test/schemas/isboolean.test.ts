import {expect} from 'chai';
import {failure, isboolean, isnumber, Schema} from "../../src/vice";

describe('isboolean()', () => {
  const s: Schema<any, boolean> = isboolean();

  it('works for booleams', () => {
    expect(s.conform(true)).to.equal(true);
    expect(s.conform(false)).to.equal(false);
  });
  it('works for strings', () => {
    expect(s.conform("TRUE")).to.equal(true);
    expect(s.conform("FALSE")).to.equal(false);
    expect(s.conform("true")).to.equal(true);
    expect(s.conform("false")).to.equal(false);
  });
  it('rejects invalid strings', () => {
    expect(s.conform("TRUE ")).deep.equal(failure("expected a boolean"));
    expect(s.conform("FALSEE")).deep.equal(failure("expected a boolean"));
  });
  it('rejects non-booleans', () => {
    expect(s.conform(1)).deep.equals(failure("expected a boolean", []));
  });
  it('json schema', async () => {
    expect(s.toJSON()).deep.eq({
      type: "boolean"
    });

  });
});
