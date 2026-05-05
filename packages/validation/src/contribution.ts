import { z } from 'zod';

export const ContributionCreateSchema = z.object({
  memberId: z.string().uuid('memberId must be a valid UUID'),
  /** Amount in cents (ZAR). Must be a positive integer. */
  amount: z
    .number()
    .int('Amount must be a whole number of cents')
    .positive('Amount must be positive'),
  /** Calendar month being covered, format YYYY-MM. */
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Month must be in YYYY-MM format'),
});

export type ContributionCreateInput = z.infer<typeof ContributionCreateSchema>;
