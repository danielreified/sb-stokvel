import { useQuery } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { meQueryOptions } from './features/auth/queries.js';
import type { AuthState } from './features/auth/types.js';
import { queryClient } from './lib/query-client.js';
import { routeTree } from './routeTree.gen.js';

const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/react-query-devtools').then((m) => ({ default: m.ReactQueryDevtools })),
    )
  : null;

const TanStackRouterDevtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/router-devtools').then((m) => ({ default: m.TanStackRouterDevtools })),
    )
  : null;

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

  return (
    <>
      <RouterProvider router={router} context={{ queryClient, auth }} />
      {ReactQueryDevtools && (
        <Suspense>
          <ReactQueryDevtools initialIsOpen={false} />
        </Suspense>
      )}
      {TanStackRouterDevtools && (
        <Suspense>
          <TanStackRouterDevtools router={router} initialIsOpen={false} />
        </Suspense>
      )}
    </>
  );
}

export default AppWithAuth;
