import {expect} from 'chai';
import {eq, failure, override} from "../../index";

describe('override', () => {

  it('conforms as usual', () => {
    const s = override(
      eq(1),
      {failure: (x) => failure("overridden")});

    expect(s.conform(1))
      .equals(1);
  });

  it('allows overriding failure message with a string', () => {
    const s = override(
      eq(1),
      {failure: "overridden"});

    expect(s.conform(2))
      .deep.equals(failure("overridden"));
  });

  it('allows overriding failure message with a function', () => {
    const s = override(
      eq(1),
      {failure: (x) => failure(`overridden ${x}`)});

    expect(s.conform(2))
      .deep.equals(failure("overridden 2"));
  });

  it('does not override failure message if no override is provided', () => {
    const noOverride = override(
      eq(1),
      {});

    expect(noOverride.conform(2))
      .deep.equals(failure("expected '1' but got number: 2"));
  });
});