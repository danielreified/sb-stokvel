import { describe, expect, it } from 'bun:test';
import { formatMoney, formatMoneyCompact } from '../money.js';

// Intl.NumberFormat for en-ZA uses U+00A0 (non-breaking space) in places that
// look like a regular space — assertions normalise to a regular space so the
// tests are readable.
const norm = (s: string): string => s.replace(/\u00A0/g, ' ');

describe('formatMoney', () => {
  it('formats whole rands from cents with two decimals', () => {
    expect(norm(formatMoney(125000))).toBe('R 1 250,00');
  });

  it('formats a small amount', () => {
    expect(norm(formatMoney(50))).toBe('R 0,50');
  });

  it('formats zero', () => {
    expect(norm(formatMoney(0))).toBe('R 0,00');
  });

  it('formats large amounts with the SA thousand separator', () => {
    expect(norm(formatMoney(123456789))).toBe('R 1 234 567,89');
  });
});

describe('formatMoneyCompact', () => {
  it('drops the cents for tight UI', () => {
    expect(norm(formatMoneyCompact(125000))).toBe('R 1 250');
  });

  it('rounds rather than truncating', () => {
    expect(norm(formatMoneyCompact(125099))).toBe('R 1 251');
    expect(norm(formatMoneyCompact(125049))).toBe('R 1 250');
  });

  it('formats zero as R 0', () => {
    expect(norm(formatMoneyCompact(0))).toBe('R 0');
  });
});
