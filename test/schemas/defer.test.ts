import {expect} from 'chai';
import {arrayof, defer, failure, jsonSchema, object} from "../../src/vice";

export interface Annotations {
  title?: string;
  description?: string;
  default?: string;
  examples?: any[];
}

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

  it('json schema', () => {
    expect(jsonSchema({
      id: "github.com/deckchairtechnicians/vicets/example",
      definitions: {someId: s}
    }))
      .deep.equals({
      $schema: "http://json-schema.org/draft-07/schema#",
      id: "github.com/deckchairtechnicians/vicets/example",
      definitions: {
        someId: {
          contains: {
            properties: {
              more: {
                $ref: "#/definitions/someId"
              }
            },
            required: [
              "more"
            ],
            type: "object"
          },
          type: "array"
        }
      },
    });
  });
});
