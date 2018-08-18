import "reflect-metadata";
import {expect} from 'chai';
import {fail} from "assert";

import {eq, schematize} from "../../src/schemas";
import {Schema} from "../../src/schema";
import {failure} from "../../src/problems";
import {ObjectSchema} from "../../src/impl/obj";
import {EqualsSchema} from "../../src/impl/eq";

describe('schematize', () => {
  it('Treats functions as predicates, with function body as failure message', () => {
    const isEven = schematize((x) => x % 2 === 0);
    expect(isEven.conform(1)).deep.equals(failure("(x) => x % 2 === 0"));
  });

  xit('Returns InstanceOfSchema for classes', () => {
    fail('Not implemented')
  });

  it('Passthrough on anything that is already a schema', () => {
    const s = eq(1) as any as Schema<number, number>;
    expect(schematize(s)).equals(s);
  });

  it('Turns plain objects into ObjectSchema', () => {
    const s = schematize({a: eq(1)});
    expect(s).instanceOf(ObjectSchema);
  });

  it('Turns primitives into EqualsSchema', () => {
    expect(schematize(1)).instanceOf(EqualsSchema);
    expect(schematize('something')).instanceOf(EqualsSchema);
    expect(schematize(true)).instanceOf(EqualsSchema);
  });
});
