'use client';
/** Same as fee-total-form.tsx, for the Demo fee box's own amount. */
import { useActionState } from 'react';
import { updateDemoFeeAmount } from './actions';
import { SubmitButton } from './submit-button';

const FIELD_CLASS = 'rounded-[var(--radius)] border border-border px-3 py-2 text-sm';

export function DemoFeeAmountForm({ studentId, demoFeeAmount }: { studentId: string; demoFeeAmount: number | null }) {
  const [state, formAction] = useActionState(updateDemoFeeAmount.bind(null, studentId), null);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      {state?.error ? (
        <p className="w-full rounded-[var(--radius)] border border-red-600/30 bg-red-600/10 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      ) : null}
      <label className="text-sm">
        Demo fee amount
        <input
          name="demo_fee_amount"
          type="number"
          step="0.01"
          min="0"
          defaultValue={demoFeeAmount ?? ''}
          className={`mt-1 ${FIELD_CLASS}`}
        />
      </label>
      <SubmitButton className="rounded-[var(--radius)] border border-border px-3 py-2 text-sm font-medium disabled:opacity-60">
        Save
      </SubmitButton>
    </form>
  );
}
