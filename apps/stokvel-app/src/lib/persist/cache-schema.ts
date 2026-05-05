/**
 * Bump only when the shape of persisted data changes (renamed field, restructured response).
 * Do NOT tie this to the app version — that would nuke every user's offline cache on every release.
 */
export const CACHE_SCHEMA_VERSION = 1;

export const PERSIST_KEY = `seyva-query-cache-v${CACHE_SCHEMA_VERSION}`;
