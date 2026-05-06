import { AlertOctagon, ShieldOff } from 'lucide-react';
import { Button } from '../../components/button.js';

type GateVariant = 'forced' | 'maxStaleness';

interface ForcedUpdateGateProps {
  variant?: GateVariant;
  onAction?: () => void;
}

/**
 * Full-screen non-dismissable gate. Two variants:
 *
 * - `forced` — server returned `updateLevel: 'forced'`. User must update.
 * - `maxStaleness` — version-check hasn't succeeded within `MAX_STALENESS_MS`.
 *   Closes the network-block attack where an adversary keeps an old client
 *   running by black-holing only `/api/app/version-check`.
 */
export function ForcedUpdateGate({ variant = 'forced', onAction }: ForcedUpdateGateProps) {
  const config =
    variant === 'forced'
      ? {
          Icon: AlertOctagon,
          title: 'Update required',
          body: 'A critical update is available. You need to update Seyva to keep using it.',
          action: 'Update now',
        }
      : {
          Icon: ShieldOff,
          title: "Couldn't verify app version",
          body: "We can't confirm this is the latest version of Seyva. Connect to a network and try again to keep your account safe.",
          action: 'Try again',
        };
  const { Icon, title, body, action } = config;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-background p-8 text-center lg:rounded-2xl">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <Icon className="size-7" aria-hidden="true" />
      </div>
      <div className="max-w-sm space-y-1.5">
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">{body}</p>
      </div>
      <Button onClick={onAction}>{action}</Button>
    </div>
  );
}
