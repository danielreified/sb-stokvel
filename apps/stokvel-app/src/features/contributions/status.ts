import type { ContributionStatus } from '@seyva/types';
import type { Copy } from '../../copy/index.js';

export const STATUS_VARIANT: Record<ContributionStatus, 'default' | 'secondary' | 'destructive'> = {
  confirmed: 'default',
  pending: 'secondary',
  missed: 'destructive',
};

export const getStatusLabel = (copy: Copy, status: ContributionStatus): string => {
  switch (status) {
    case 'confirmed':
      return copy.contributions.statusConfirmed;
    case 'pending':
      return copy.contributions.statusPending;
    case 'missed':
      return copy.contributions.statusMissed;
  }
};
