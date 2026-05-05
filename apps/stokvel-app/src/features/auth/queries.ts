import { queryOptions } from '@tanstack/react-query';
import { api } from '../../lib/api.js';
import { importSessionKey } from '../../lib/crypto/aes-gcm.js';
import { keyStore } from '../../lib/crypto/key-store.js';

export const meQueryOptions = queryOptions({
  queryKey: ['me'],
  queryFn: async () => {
    const data = await api.me();
    // Restore the in-memory AES key from the session-resume path
    if (!keyStore.hasKey()) {
      const key = await importSessionKey(data.sessionKey);
      keyStore.setKey(key);
    }
    return data;
  },
  // Never persist auth state — tier 3
  gcTime: 0,
  staleTime: 0,
  retry: false,
});
