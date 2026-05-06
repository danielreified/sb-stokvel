import { describe, expect, it } from 'bun:test';
import { formatPhone, normalisePhone } from '../phone.js';

describe('formatPhone', () => {
  it('formats a valid +27 number into local SA reading groups', () => {
    expect(formatPhone('+27821000001')).toBe('082 100 0001');
  });

  it('returns input unchanged for non-+27 prefix', () => {
    expect(formatPhone('+1234567890')).toBe('+1234567890');
  });

  it('returns input unchanged for wrong length', () => {
    expect(formatPhone('+278210')).toBe('+278210');
    expect(formatPhone('+2782100000123')).toBe('+2782100000123');
  });

  it('returns empty input unchanged', () => {
    expect(formatPhone('')).toBe('');
  });
});

describe('normalisePhone', () => {
  it('passes through E.164 +27 numbers unchanged', () => {
    expect(normalisePhone('+27821000001')).toBe('+27821000001');
  });

  it('promotes a leading-zero 10-digit local number to +27', () => {
    expect(normalisePhone('0821000001')).toBe('+27821000001');
  });

  it('adds + to a 27-prefixed 11-digit number', () => {
    expect(normalisePhone('27821000001')).toBe('+27821000001');
  });

  it('strips non-digits from formatted input before normalising', () => {
    expect(normalisePhone('082 100 0001')).toBe('+27821000001');
    expect(normalisePhone('(082) 100-0001')).toBe('+27821000001');
  });

  it('returns the raw input when format is not recognisable', () => {
    expect(normalisePhone('not-a-number')).toBe('not-a-number');
    expect(normalisePhone('1234')).toBe('1234');
  });
});
