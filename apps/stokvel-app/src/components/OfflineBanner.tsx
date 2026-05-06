import { WifiOff } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import { useCopy } from '../copy/index.js';

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
  const copy = useCopy();
  const isOnline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2"
    >
      <WifiOff className="size-4 shrink-0 text-amber-700" aria-hidden="true" />
      <p className="text-xs font-medium text-amber-800">{copy.offline.banner}</p>
    </div>
  );
}
