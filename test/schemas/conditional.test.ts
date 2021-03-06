import {expect} from "chai";
import {conditional, conform, isstring, object, problem, problems} from "../../src/vice";

describe('conditional()', () => {
  const animal = conditional()
    .case(
      {type: "cat"},
      object({
        type: "cat",
        meaow: isstring()
      }))
    .case(
      {type: "dog"},
      object({
        type: "dog",
        woof: isstring()
      }));

  it('matches successfully', () => {
    expect(conform(animal, {type: "cat", meaow: "hello"}))
      .deep.eq({type: "cat", meaow: "hello"});
  });

  it('returns errors from the appropriate schema', () => {
    expect(conform(animal, {type: "dog", meaow: "hello"}))
      .deep.eq(problems(
      problem('No value', ['woof']),
      problem('Unexpected item', ['meaow']),
    ));
  });

  it('returns errors from case schemas if none match', () => {
    expect(conform(animal, {type: "elephant"}))
      .deep.eq(problems(
      problem('could not match any case'),
      problem('expected "cat" but got string: "elephant"', ['type']),
      problem('expected "dog" but got string: "elephant"', ['type']),
    ));
  });

  it('json schema', async () => {
    expect(animal.toJSON()).deep.eq({
      if: {
        properties: {
          type: {
            const: "cat"
          }
        }
      },
      then: {
        properties: {
          meaow: {
            type: "string"
          },
          type: {
            const: "cat"
          }
        },
        required: [
          "type",
          "meaow"
        ],
        type: "object"
      },
      else: {
        if: {
          properties: {
            type: {
              const: "dog"
            }
          }
        },
        then: {
          properties: {
            type: {
              const: "dog"
            },
            woof: {
              type: "string"
            }
          },
          required: [
            "type",
            "woof"
          ],
          type: "object"
        }
      }
    });
  })
});