import { zodResolver } from '@hookform/resolvers/zod';
import type { StokvelId } from '@seyva/types';
import type { ContributionCreateInput } from '@seyva/validation';
import { ContributionCreateSchema } from '@seyva/validation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useCopy } from '../../copy/index.js';
import { api } from '../../lib/api.js';
import { getCurrentMonth } from '../../lib/date.js';

interface MakeContributionFormProps {
  stokvelId: StokvelId;
  memberId: string;
  onSuccess?: () => void;
}

export function MakeContributionForm({
  stokvelId,
  memberId,
  onSuccess,
}: MakeContributionFormProps) {
  const copy = useCopy();
  const queryClient = useQueryClient();
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  const form = useForm<ContributionCreateInput>({
    resolver: zodResolver(ContributionCreateSchema),
    defaultValues: {
      memberId,
      amount: 50000,
      month: getCurrentMonth(),
    },
  });

  const mutation = useMutation({
    mutationFn: (data: ContributionCreateInput) => api.stokvel.createContribution(stokvelId, data),
    onSuccess: () => {
      // Invalidate contributions + balance so they refetch after successful POST
      queryClient.invalidateQueries({ queryKey: ['contributions', stokvelId] });
      queryClient.invalidateQueries({ queryKey: ['balance', stokvelId] });
      onSuccess?.();
    },
  });

  if (!isOnline) {
    return (
      <div className="rounded-xl bg-amber-50 p-4 text-center">
        <p className="text-sm font-medium text-amber-800">
          {copy.contributions.offlineDisabledMessage}
        </p>
        {/* NETWORK ONLY: intentionally no offline queue — money is high-stakes */}
      </div>
    );
  }

  const {
    register,
    formState: { errors, isSubmitting },
  } = form;

  return (
    <form
      onSubmit={form.handleSubmit((data) => mutation.mutateAsync(data))}
      noValidate
      className="space-y-4"
    >
      {mutation.isSuccess && (
        <p role="status" className="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">
          {copy.contributions.successMessage}
        </p>
      )}
      {mutation.isError && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          {/* Surface the server's specific message when present (e.g. "amount must be positive")
              instead of a generic fallback — banking UX needs precision. */}
          {mutation.error instanceof Error && mutation.error.message
            ? mutation.error.message
            : copy.errors.unexpected}
        </p>
      )}

      <div className="space-y-1">
        <label htmlFor="month" className="block text-sm font-medium text-gray-700">
          {copy.contributions.monthSelectLabel}
        </label>
        <input
          id="month"
          type="month"
          aria-invalid={!!errors.month}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand/30"
          {...register('month')}
        />
        {errors.month && (
          <p role="alert" className="text-xs text-red-600">
            {errors.month.message}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          {copy.contributions.amountLabel}
        </label>
        <input
          id="amount"
          type="number"
          min={1}
          aria-invalid={!!errors.amount}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand/30"
          {...register('amount', { valueAsNumber: true })}
        />
        {errors.amount && (
          <p role="alert" className="text-xs text-red-600">
            {errors.amount.message}
          </p>
        )}
      </div>

      {/* Hidden field — memberId comes from auth context */}
      <input type="hidden" {...register('memberId')} />

      <button
        type="submit"
        disabled={isSubmitting || mutation.isPending}
        className="w-full rounded-xl bg-brand py-3 font-semibold text-white disabled:opacity-60"
      >
        {mutation.isPending ? copy.contributions.submitting : copy.contributions.submitButton}
      </button>
    </form>
  );
}
