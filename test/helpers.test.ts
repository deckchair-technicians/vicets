import {expect} from "chai";
import {isstring, object, UnexpectedItemBehaviour, validate} from "../src/vice";

describe('validate()', async () => {
  it('passes down options', async () => {
    const schema = object({field: isstring()});

    const result = validate(
      schema,
      {field: "ok", unexpected: 1234},
      {unexpected: UnexpectedItemBehaviour.IGNORE});

    expect(result).deep.eq({field: "ok", unexpected: 1234});
  });
});