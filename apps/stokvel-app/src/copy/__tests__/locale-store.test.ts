import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { localeStore } from '../locale-store.js';

// Bun's runtime exposes globalThis.localStorage in workers but not in the
// default test environment. Stub it for the duration of these tests.
class MemoryStorage {
  private store = new Map<string, string>();
  getItem(k: string) {
    return this.store.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.store.set(k, v);
  }
  removeItem(k: string) {
    this.store.delete(k);
  }
  clear() {
    this.store.clear();
  }
}

describe('localeStore', () => {
  let originalWindow: typeof globalThis.window | undefined;

  beforeEach(() => {
    originalWindow = globalThis.window;
    // The store reads `window.localStorage` lazily inside its setLocale, so
    // injecting a fake window is enough.
    (globalThis as { window?: unknown }).window = { localStorage: new MemoryStorage() };
    // Reset the store to default English between tests.
    localeStore.setLocale('en');
  });

  afterEach(() => {
    if (originalWindow === undefined) {
      delete (globalThis as { window?: unknown }).window;
    } else {
      globalThis.window = originalWindow;
    }
  });

  describe('getLocale + setLocale', () => {
    it('defaults to English', () => {
      expect(localeStore.getLocale()).toBe('en');
    });

    it('switches to isiZulu', () => {
      localeStore.setLocale('zu');
      expect(localeStore.getLocale()).toBe('zu');
    });

    it('switches to Afrikaans', () => {
      localeStore.setLocale('af');
      expect(localeStore.getLocale()).toBe('af');
    });
  });

  describe('getCopy', () => {
    it('returns the EN copy tree by default', () => {
      expect(localeStore.getCopy().nav.dashboard).toBe('Dashboard');
    });

    it('returns the ZU copy tree after switching', () => {
      localeStore.setLocale('zu');
      expect(localeStore.getCopy().nav.dashboard).toBe('Ikhasi elikhulu');
    });

    it('returns the AF copy tree after switching', () => {
      localeStore.setLocale('af');
      expect(localeStore.getCopy().nav.dashboard).toBe('Paneelbord');
    });
  });

  describe('subscribe', () => {
    it('notifies listeners on locale change', () => {
      let calls = 0;
      const unsub = localeStore.subscribe(() => {
        calls += 1;
      });

      localeStore.setLocale('zu');
      localeStore.setLocale('af');
      expect(calls).toBe(2);

      unsub();
      localeStore.setLocale('en');
      expect(calls).toBe(2); // unsubscribed
    });

    it('does NOT notify when setting the same locale', () => {
      let calls = 0;
      localeStore.subscribe(() => {
        calls += 1;
      });
      localeStore.setLocale('en'); // already en
      expect(calls).toBe(0);
    });
  });
});
