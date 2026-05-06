import { Button, InputOTP, InputOTPGroup, InputOTPSlot, Logo } from '@seyva/ui';
import { Lock } from 'lucide-react';
import { useState } from 'react';
import { useCopy } from '../copy/index.js';

interface PinLockScreenProps {
  /** Display name shown above the PIN input — usually the signed-in user. */
  name: string;
  /** Render an inline error after a failed verify. */
  error?: string;
  /** Returns true if the PIN was correct (caller decides what success means). */
  onVerify: (pin: string) => Promise<boolean>;
  /** Falls back to full sign-out when the user can't remember their PIN. */
  onSignOut: () => void;
}

/**
 * Idle-lock overlay. Sits absolutely positioned over the AppWindow when the
 * inactivity threshold is exceeded — the underlying app stays mounted but
 * blurred behind the glass scrim. Session is still valid server-side; this
 * is a soft re-auth checkpoint. Sign-out is the harder fallback.
 */
export function PinLockScreen({ name, error, onVerify, onSignOut }: PinLockScreenProps) {
  const copy = useCopy();
  const [pin, setPin] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | undefined>(error);

  const handleChange = async (next: string) => {
    setPin(next);
    if (next.length !== 4) {
      setVerifyError(undefined);
      return;
    }
    setVerifying(true);
    const ok = await onVerify(next);
    setVerifying(false);
    if (!ok) {
      setVerifyError(copy.auth.invalidCredentials);
      setPin('');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pin-lock-title"
      className="absolute inset-0 z-50 flex items-center justify-center bg-background/40 p-6 backdrop-blur-md"
    >
      <div className="flex w-full max-w-sm flex-col items-center gap-6 rounded-2xl border bg-background/90 p-8 text-center shadow-2xl backdrop-blur-xl">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-md">
          <Logo variant="mark" tone="light" className="h-10 w-10" />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            <Lock className="size-3.5" aria-hidden="true" />
            {copy.pinLock.statusLabel}
          </div>
          <h1 id="pin-lock-title" className="text-2xl font-semibold">
            {copy.pinLock.welcome.replace('{name}', name)}
          </h1>
          <p className="text-sm text-muted-foreground">{copy.pinLock.prompt}</p>
        </div>

        <InputOTP
          autoFocus
          maxLength={4}
          value={pin}
          onChange={handleChange}
          disabled={verifying}
          aria-label={copy.auth.pinLabel}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
          </InputOTPGroup>
        </InputOTP>

        {verifyError && (
          <p role="alert" aria-live="assertive" className="text-sm text-destructive">
            {verifyError}
          </p>
        )}

        <Button
          variant="link"
          size="sm"
          onClick={onSignOut}
          className="text-muted-foreground hover:text-foreground"
        >
          {copy.pinLock.signOutInstead}
        </Button>
      </div>
    </div>
  );
}
