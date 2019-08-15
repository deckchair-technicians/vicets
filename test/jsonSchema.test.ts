import {expect} from "chai";
import {data} from "../src/data";
import {jsonSchema} from "../src/jsonSchema";
import {__, isdata, isstring, isuuid, matches, opt} from "../src/schemas";


describe('jsonSchema()', async () => {
  it('replaces subschemas with refs', async () => {
    const isPostCode = matches(/([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))\s?[0-9][A-Za-z]{2})/);

    @data
    class Address {
      firstLine: string = __(isstring());
      secondLine: string = __(isstring());
      town: string = __(isstring());
      postcode: string = __(isPostCode);
    }

    @data
    class User {
      id: string = __(isuuid());
      username: string = __(isstring());
      address?: Address = __(opt(isdata(Address)));
    }

    const isUser = isdata(User);
    const isAddress = isdata(Address);

    const opts = {
      id: "github.com/deckchairtechnicians/vicets/example",
      definitions: {
        "user": isUser,
        "address": isAddress,
        "postcode": isPostCode,
      }
    };
    expect(jsonSchema(opts))
      .deep.eq({
      $schema: "http://json-schema.org/draft-07/schema#",
      id: "github.com/deckchairtechnicians/vicets/example",
      definitions: {
        user: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              pattern: "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89ab][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$"
            },
            username: {
              type: "string",
            },
            address: {$ref: "#/definitions/address"}
          },
          required: [
            "id",
            "username",
          ]
        },
        address: {
          type: "object",
          properties: {
            firstLine: {type: "string"},
            secondLine: {type: "string"},
            town: {type: "string"},
            postcode: {$ref: "#/definitions/postcode"},
          },
          required: [
            "firstLine",
            "secondLine",
            "town",
            "postcode",
          ]

        },
        postcode: {
          type: "string",
          pattern: "([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))\\s?[0-9][A-Za-z]{2})"
        }
      }
    });
  });
});