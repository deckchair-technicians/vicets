import {StringSchema} from "./schema";
import {Problems} from "../";
import {failure} from "../problems";

const validator = require("validator");

export interface IsURLOptions {
  protocols?: string[];
  require_tld?: boolean;
  require_protocol?: boolean;
  require_valid_protocol?: boolean;
  allow_underscores?: boolean;
  host_whitelist?: false | (string | RegExp)[];
  host_blacklist?: false | (string | RegExp)[];
  allow_trailing_dot?: boolean;
  allow_protocol_relative_urls?: boolean;
}

export class UrlSchema extends StringSchema {
  constructor(private readonly opts: IsURLOptions) {
    super();
  }

  conformString(value: string): Problems | string {
    if (validator.isURL(value, this.opts)) return value;
    return failure(`not a valid url: ${value}`)
  }
}