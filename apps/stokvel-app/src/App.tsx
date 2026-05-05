import { useQuery } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { meQueryOptions } from './features/auth/queries.js';
import type { AuthState } from './features/auth/types.js';
import { queryClient } from './lib/query-client.js';
import { routeTree } from './routeTree.gen.js';

export const router = createRouter({
  routeTree,
  context: {
    queryClient,
    auth: undefined as never,
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function AppWithAuth() {
  const { data } = useQuery(meQueryOptions);

  const auth: AuthState = data?.member
    ? { isAuthenticated: true, member: data.member }
    : { isAuthenticated: false };

  return <RouterProvider router={router} context={{ queryClient, auth }} />;
}

export default AppWithAuth;
