import { useEffect, useSyncExternalStore } from 'react';
import { MAX_STALENESS_MS } from '../config/version-guard.js';
import { copy } from '../copy/index.js';
import { forceUpdate } from '../lib/sw-update/force-update.js';
import { startVersionPolling, stopVersionPolling } from '../lib/version-guard/poll.js';
import { versionGuardStore } from '../lib/version-guard/store.js';

interface ForcedUpdateGateProps {
  children: React.ReactNode;
}

/**
 * Wraps the authenticated tree. Gates rendering on:
 * 1. updateLevel !== 'forced'
 * 2. lastSuccessfulCheckAt within MAX_STALENESS_MS (the anti-network-block guardrail)
 */
export function ForcedUpdateGate({ children }: ForcedUpdateGateProps) {
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
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-xl font-semibold text-gray-900">{copy.pwa.staleVersionTitle}</p>
        <p className="text-gray-500">{copy.pwa.staleVersionBody}</p>
        <button
          type="button"
          className="rounded-xl bg-brand px-8 py-3 font-medium text-white"
          onClick={() => startVersionPolling()}
        >
          {copy.pwa.retryButton}
        </button>
      </div>
    );
  }

  if (state.updateLevel === 'forced') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-xl font-semibold text-gray-900">{copy.pwa.forcedUpdateTitle}</p>
        <p className="text-gray-500">{copy.pwa.forcedUpdateBody}</p>
        <button
          type="button"
          className="rounded-xl bg-brand px-8 py-3 font-medium text-white"
          onClick={() => void forceUpdate()}
        >
          {copy.pwa.forcedUpdateButton}
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
