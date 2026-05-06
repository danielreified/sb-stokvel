import { useState, useSyncExternalStore } from 'react';
import { useCopy } from '../copy/index.js';
import { versionGuardStore } from '../lib/version-guard/store.js';

/** Persistent dismissable banner shown when updateLevel === 'recommended'. */
export function RecommendedUpdateBanner() {
  const copy = useCopy();
  const [dismissed, setDismissed] = useState(false);
  const state = useSyncExternalStore(versionGuardStore.subscribe, versionGuardStore.getState);

  if (state.updateLevel !== 'recommended' || dismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-between gap-3 bg-brand-light px-4 py-2 text-sm text-white"
    >
      <span>{copy.pwa.recommendedUpdateBody}</span>
      <button
        type="button"
        className="shrink-0 underline hover:no-underline"
        onClick={() => setDismissed(true)}
      >
        {copy.pwa.updateLater}
      </button>
    </div>
  );
}
