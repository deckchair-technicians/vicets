import {expect} from 'chai';
import {arrayof, defer, object} from "../../src/schemas";
import {failure} from "../../src/problems";

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