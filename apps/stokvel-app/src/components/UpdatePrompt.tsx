import { useRegisterSW } from 'virtual:pwa-register/react';
import { useEffect, useState } from 'react';
import { useCopy } from '../copy/index.js';

const SW_UPDATE_INTERVAL_MS = 60 * 60 * 1000;

/**
 * Dismissable update toast. Mounted in __root.tsx so it's always present.
 * Uses hourly polling instead of SW event-only to catch updates when the tab is dormant.
 */
export function UpdatePrompt() {
  const copy = useCopy();
  const [showPrompt, setShowPrompt] = useState(false);

  const { updateServiceWorker } = useRegisterSW({
    onNeedRefresh: () => setShowPrompt(true),
    onOfflineReady: () => {},
  });

  useEffect(() => {
    const id = setInterval(() => {
      navigator.serviceWorker?.getRegistration().then((reg) => reg?.update());
    }, SW_UPDATE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  if (!showPrompt) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-between gap-3 rounded-xl bg-gray-900 px-4 py-3 text-sm text-white shadow-lg md:left-auto md:right-4 md:max-w-sm"
    >
      <span>{copy.pwa.updateAvailable}</span>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          className="rounded-lg px-3 py-1 text-gray-300 hover:text-white"
          onClick={() => setShowPrompt(false)}
        >
          {copy.pwa.updateLater}
        </button>
        <button
          type="button"
          className="rounded-lg bg-brand px-3 py-1 font-medium hover:bg-brand-dark"
          onClick={() => void updateServiceWorker(true)}
        >
          {copy.pwa.updateButton}
        </button>
      </div>
    </div>
  );
}
