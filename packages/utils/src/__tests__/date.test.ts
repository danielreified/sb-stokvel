import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import { formatDate, formatMonth, formatRelativeTime } from '../date.js';

// Pin the wall clock so relative-time assertions are deterministic.
const FIXED_NOW = new Date('2026-05-07T12:00:00.000Z').getTime();

describe('formatRelativeTime', () => {
  beforeEach(() => {
    mock.module('../date.js', () => import('../date.js'));
    spyOnDateNow(FIXED_NOW);
  });
  afterEach(() => {
    restoreDateNow();
  });

  it('returns "just now" for a timestamp within the last minute', () => {
    const ts = new Date(FIXED_NOW - 30_000).toISOString();
    expect(formatRelativeTime(ts)).toBe('just now');
  });

  it('clamps future timestamps to "just now" (cheap-Android clock skew)', () => {
    const ts = new Date(FIXED_NOW + 3 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(ts)).toBe('just now');
  });

  it('formats minutes ago', () => {
    const ts = new Date(FIXED_NOW - 5 * 60_000).toISOString();
    expect(formatRelativeTime(ts)).toMatch(/5 minutes ago/);
  });

  it('formats hours ago', () => {
    const ts = new Date(FIXED_NOW - 3 * 60 * 60_000).toISOString();
    expect(formatRelativeTime(ts)).toMatch(/3 hours ago/);
  });

  it('formats days ago', () => {
    const ts = new Date(FIXED_NOW - 4 * 24 * 60 * 60_000).toISOString();
    expect(formatRelativeTime(ts)).toMatch(/4 days ago/);
  });

  it('falls back to absolute date for timestamps older than a year', () => {
    const ts = new Date(FIXED_NOW - 400 * 24 * 60 * 60_000).toISOString();
    // Doesn't match "X ago" any more — formatted as a long-form date
    expect(formatRelativeTime(ts)).not.toMatch(/ago/);
    expect(formatRelativeTime(ts)).toMatch(/202\d/);
  });
});

describe('formatDate', () => {
  it('renders an ISO timestamp as a long SA date', () => {
    const out = formatDate('2026-05-07T00:00:00.000Z');
    // The exact string depends on host TZ. Just verify it has the year and month.
    expect(out).toMatch(/2026/);
    expect(out).toMatch(/May|7/);
  });
});

describe('formatMonth', () => {
  it('formats YYYY-MM as a long-form month/year', () => {
    expect(formatMonth('2026-05')).toBe('May 2026');
  });

  it('handles December correctly', () => {
    expect(formatMonth('2025-12')).toBe('December 2025');
  });

  it('handles January correctly', () => {
    expect(formatMonth('2026-01')).toBe('January 2026');
  });
});

// Tiny Date.now spy helper — used by formatRelativeTime tests.
let originalNow: () => number;
function spyOnDateNow(value: number): void {
  originalNow = Date.now;
  Date.now = () => value;
}
function restoreDateNow(): void {
  if (originalNow) Date.now = originalNow;
}
