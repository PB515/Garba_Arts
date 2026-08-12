'use client';
/**
 * Fee total's own small save, living inside the Fees box (decision #67) -
 * moved out of the Details form since setting the number in one place but
 * seeing it in another was confusing, the owner's direct complaint.
 */
import { useActionState } from 'react';
import { updateFeeTotal } from './actions';
import { SubmitButton } from '@/lib/patterns/submit-button';

const FIELD_CLASS = 'rounded-[var(--radius)] border border-border px-3 py-2 text-sm';

export function FeeTotalForm({ studentId, feeTotal }: { studentId: string; feeTotal: number | null }) {
  const [state, formAction] = useActionState(updateFeeTotal.bind(null, studentId), null);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      {state?.error ? (
        <p className="w-full rounded-[var(--radius)] border border-red-600/30 bg-red-600/10 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      ) : null}
      <label className="text-sm">
        Fee total
        <input
          name="fee_total"
          type="number"
          step="1"
          min="0"
          defaultValue={feeTotal ?? ''}
          className={`mt-1 ${FIELD_CLASS}`}
        />
      </label>
      <SubmitButton className="rounded-[var(--radius)] border border-border px-3 py-2 text-sm font-medium disabled:opacity-60">
        Save
      </SubmitButton>
    </form>
  );
}
