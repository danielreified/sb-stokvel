import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import AppWithAuth from './App.js';
import { queryClient } from './lib/query-client.js';
import '@seyva/ui/globals.css';
import './styles.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppWithAuth />
    </QueryClientProvider>
  </React.StrictMode>,
);
