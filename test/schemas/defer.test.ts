import {expect} from 'chai';
import {failure, arrayof, defer, object} from "../../index";

describe('defer()', () => {
  const s = arrayof(object({more: defer(() => s)}));

  it('conforms valid values', () => {
    expect(s.conform([{more: [{more: []}, {more: []}]}]))
      .deep.equals([{more: [{more: []}, {more: []}]}]);
  });

  it('produces sensible errors', () => {
    expect(s.conform([{more: [{more: []}, {more: ["invalid"]}]}]))
      .deep.equals(failure("expected an object but got string", [0, "more", 1, "more", 0]));
  });
});