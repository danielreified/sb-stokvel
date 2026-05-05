import { zodResolver } from '@hookform/resolvers/zod';
import { ApiClientError } from '@seyva/api-client';
import type { LoginInput } from '@seyva/validation';
import { LoginSchema } from '@seyva/validation';
import { useForm } from 'react-hook-form';
import { router } from '../../App.js';
import { copy } from '../../copy/index.js';
import { api } from '../../lib/api.js';
import { importSessionKey } from '../../lib/crypto/aes-gcm.js';
import { keyStore } from '../../lib/crypto/key-store.js';
import { logger } from '../../lib/logger.js';
import { queryClient } from '../../lib/query-client.js';

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
      // Invalidate router so _authed beforeLoad re-checks auth context
      await queryClient.invalidateQueries({ queryKey: ['me'] });
      await router.invalidate();
      window.location.href = redirectTo ?? '/_authed/dashboard';
    } catch (err) {
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
