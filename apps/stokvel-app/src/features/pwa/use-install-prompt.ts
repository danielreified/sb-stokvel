import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Module-scoped capture of the beforeinstallprompt event.
 *
 * Chromium fires `beforeinstallprompt` very early — typically BEFORE the
 * React tree mounts. If we wait for `useEffect` to register the listener
 * (which runs post-render), we miss the event entirely and `canInstall`
 * stays false forever even though the install criteria were met.
 *
 * Fix: register at module load. The first import of this file (which
 * happens during the initial bundle execution, well before React's first
 * render) attaches the listener and stashes the event for the hook to
 * read when it mounts.
 */
let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const fn of listeners) fn();
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    // reason: BeforeInstallPromptEvent isn't in lib.dom yet; the runtime
    // event matches the interface declared above.
    deferredPrompt = e as BeforeInstallPromptEvent;
    emit();
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    emit();
  });
}

export function useInstallPrompt() {
  const [canInstall, setCanInstall] = useState<boolean>(deferredPrompt !== null);

  useEffect(() => {
    const update = () => setCanInstall(deferredPrompt !== null);
    listeners.add(update);
    // Re-sync on mount in case the event fired between module load and now.
    update();
    return () => {
      listeners.delete(update);
    };
  }, []);

  async function triggerInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
    if (!deferredPrompt) return 'unavailable';
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      deferredPrompt = null;
      emit();
    }
    return outcome;
  }

  return { canInstall, triggerInstall };
}
