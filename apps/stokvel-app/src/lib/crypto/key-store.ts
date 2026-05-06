/**
 * Module-scoped in-memory AES session key. Never written to disk or IDB
 * (the wrapped variant in wrapped-key-store.ts is what persists).
 *
 * Subscribable: components observe `hasKey` via `useSyncExternalStore` so
 * they re-render when the key is set (after login or PIN unlock) or
 * cleared (idle-lock or sign-out).
 */

let sessionKey: CryptoKey | undefined;
const listeners = new Set<() => void>();

const notify = (): void => {
  for (const cb of listeners) cb();
};

export const keyStore = {
  setKey: (key: CryptoKey): void => {
    sessionKey = key;
    notify();
  },
  getKey: (): CryptoKey | undefined => sessionKey,
  clearKey: (): void => {
    sessionKey = undefined;
    notify();
  },
  hasKey: (): boolean => sessionKey !== undefined,
  subscribe: (cb: () => void): (() => void) => {
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  },
};
