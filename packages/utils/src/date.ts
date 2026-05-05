const ONE_MINUTE_MS = 60_000;
const ONE_HOUR_MS = 60 * ONE_MINUTE_MS;
const ONE_DAY_MS = 24 * ONE_HOUR_MS;
const ONE_YEAR_MS = 365 * ONE_DAY_MS;

const rtf = new Intl.RelativeTimeFormat('en-ZA', { numeric: 'auto' });

/**
 * Relative-time formatter with clock-skew clamp.
 * - Future timestamps are clamped to "just now" (cheap Androids have wrong system clocks).
 * - Timestamps older than ~1 year fall back to an absolute date string.
 */
export function formatRelativeTime(isoTimestamp: string): string {
  const ts = new Date(isoTimestamp).getTime();
  const now = Date.now();
  const diffMs = ts - now;

  // Clamp future timestamps — never show "in 3 hours" for a stale Android clock.
  if (diffMs > ONE_MINUTE_MS) return 'just now';

  const absMs = Math.abs(diffMs);

  if (absMs > ONE_YEAR_MS) {
    return new Intl.DateTimeFormat('en-ZA', { dateStyle: 'medium' }).format(new Date(ts));
  }

  if (absMs >= ONE_DAY_MS) return rtf.format(-Math.round(absMs / ONE_DAY_MS), 'day');
  if (absMs >= ONE_HOUR_MS) return rtf.format(-Math.round(absMs / ONE_HOUR_MS), 'hour');
  if (absMs >= ONE_MINUTE_MS) return rtf.format(-Math.round(absMs / ONE_MINUTE_MS), 'minute');
  return 'just now';
}

/** Format an ISO timestamp as a readable SA date, e.g. "5 May 2026". */
export function formatDate(isoTimestamp: string): string {
  return new Intl.DateTimeFormat('en-ZA', { dateStyle: 'long' }).format(new Date(isoTimestamp));
}

/** Format a YYYY-MM month string as a readable label, e.g. "2026-05" → "May 2026". */
export function formatMonth(month: string): string {
  const [year, mon] = month.split('-');
  return new Intl.DateTimeFormat('en-ZA', { month: 'long', year: 'numeric' }).format(
    new Date(Number(year), Number(mon) - 1, 1),
  );
}
