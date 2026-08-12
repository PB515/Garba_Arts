'use client';
/**
 * The "Log payment" mini-form, reused for both the main fee's Fees box and
 * the Demo fee box - paymentType tags which one via a hidden field, so a
 * single addPayment action serves both. useActionState for inline errors,
 * same pattern as every other form in this app since none of them have an
 * error boundary to fall back on.
 *
 * `totalIsSet` (decision #82) hides the form entirely when the relevant
 * total (Fee total for the main box, Demo fee amount for the demo box)
 * hasn't been entered yet - a payment with nothing to reconcile against was
 * easy to log by mistake before this existed. The real guard is server-side
 * in addPayment; this is just the matching UI convenience, same split used
 * everywhere else in this app.
 */
import { useActionState } from 'react';
import { addPayment } from './actions';
import { PaymentModeFields } from './payment-mode-fields';
import { SubmitButton } from '@/lib/patterns/submit-button';

const FIELD_CLASS = 'rounded-[var(--radius)] border border-border px-3 py-2 text-sm';

export function PaymentLogForm({
  studentId,
  paymentType,
  totalIsSet,
}: {
  studentId: string;
  paymentType: 'main' | 'demo';
  totalIsSet: boolean;
}) {
  const [state, formAction] = useActionState(addPayment.bind(null, studentId), null);

  if (!totalIsSet) {
    return (
      <p className="mt-4 border-t border-border pt-4 text-sm text-muted">
        Set the {paymentType === 'demo' ? 'Demo fee amount' : 'Fee total'} above before logging a payment.
      </p>
    );
  }

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
