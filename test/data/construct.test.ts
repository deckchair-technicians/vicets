import {construct, data} from "../../src/data";
import {isstring} from "../../src/schemas";

describe('using construct() on @data classes', () => {
  @data
  class A {
    a: string = isstring().__();
  }


  it('works', () => {
    construct<A>(A, {a: "string"});
  })
});