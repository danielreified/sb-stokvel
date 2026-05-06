/** Returns the current month in YYYY-MM format (UTC), matching the API's month filter. */
export const getCurrentMonth = (): string => new Date().toISOString().slice(0, 7);

/** "2026-05" → "2026-04". "2026-01" → "2025-12". UTC, no DST concerns. */
export const previousMonth = (month: string): string => {
  const [yStr, mStr] = month.split('-');
  const y = Number(yStr);
  const m = Number(mStr);
  if (m === 1) return `${y - 1}-12`;
  return `${y}-${String(m - 1).padStart(2, '0')}`;
};
