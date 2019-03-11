import {expect} from 'chai';
import {isuuid, Schema} from "../../src/vice";
const uuid = require("uuid");

describe('isuuid', () => {
  const s: Schema<any, string> = isuuid();
  const knownValid:string = "ea679ebd-955f-4032-909b-c4fc9d0f0080";
  const randomValid:string = uuid.v4();

  it('works for canonical uuids', () => {
    expect(s.conform(knownValid)).to.equal(knownValid);
    expect(s.conform(randomValid)).to.equal(randomValid);
  });
  it('normalises uppercase uuids', () => {
    expect(s.conform(knownValid.toUpperCase())).to.equal(knownValid);
    expect(s.conform(randomValid.toUpperCase())).to.equal(randomValid);
  });
  it('fails if value doesnt match pattern', () => {
    const tooShort = knownValid.slice(0,1);

    expect(s.conform(tooShort))
      .deep.equals({problems: [{message: `not a valid uuid: ${tooShort}`, path: []}]});
  });
});
