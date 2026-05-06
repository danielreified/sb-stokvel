import { Lock } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../components/button.js';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../../components/input-otp.js';
import { Logo } from '../../components/logo.js';

interface PinLockScreenProps {
  /** Display name shown above the PIN input — usually the signed-in user. */
  name?: string;
  /** Render an inline error (e.g. "Incorrect PIN — 2 attempts remaining"). */
  error?: string;
  onSubmit?: (pin: string) => void;
  onSignOut?: () => void;
}

/**
 * Idle-lock screen. Session is still valid but the app has been inactive
 * long enough to warrant a soft re-auth — banking-grade UX. Sign-out (which
 * clears the AES key + cache) is the harder fallback below the input.
 */
export function PinLockScreen({ name = 'there', error, onSubmit, onSignOut }: PinLockScreenProps) {
  const [pin, setPin] = useState('');

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 bg-background p-8 text-center lg:rounded-2xl">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-md">
        <Logo variant="mark" tone="light" className="h-10 w-10" />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          <Lock className="size-3.5" aria-hidden="true" />
          App locked
        </div>
        <h1 className="text-2xl font-semibold">Welcome back, {name}</h1>
        <p className="text-sm text-muted-foreground">Enter your PIN to continue</p>
      </div>

      <InputOTP
        maxLength={4}
        value={pin}
        onChange={(v) => {
          setPin(v);
          if (v.length === 4) onSubmit?.(v);
        }}
        aria-label="PIN"
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
      </InputOTP>

      {error && (
        <p role="alert" aria-live="assertive" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <Button
        variant="link"
        size="sm"
        onClick={onSignOut}
        className="text-muted-foreground hover:text-foreground"
      >
        Sign out instead
      </Button>
    </div>
  );
}
