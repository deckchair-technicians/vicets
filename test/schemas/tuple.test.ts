import {expect} from 'chai';
import {eq, failure, opt, tuple, Schema} from "../..";
import {problem, problems} from "../../src/problems";
import {map} from "../../index";
import {HasUnexpectedItemBehaviour, UnexpectedItemBehaviour} from "../../src/impl/associative/associative";

describe('tuple()', () => {
  const s: Schema<any, [string, number]> & HasUnexpectedItemBehaviour = tuple(eq("valid"), eq(1));

  it('passes valid values through', () => {
    expect(s.conform(["valid", 1]))
      .deep.equals(["valid", 1]);
  });
  it('supports optional fields', () => {
    const optional: Schema<any, [number | undefined]> = tuple(opt(eq(1)));

    expect(optional.conform([1]))
      .deep.equals([1]);

    expect(optional.conform([undefined]))
      .deep.equals([undefined]);

    expect(optional.conform([]))
      .deep.equals([]);
  });
  it('appends key to path in problems', () => {
    expect(s.conform(["valid", 2]))
      .deep.equals(failure(
      "expected '1' but got number: 2",
      [1]));
  });
  it('can be nested', () => {
    const nested: Schema<object, [[number]]> = tuple(tuple(eq(1)));

    expect(nested.conform([[2]]))
      .deep.equals(failure(
      "expected '1' but got number: 2",
      [0, 0]));

    expect(nested.conform([[1]]))
      .deep.equals([[1]]);
  });
  it('complains when additional fields exist', () => {
    expect(s.conform(["valid", 1, "should not be here", "should not be here"]))
      .deep.equals(problems(
      problem(
        "Unexpected item",
        [2]),
      problem(
        "Unexpected item",
        [3])));
  });
  it('Can specify additional fields should be deleted', () => {
    expect(s.changeBehaviour(UnexpectedItemBehaviour.DELETE).conform(["valid", 1, "should not be here"]))
      .deep.equals(["valid", 1]);
    expect(s.changeBehaviour(UnexpectedItemBehaviour.DELETE).conform(["valid", 1, "should not be here", "should not be here"]))
      .deep.equals(["valid", 1]);
  });
  it('Can specify additional fields should be ignored', () => {
    expect(s.changeBehaviour(UnexpectedItemBehaviour.IGNORE).conform(["valid", 1, "should not be here", "should not be here"]))
      .deep.equals(["valid", 1, "should not be here", "should not be here"]);
  });
});