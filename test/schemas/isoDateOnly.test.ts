import {expect} from 'chai';
import {utcDate} from "../../src/impl/util/dates";
import {failure, isoDateOnly, Schema, validate} from "../../src/vice";

describe('isoDateOnly', () => {
  const s: Schema<any, Date> = isoDateOnly();

  it('if value is already a date, it is passed through', () => {
    const date = utcDate(2010, 1, 1);
    expect(validate(s, date)).eq(date);
  });
  it('dates with a time component are rejected', () => {
    const date = utcDate(2010, 1, 1, 10, 11);
    expect(s.conform(date)).deep.eq(failure("date should not have a time of day component"));
    expect(s.conform("2018-10-20T11:00Z")).deep.eq(failure("date should not have a time of day component"));
    expect(s.conform("2018-10-20T11:00:12Z")).deep.eq(failure("date should not have a time of day component"));
  });
  it('works for iso strings', () => {
    const exampleDate = utcDate(2018, 9, 31);
    expect(validate(s, "2018-10-31").getTime()).eq(exampleDate.getTime());
    expect(validate(s, "2018-10-31T00:00Z").getTime()).eq(exampleDate.getTime());
    expect(validate(s, "2018-10-31T00:00:00Z").getTime()).eq(exampleDate.getTime());
    expect(validate(s, "2018-10-31T00:00:00.000Z").getTime()).eq(exampleDate.getTime());
    expect(validate(s, "2011-10-05T00:00:00.000Z").getTime()).eq(utcDate(2011, 9, 5).getTime());
  });
  it('leap years are accepted', () => {
    expect(validate(s, "2020-02-29").getTime()).eq(utcDate(2020, 1, 29).getTime());
  });
  it('complains about 31st feb', () => {
    expect(s.conform("2018-02-31")).deep.eq(failure("expected a valid date"));
    expect(s.conform("2018-02-31")).deep.eq(failure("expected a valid date"));
    expect(s.conform("2018-02-31")).deep.eq(failure("expected a valid date"));
  });
  it('complains about out of range months', () => {
    expect(s.conform("2018-55-31")).deep.eq(failure("expected a valid ISO8601 string"));
  });
  it('gives a useful error message for invalid dates', () => {
    expect(s.conform("not a date")).deep.eq(failure("expected a valid ISO8601 string"));
  });
  it('json schema', async () => {
    expect(s.toJSON()).deep.eq({
      type: "string",
      format: "date",
    });
  });

});
