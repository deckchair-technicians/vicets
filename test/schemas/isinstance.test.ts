import {expect} from 'chai';
import {failure, isinstance} from "../../src/vice";

describe('isinstance', () => {
  class A {
    constructor(public field: string) {
    }
  }

  class B {
    constructor(public field: string) {
    }
  }

  const s = isinstance(A);

  it('works', () => {
    const instance = new A('test');
    const differentType = new B('test');
    const notInstance = Object.assign({}, instance);
    const fakeInstance = Object.create(A.prototype);


    expect(s.conform(instance)).to.equal(instance);
    expect(s.conform(fakeInstance)).to.equal(fakeInstance);
    expect(s.conform(notInstance))
      .deep.equals(failure("expected A but got object"));
    expect(s.conform(differentType))
      .deep.equals(failure("expected A but got B"));
  });

  it('json schema', async () => {
    expect(s.toJSON()).deep.eq({
      description: "Instance of A",
      type: "object",
      additionalProperties: true,
    });
  });

});
