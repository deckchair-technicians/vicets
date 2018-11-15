import {expect} from 'chai';
import {Schema} from "../..";
import {failure, ValidationResult} from "../../src/problems";
import {BaseSchema} from "../../src/impl";
import {isoDate, validate} from "../../index";


describe('isoDate', () => {
  const s: Schema<any, Date> = isoDate();
  const now = new Date();

  it('if value is already a date, it is passed through', () => {
    expect(validate(s, now)).eq(now);
  });
  it('works for iso strings', () => {
    expect(validate(s, "2018-10-31").getTime()).eq(new Date(Date.UTC(2018,9,31)).getTime());
  });
  it('leap years are accepted', () => {
    expect(validate(s, "2020-02-29").getTime()).eq(new Date(Date.UTC(2020,1,29)).getTime());
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
});