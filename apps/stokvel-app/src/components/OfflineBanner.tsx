import { useSyncExternalStore } from 'react';
import { copy } from '../copy/index.js';

function subscribe(cb: () => void) {
  window.addEventListener('online', cb);
  window.addEventListener('offline', cb);
  return () => {
    window.removeEventListener('online', cb);
    window.removeEventListener('offline', cb);
  };
}

function getSnapshot() {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

function getServerSnapshot() {
  return true;
}

export function OfflineBanner() {
  const isOnline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (isOnline) return null;

  return (
    <div role="status" aria-live="polite" className="bg-amber-50 px-4 py-2 text-center">
      <p className="text-xs font-medium text-amber-800">{copy.offline.banner}</p>
    </div>
  );
}
