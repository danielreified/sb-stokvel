import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { CACHE_SCHEMA_VERSION } from './lib/persist/cache-schema.js';
import { persister } from './lib/persist/persister.js';
import { queryClient } from './lib/query-client.js';
import { routeTree } from './routeTree.gen.js';
import './styles.css';

const router = createRouter({
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

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, buster: String(CACHE_SCHEMA_VERSION) }}
    >
      <RouterProvider router={router} />
    </PersistQueryClientProvider>
  </React.StrictMode>,
);
