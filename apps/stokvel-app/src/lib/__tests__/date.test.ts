import { describe, expect, it } from 'bun:test';
import { getCurrentMonth, previousMonth } from '../date.js';

describe('getCurrentMonth', () => {
  it('returns YYYY-MM matching the current UTC date', () => {
    const result = getCurrentMonth();
    expect(result).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
    const now = new Date();
    const expectedYear = String(now.getUTCFullYear());
    const expectedMonth = String(now.getUTCMonth() + 1).padStart(2, '0');
    expect(result).toBe(`${expectedYear}-${expectedMonth}`);
  });
});

describe('previousMonth', () => {
  it('decrements within the same year', () => {
    expect(previousMonth('2026-05')).toBe('2026-04');
    expect(previousMonth('2026-12')).toBe('2026-11');
  });

  it('rolls back across the year boundary', () => {
    expect(previousMonth('2026-01')).toBe('2025-12');
  });

  it('keeps the two-digit month padding', () => {
    expect(previousMonth('2026-10')).toBe('2026-09');
    expect(previousMonth('2026-02')).toBe('2026-01');
  });
});
