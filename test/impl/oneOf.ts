import {expect} from "chai";
import {conform} from "../../src/helpers";
import {problem, problems} from "../../src/problems";
import {eq, gte, lt, anyOf} from "../../src/schemas";

describe('anyOf()', async () => {
  it('works with values', async () => {
    expect(conform(anyOf(1, 2, 3), 2)).deep.eq(2);
  });

  it('works with schemas', async () => {
    const s = anyOf(lt(2), gte(3));

    expect(conform(s, 1))
      .deep.eq(1);

    expect(conform(s, 2))
      .deep.eq(problems(
      problem("must be less than 2"),
      problem("must be greater than or equal to 3"),
    ));

    expect(conform(s, 3))
      .deep.eq(3);
  });

  it('works with mix of values and schemas', async () => {
    const s = anyOf(1, eq(2));

    expect(conform(s, 1))
      .deep.eq(1);

    expect(conform(s, 2))
      .deep.eq(2);

    expect(conform(s, 3))
      .deep.eq(problems(
      problem("expected \"1\" but got number: 3"),
      problem("expected \"2\" but got number: 3"),
    ));
  });
});