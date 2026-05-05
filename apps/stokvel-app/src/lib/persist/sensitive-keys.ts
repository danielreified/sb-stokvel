/**
 * Query keys whose cached data is encrypted at rest in IndexedDB.
 * Tier 2 per CLAUDE.md: balance, contribution history, amounts, statuses.
 * A key matches if the first element of the query key array is in this set.
 */
export const SENSITIVE_QUERY_KEYS = new Set(['balance', 'contributions']);
