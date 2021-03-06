import {isstring, construct, data} from "../../src/vice";

describe('using construct() on @data classes', () => {
  @data
  class A {
    a: string = isstring().__();
  }


  it('works', () => {
    construct<A>(A, {a: "string"});
  })
});
