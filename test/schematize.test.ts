import {fail} from "assert";
import {expect} from 'chai';
import "reflect-metadata";
import {typeDescription} from "../src/impl/util/types";
import {eq, Schema, schematize} from "../src/vice";

describe('schematize', () => {
  xit('Returns InstanceOfSchema for classes', () => {
    fail('Not implemented')
  });

  it('Passthrough on anything that is already a schema', () => {
    const s = eq(1) as any as Schema<number, number>;
    expect(schematize(s)).equals(s);
  });

  it('Turns plain objects into ObjectSchema', () => {
    const s = schematize({a: eq(1)});
    expect(typeDescription(s)).to.equal('ObjectSchema');
  });

  it('Turns primitives into EqualsSchema', () => {
    expect(typeDescription(schematize(1))).to.equal('EqualsSchema');
    expect(typeDescription(schematize('something'))).to.equal('EqualsSchema');
    expect(typeDescription(schematize(true))).to.equal('EqualsSchema');
  });
});
