import { copy } from '../../copy/index.js';
import { useLogin } from './use-login.js';

interface LoginFormProps {
  redirectTo?: string;
  reason?: 'expired';
}

export function LoginForm({ redirectTo, reason }: LoginFormProps) {
  const { form, onSubmit } = useLogin(redirectTo);
  const {
    register,
    formState: { errors, isSubmitting },
  } = form;

  return (
    <form onSubmit={onSubmit} noValidate className="w-full space-y-4">
      {reason === 'expired' && (
        <p role="alert" className="rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800">
          {copy.auth.sessionExpired}
        </p>
      )}

      {errors.root && (
        <p
          role="alert"
          aria-live="assertive"
          className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700"
        >
          {errors.root.message}
        </p>
      )}

      <div className="space-y-1.5">
        <label htmlFor="phone" className="block text-sm font-medium">
          {copy.auth.phoneLabel}
        </label>
        <input
          id="phone"
          type="tel"
          autoComplete="tel"
          placeholder={copy.auth.phonePlaceholder}
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? 'phone-error' : undefined}
          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
          {...register('phone')}
        />
        {errors.phone && (
          <p id="phone-error" role="alert" className="text-xs text-destructive">
            {errors.phone.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="pin" className="block text-sm font-medium">
          {copy.auth.pinLabel}
        </label>
        <input
          id="pin"
          type="password"
          inputMode="numeric"
          autoComplete="current-password"
          maxLength={4}
          placeholder={copy.auth.pinPlaceholder}
          aria-invalid={!!errors.pin}
          aria-describedby={errors.pin ? 'pin-error' : undefined}
          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
          {...register('pin')}
        />
        {errors.pin && (
          <p id="pin-error" role="alert" className="text-xs text-destructive">
            {errors.pin.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-60"
      >
        {isSubmitting ? copy.auth.loggingIn : copy.auth.loginButton}
      </button>
    </form>
  );
}
