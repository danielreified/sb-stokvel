import { QueryClient } from '@tanstack/react-query';

/**
 * Singleton QueryClient. Persistence is per-query via lib/persist/idb-cache —
 * see docs/architecture/persistence.md. No global persister; the queryFns
 * own the IDB read/write themselves.
 *
 * Defaults are conservative for cheap-Android targets; per-query overrides
 * tune them tighter where data churn is high.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 2,
    },
  },
});
