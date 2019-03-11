import {expect} from 'chai';
import {e164PhoneNumber, failure, Schema} from "../../src/vice";

describe('e164PhoneNumber', () => {
  describe('with a country as argument', () => {
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

  describe('without argument', () => {
    const anyCountry: Schema<any, string> = e164PhoneNumber();

    it('works for E.164 numbers', () => {
      expect(anyCountry.conform("+447777777777")).to.equal("+447777777777");
    });
    it('works for E.164 numbers from another country', () => {
      expect(anyCountry.conform("+33677777777")).to.equal("+33677777777");
    });
    it('does not work for phone numbers with no country code', () => {
      expect(anyCountry.conform("07777 777777")).deep.equals(failure("expected a valid E.164 phone number", []));
    });
    it('rejects non-phone-numbers', () => {
      expect(anyCountry.conform("not a number")).deep.equals(failure("expected a valid E.164 phone number", []));
    });
  });
});
