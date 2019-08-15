import {expect} from 'chai';
import {failure, range} from "../../src/vice";

describe('gte()', () => {
  const s = range(1, 10, {lowerInclusive: true});

  it('on boundary', async () => {
    expect(s.conform(1))
      .deep.equals(1);
  });
  it('over boundary', async () => {
    expect(s.conform(0.9))
      .deep.equals(failure('must be greater than or equal to 1'));
  });

  it('json schema', async () => {
    expect(s.toJSON())
      .deep.eq({
      type: "number",
      exclusiveMaximum: 10,
      minimum: 1,
    })
  });
});

describe('gt()', () => {
  const s = range(1, 10, {lowerInclusive: false});

  it('on boundary', async () => {
    expect(s.conform(1))
      .deep.equals(failure('must be greater than 1'));
  });

  it('over boundary', async () => {
    expect(s.conform(1.1))
      .deep.equals(1.1);
  });

  it('json schema', async () => {
    expect(s.toJSON())
      .deep.eq({
      type: "number",
      exclusiveMaximum: 10,
      exclusiveMinimum: 1,
    })
  });
});

describe('lte()', () => {
  const s = range(1, 10, {upperInclusive: true});

  it('on boundary', async () => {
    expect(s.conform(10))
      .deep.equals(10);
  });

  it('over boundary', async () => {
    expect(s.conform(10.1))
      .deep.equals(failure('must be less than or equal to 10'));
  });

  it('json schema', async () => {
    expect(s.toJSON())
      .deep.eq({
      type: "number",
      maximum: 10,
      minimum: 1,
    })
  });
});

describe('lt()', () => {
  const s = range(1, 10, {upperInclusive: false});

  it('on boundary', async () => {
    expect(s.conform(10))
      .deep.equals(failure('must be less than 10'));
  });

  it('over boundary', async () => {
    expect(s.conform(9.9))
      .deep.equals(9.9);
  });

  it('json schema', async () => {
    expect(s.toJSON())
      .deep.eq({
      type: "number",
      exclusiveMaximum: 10,
      minimum: 1,
    })
  });
});