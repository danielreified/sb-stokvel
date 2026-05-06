import { Sparkles } from 'lucide-react';
import { Button } from '../../components/button.js';

interface UpdatePromptToastProps {
  onRefresh?: () => void;
  onLater?: () => void;
}

/**
 * Optional update toast — bottom-right corner, dismissable. The smallest
 * tier of the update strategy: the user can keep using the current version.
 */
export function UpdatePromptToast({ onRefresh, onLater }: UpdatePromptToastProps) {
  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <div className="pointer-events-auto absolute bottom-4 right-4 flex max-w-sm items-start gap-3 rounded-xl border bg-card p-4 shadow-lg">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Sparkles className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold">Update available</p>
            <p className="text-xs text-muted-foreground">
              A new version of Seyva is ready. Refresh to install.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={onRefresh}>
              Refresh
            </Button>
            <Button size="sm" variant="ghost" onClick={onLater}>
              Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
