import { Button } from '@seyva/ui';
import { AlertOctagon, ShieldOff } from 'lucide-react';
import { useEffect, useSyncExternalStore } from 'react';
import { MAX_STALENESS_MS } from '../config/version-guard.js';
import { useCopy } from '../copy/index.js';
import { forceUpdate } from '../lib/sw-update/force-update.js';
import { startVersionPolling, stopVersionPolling } from '../lib/version-guard/poll.js';
import { versionGuardStore } from '../lib/version-guard/store.js';

interface ForcedUpdateGateProps {
  children: React.ReactNode;
}

interface GateScreenProps {
  icon: typeof AlertOctagon;
  title: string;
  body: string;
  action: string;
  onAction: () => void;
}

function GateScreen({ icon: Icon, title, body, action, onAction }: GateScreenProps) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-background p-8 text-center">
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

/**
 * Wraps the authenticated tree. Gates rendering on:
 * 1. updateLevel !== 'forced'
 * 2. lastSuccessfulCheckAt within MAX_STALENESS_MS (the anti-network-block guardrail)
 */
export function ForcedUpdateGate({ children }: ForcedUpdateGateProps) {
  const copy = useCopy();
  const state = useSyncExternalStore(versionGuardStore.subscribe, versionGuardStore.getState);

  useEffect(() => {
    startVersionPolling();
    return stopVersionPolling;
  }, []);

  const isStale =
    state.lastSuccessfulCheckAt !== null &&
    Date.now() - state.lastSuccessfulCheckAt > MAX_STALENESS_MS;

  if (isStale) {
    return (
      <GateScreen
        icon={ShieldOff}
        title={copy.pwa.staleVersionTitle}
        body={copy.pwa.staleVersionBody}
        action={copy.pwa.retryButton}
        onAction={() => startVersionPolling()}
      />
    );
  }

  if (state.updateLevel === 'forced') {
    return (
      <GateScreen
        icon={AlertOctagon}
        title={copy.pwa.forcedUpdateTitle}
        body={copy.pwa.forcedUpdateBody}
        action={copy.pwa.forcedUpdateButton}
        onAction={() => void forceUpdate()}
      />
    );
  }

  return <>{children}</>;
}
