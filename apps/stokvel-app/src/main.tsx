import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import React from 'react';
import ReactDOM from 'react-dom/client';
import AppWithAuth from './App.js';
import { CACHE_SCHEMA_VERSION } from './lib/persist/cache-schema.js';
import { persister } from './lib/persist/persister.js';
import { queryClient } from './lib/query-client.js';
import './styles.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, buster: String(CACHE_SCHEMA_VERSION) }}
    >
      <AppWithAuth />
    </PersistQueryClientProvider>
  </React.StrictMode>,
);
