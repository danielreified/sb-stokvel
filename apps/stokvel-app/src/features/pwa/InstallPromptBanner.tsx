import { useState } from 'react';
import { useCopy } from '../../copy/index.js';
import { useInstallPrompt } from './use-install-prompt.js';

export function InstallPromptBanner() {
  const copy = useCopy();
  const { canInstall, triggerInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);

  if (!canInstall || dismissed) return null;

  return (
    <div className="mx-4 mt-3 rounded-2xl bg-brand/10 p-4">
      <p className="text-sm font-semibold text-brand">{copy.pwa.installPromptTitle}</p>
      <p className="mt-0.5 text-xs text-gray-600">{copy.pwa.installPromptBody}</p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={triggerInstall}
          className="flex-1 rounded-xl bg-brand py-2 text-sm font-semibold text-white"
        >
          {copy.pwa.installButton}
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="flex-1 rounded-xl border border-gray-200 py-2 text-sm text-gray-600"
        >
          {copy.pwa.installDismiss}
        </button>
      </div>
    </div>
  );
}
