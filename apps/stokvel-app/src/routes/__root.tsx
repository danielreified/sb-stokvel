import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { copy } from '../copy/index.js';
import type { AuthState } from '../features/auth/types.js';

export interface RouterContext {
  queryClient: QueryClient;
  auth: AuthState | undefined;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  errorComponent: RootErrorComponent,
});

function RootComponent() {
  return <Outlet />;
}

function RootErrorComponent({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : copy.errors.unexpected;
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-lg font-medium text-gray-900">{copy.errors.unexpected}</p>
      <p className="text-sm text-gray-500">{message}</p>
      <button
        type="button"
        className="rounded-lg bg-brand px-6 py-2 text-sm font-medium text-white"
        onClick={() => window.location.reload()}
      >
        {copy.errors.retryButton}
      </button>
    </div>
  );
}
