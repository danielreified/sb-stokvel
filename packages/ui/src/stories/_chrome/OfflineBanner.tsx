import { WifiOff } from 'lucide-react';

interface OfflineBannerProps {
  /** Override the default copy for layout testing. */
  message?: string;
}

/**
 * Visual-only offline banner — amber strip with icon. The real app wraps a
 * `useSyncExternalStore` over `navigator.onLine` to gate visibility; here it
 * always renders so designs can be inspected.
 */
export function OfflineBanner({
  message = "You're offline — showing your last saved data.",
}: OfflineBannerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2"
    >
      <WifiOff className="size-4 shrink-0 text-amber-700" aria-hidden="true" />
      <p className="text-xs font-medium text-amber-800">{message}</p>
    </div>
  );
}
