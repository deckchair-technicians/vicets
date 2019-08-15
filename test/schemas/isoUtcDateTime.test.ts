import {expect} from 'chai';
import {Schema, failure, isoUtcDateTime, validate} from "../../src/vice";
import {utcDate} from "../../src/impl/util/dates";


describe('isoUtcDateTime', () => {
  const s: Schema<any, Date> = isoUtcDateTime();
  const now = new Date();

  it('if value is already a date, it is passed through', () => {
    expect(s.conform(now)).eq(now);
  });
  it('works for iso strings', () => {
    const date: Date = s.conform(now.toISOString()) as Date;
    expect(date.getTime()).eq(now.getTime());
  });
  it('works for iso strings without millis', () => {
    const noMillis = now.toISOString().substr(0, 19) + "Z";
    expect(validate(s, noMillis).getTime()).eq(now.getTime() - now.getMilliseconds());
  });
  it('works for iso strings without millis or seconds', () => {
    const noMillisOrSeconds = now.toISOString().substr(0, 16) + "Z";
    const expected = now.getTime() - now.getMilliseconds() - (now.getSeconds() * 1000);

    expect(validate(s, noMillisOrSeconds).getTime()).eq(expected);
  });
  it('leap years are accepted', () => {
    expect(validate(s, "2020-02-29T00:00Z").getTime()).eq(utcDate(2020, 1, 29).getTime());
  });
  it('can specify timezone as zero offset', () => {
    expect(validate(s, "2020-02-29T00:00+00:00").getTime()).eq(utcDate(2020, 1, 29).getTime());
  });
  it('requires time component', () => {
    expect(s.conform("2020-02-29")).deep.eq(failure("date should have a time of day component"));
  });
  it('can NOT specify timezone as non-zero offset', () => {
    expect(s.conform("2020-02-29T00:00+10:00")).deep.eq(failure("expected a UTC date, with timezone specified as Z or 00:00"));
  });
  it('complains about 31st feb', () => {
    expect(s.conform("2018-02-31T10:00Z")).deep.eq(failure("expected a valid date"));
    expect(s.conform("2018-02-31T10:00:00Z")).deep.eq(failure("expected a valid date"));
    expect(s.conform("2018-02-31T10:00:00.100Z")).deep.eq(failure("expected a valid date"));
  });
  it('complains about out of range months', () => {
    expect(s.conform("2018-55-31T10:00:00.100")).deep.eq(failure("expected a valid ISO8601 string"));
  });
  it('gives a useful error message for invalid dates', () => {
    expect(s.conform("not a date")).deep.eq(failure("expected a valid ISO8601 string"));
  });
  it('json schema', async () => {
    expect(s.toJSON()).deep.eq({
      type: "string",
      format: "date-time",
    });
  });

});
