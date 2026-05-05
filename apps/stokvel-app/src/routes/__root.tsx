import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';

export interface RouterContext {
  queryClient: QueryClient;
  auth: { isAuthenticated: boolean; memberId?: string } | undefined;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  return <Outlet />;
}
