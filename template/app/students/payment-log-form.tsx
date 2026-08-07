'use client';
/**
 * The "Log payment" mini-form, reused for both the main fee's Fees box and
 * the Demo fee box - paymentType tags which one via a hidden field, so a
 * single addPayment action serves both. useActionState for inline errors,
 * same pattern as every other form in this app since none of them have an
 * error boundary to fall back on.
 */
import { useActionState } from 'react';
import { addPayment } from './actions';
import { PaymentModeFields } from './payment-mode-fields';
import { SubmitButton } from './submit-button';

const FIELD_CLASS = 'rounded-[var(--radius)] border border-border px-3 py-2 text-sm';

export function PaymentLogForm({ studentId, paymentType }: { studentId: string; paymentType: 'main' | 'demo' }) {
  const [state, formAction] = useActionState(addPayment.bind(null, studentId), null);

  return (
    <form action={formAction} className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 sm:grid-cols-4">
      {state?.error ? (
        <p className="col-span-2 rounded-[var(--radius)] border border-red-600/30 bg-red-600/10 px-3 py-2 text-sm text-red-600 sm:col-span-4">
          {state.error}
        </p>
      ) : null}
      <input type="hidden" name="payment_type" value={paymentType} />
      <PaymentModeFields className={FIELD_CLASS} />
      <input name="paid_date" type="date" required className={FIELD_CLASS} />
      <input name="remarks" placeholder="Remarks" className={FIELD_CLASS} />
      <SubmitButton className="col-span-2 rounded-[var(--radius)] bg-accent px-3 py-2 text-sm font-medium text-accent-foreground disabled:opacity-60 sm:col-span-4">
        Log payment
      </SubmitButton>
    </form>
  );
}
