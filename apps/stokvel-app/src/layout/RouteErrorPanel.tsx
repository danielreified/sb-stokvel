import { Button } from '@seyva/ui';
import { AlertTriangle } from 'lucide-react';
import { useCopy } from '../copy/index.js';

interface RouteErrorPanelProps {
  /** Per-route message; falls back to a generic copy line. */
  message?: string;
  /** TanStack Router passes this from `errorComponent({ reset })`. */
  onRetry?: () => void;
  /** Optional context for debugging — request id, error message. */
  detail?: string;
}

/**
 * Per-route error fallback rendered inside the AppWindow's panel slot when
 * a loader throws. Domain-aware copy + a reset button — never a blank screen.
 */
export function RouteErrorPanel({ message, onRetry, detail }: RouteErrorPanelProps) {
  const copy = useCopy();
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" aria-hidden="true" />
      </div>
      <div className="max-w-sm space-y-1">
        <h2 className="text-lg font-semibold">{message ?? copy.errors.unexpected}</h2>
        {detail && <p className="text-xs text-muted-foreground">{detail}</p>}
      </div>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          {copy.errors.retryButton}
        </Button>
      )}
    </div>
  );
}
