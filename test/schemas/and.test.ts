import {expect} from 'chai';
import {failure, schema} from "../../src";

describe('and', () => {
  it('Passes result of first schema to second, and so on', () => {
    const s = schema((x) => `${x} => first`)
      .and(schema((x) => `${x} => second`));

    expect(s.conform("value")).equals("value => first => second");
  });
  it('Short circuits on first failure', () => {
    const s =
      schema((x) => failure("short circuit"))
        .and(schema((x) => "should never get here"));

    expect(s.conform("anything")).deep.equals(failure("short circuit"));
  });
});
