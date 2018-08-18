import {construct, data} from "../../src/data";
import {isstring} from "../../src/schemas";

@data
class A{
  a:string=isstring().__();
}

describe('construct', ()=>{
  it('works', ()=>{
    construct<A>(A, {a:"string"});
  })
});