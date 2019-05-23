import {expect} from 'chai';
import {typeDescription} from "../../../src/impl/util/types";

describe('typeDescription', () => {
  it('works for plain object', () => {
    expect(typeDescription({})).equals('object');
  });

  class A {

  }

  it('works for class instance', () => {
    expect(typeDescription(new A())).equals('A');
  });
  it('works for string', () => {
    expect(typeDescription("string")).equals('string');
  });
  it('works for null', () => {
    expect(typeDescription(null)).equals('null');
  });
  it('works for undefined', () => {
    expect(typeDescription(null)).equals('null');
  });
});