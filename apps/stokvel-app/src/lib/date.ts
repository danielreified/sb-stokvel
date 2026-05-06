/** Returns the current month in YYYY-MM format (UTC), matching the API's month filter. */
export const getCurrentMonth = (): string => new Date().toISOString().slice(0, 7);
