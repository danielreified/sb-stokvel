import { zodResolver } from '@hookform/resolvers/zod';
import { ApiClientError } from '@seyva/api-client';
import type { LoginInput } from '@seyva/validation';
import { LoginSchema } from '@seyva/validation';
import { useForm } from 'react-hook-form';
import { router } from '../../App.js';
import { getCopy } from '../../copy/index.js';
import { api } from '../../lib/api.js';
import { importSessionKey } from '../../lib/crypto/aes-gcm.js';
import { keyStore } from '../../lib/crypto/key-store.js';
import { decodeSessionKey, wrapSessionKey } from '../../lib/crypto/pin-wrap.js';
import { wrappedKeyStore } from '../../lib/crypto/wrapped-key-store.js';
import { logger } from '../../lib/logger.js';
import { queryClient } from '../../lib/query-client.js';
import { meQueryOptions } from './queries.js';

export function useLogin(redirectTo?: string) {
  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { phone: '+27', pin: '' },
  });

  async function onSubmit(values: LoginInput) {
    try {
      const data = await api.auth.login(values);
      const key = await importSessionKey(data.sessionKey);
      keyStore.setKey(key);

      // Wrap the raw session-key bytes with the user's PIN and persist the
      // blob to IDB. Used by the idle-lock flow to verify + restore the key
      // offline (no BFF roundtrip required).
      const blob = await wrapSessionKey(values.pin, decodeSessionKey(data.sessionKey));
      await wrappedKeyStore.save(blob);

      // Seed the me cache immediately so _authed beforeLoad finds it synchronously
      queryClient.setQueryData(meQueryOptions.queryKey, data);
      await router.navigate({ to: redirectTo ?? '/dashboard', replace: true });
    } catch (err) {
      const copy = getCopy();
      let message: string = copy.auth.unknownError;
      if (err instanceof ApiClientError) {
        if (err.status === 401) message = copy.auth.invalidCredentials;
        else if (err.status === 429) message = copy.auth.rateLimited;
      }
      form.setError('root', { message });
      logger.warn('login_failed', {
        status: err instanceof ApiClientError ? err.status : 'unknown',
      });
    }
  }

  return { form, onSubmit: form.handleSubmit(onSubmit) };
}
