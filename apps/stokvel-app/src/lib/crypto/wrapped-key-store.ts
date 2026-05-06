import { del, get, set } from 'idb-keyval';
import type { WrappedKeyBlob } from './pin-wrap.js';

const STORE_KEY = 'seyva-wrapped-session-key';

/**
 * IndexedDB-backed persistence for the PIN-wrapped session key.
 * Survives refresh / cold start. Cleared on sign-out (the full
 * `indexedDB.deleteDatabase('keyval-store')` step in signOut wipes this
 * along with everything else).
 */
export const wrappedKeyStore = {
  save: (value: WrappedKeyBlob): Promise<void> => set(STORE_KEY, value),
  load: async (): Promise<WrappedKeyBlob | null> => (await get<WrappedKeyBlob>(STORE_KEY)) ?? null,
  clear: (): Promise<void> => del(STORE_KEY),
};
