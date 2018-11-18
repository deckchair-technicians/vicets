import {expect} from 'chai';
import {e164PhoneNumber, failure, Schema} from "../../src";

describe('e164PhoneNumber', () => {
  const uk: Schema<any, string> = e164PhoneNumber('GBR');

  it('works for E.164 numbers', () => {
    expect(uk.conform("+447777777777")).to.equal("+447777777777");
  });
  it('works for phone numbers with no country code', () => {
    expect(uk.conform("07777 777777")).to.equal("+447777777777");
  });
  it('works for phone numbers area code in brackets', () => {
    expect(uk.conform("(07777) 777777")).to.equal("+447777777777");
  });
  it('rejects non-phone-numbers', () => {
    expect(uk.conform("not a number")).deep.equals(failure("expected a valid E.164 phone number", []));
  });
});