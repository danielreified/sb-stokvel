import type { StokvelId } from '@seyva/types';
import { queryOptions } from '@tanstack/react-query';
import { api } from '../../lib/api.js';

export const stokvelQueryOptions = (stokvelId: StokvelId) =>
  queryOptions({
    queryKey: ['stokvel', stokvelId],
    queryFn: () => api.stokvel.get(stokvelId),
    staleTime: 60 * 60 * 1000,
  });

export const balanceQueryOptions = (stokvelId: StokvelId) =>
  queryOptions({
    queryKey: ['balance', stokvelId],
    queryFn: () => api.stokvel.balance(stokvelId),
    staleTime: 5 * 60 * 1000,
  });

export const membersQueryOptions = (stokvelId: StokvelId) =>
  queryOptions({
    queryKey: ['members', stokvelId],
    queryFn: () => api.stokvel.members(stokvelId),
    staleTime: 60 * 60 * 1000,
  });
