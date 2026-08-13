'use client';

/**
 * Per-registration payment history + "Log payment" mini-form (decision #86)
 * - the event-side equivalent of students' PaymentLogForm, reusing the same
 * PaymentModeFields component (it's fully generic, no student-specific
 * coupling) so Cash/UPI/split entry looks and behaves identically across
 * both features. Collapsed behind a toggle by default since the
 * registrations table already has a lot going on per row; "Paid: X" always
 * shows, the detail (history + form) is opt-in per row.
 */
import { useActionState, useState } from 'react';
import { PaymentModeFields } from '@/app/students/payment-mode-fields';
import { paymentModeLabel } from '@/lib/fee-status';
import { SubmitButton } from '@/lib/patterns/submit-button';

const FIELD_CLASS = 'rounded-[var(--radius)] border border-border px-2 py-1 text-xs';

interface EventPayment {
  id: string;
  amount: number;
  mode: string;
  upi_transaction_id: string | null;
  paid_date: string;
}

export function EventPaymentLog({
  payments,
  totalPaid,
  addAction,
  removeAction,
}: {
  payments: EventPayment[];
  totalPaid: number;
  addAction: (prevState: { error: string } | null, formData: FormData) => Promise<{ error: string } | null>;
  removeAction: (paymentId: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(addAction, null);

  return (
    <div>
      <button type="button" onClick={() => setOpen((v) => !v)} className="underline">
        Paid: {totalPaid.toFixed(2)}
      </button>
      {open ? (
        <div className="mt-2 space-y-2 rounded-[var(--radius)] border border-border p-2 text-xs">
          {payments.length ? (
            <ul className="space-y-1">
              {payments.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2">
                  <span>
                    {p.paid_date} · {paymentModeLabel(p.mode)} · {p.amount.toFixed(2)}
                    {p.upi_transaction_id ? ` · ${p.upi_transaction_id}` : ''}
                  </span>
                  <form action={removeAction.bind(null, p.id)}>
                    <SubmitButton className="text-red-600 underline">Remove</SubmitButton>
                  </form>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">No payments logged yet.</p>
          )}

          <form action={formAction} className="grid grid-cols-2 gap-1">
            {state?.error ? <p className="col-span-2 text-red-600">{state.error}</p> : null}
            <PaymentModeFields className={FIELD_CLASS} />
            <input name="paid_date" type="date" required className={FIELD_CLASS} />
            <SubmitButton className="col-span-2 rounded-[var(--radius)] bg-accent px-2 py-1 text-xs font-medium text-accent-foreground disabled:opacity-60">
              Log payment
            </SubmitButton>
          </form>
        </div>
      ) : null}
    </div>
  );
}
