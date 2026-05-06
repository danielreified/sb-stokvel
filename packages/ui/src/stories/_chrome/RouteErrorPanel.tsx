import { AlertTriangle } from 'lucide-react';
import { Button } from '../../components/button.js';

interface RouteErrorPanelProps {
  /** Per-route message; falls back to a generic line. */
  message?: string;
  /** TanStack Router's `errorComponent({ reset })` wires this. */
  onRetry?: () => void;
  /** Optional debug context — request id, error message. */
  detail?: string;
}

/**
 * Per-route error fallback rendered inside the AppWindow's panel slot.
 */
export function RouteErrorPanel({
  message = 'Something went wrong loading this page.',
  onRetry,
  detail,
}: RouteErrorPanelProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" aria-hidden="true" />
      </div>
      <div className="max-w-sm space-y-1">
        <h2 className="text-lg font-semibold">{message}</h2>
        {detail && <p className="text-xs text-muted-foreground">{detail}</p>}
      </div>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
