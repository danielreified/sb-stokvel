import { Button } from '../../components/button.js';

interface RecommendedUpdateBannerProps {
  onUpdate?: () => void;
  onDismiss?: () => void;
}

/**
 * Persistent dismissable banner shown when `updateLevel === 'recommended'`.
 * Sits above the app panel — informational, not blocking.
 */
export function RecommendedUpdateBanner({ onUpdate, onDismiss }: RecommendedUpdateBannerProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-blue-200 bg-blue-50 px-4 py-2.5">
      <p className="text-sm text-blue-900">
        <span className="font-semibold">A new version is available.</span>
        <span className="ml-1.5 text-blue-700">Update for the latest features and fixes.</span>
      </p>
      <div className="flex shrink-0 items-center gap-2">
        <Button size="sm" onClick={onUpdate}>
          Update now
        </Button>
        <Button size="sm" variant="ghost" onClick={onDismiss}>
          Later
        </Button>
      </div>
    </div>
  );
}
