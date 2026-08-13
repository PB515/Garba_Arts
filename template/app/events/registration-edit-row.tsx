'use client';

import { useState } from 'react';
import { AttendeeRows } from './attendee-rows';
import { EventPaymentLog } from './event-payment-log';
import { SubmitButton } from '@/lib/patterns/submit-button';

const FIELD_CLASS = 'rounded-[var(--radius)] border border-border px-3 py-2 text-sm';

interface Loc {
  id: string;
  name: string;
}

interface Registration {
  id: string;
  registrant_name: string;
  registrant_phone: string | null;
  location_id: string | null;
  fee_amount: number | null;
  remarks: string | null;
}

interface Attendee {
  name: string;
  phone: string;
  whatsapp: string;
}

interface EventPayment {
  id: string;
  amount: number;
  mode: string;
  upi_transaction_id: string | null;
  paid_date: string;
}

/**
 * A registration row that toggles into an inline edit form. Registrations
 * previously could only be fixed by delete-and-redo (Archive/Remove) - the
 * owner's call was to build the missing edit UI, wiring the already-correct
 * updateRegistration action rather than leaving it unused.
 */
export function RegistrationEditRow({
  registration,
  attendees,
  locations,
  locationLabel,
  payments,
  addPaymentAction,
  removePaymentAction,
  updateAction,
  archiveAction,
  removeAction,
}: {
  registration: Registration;
  attendees: Attendee[];
  locations: Loc[];
  locationLabel: string;
  payments: EventPayment[];
  addPaymentAction: (prevState: { error: string } | null, formData: FormData) => Promise<{ error: string } | null>;
  removePaymentAction: (paymentId: string) => Promise<void>;
  updateAction: (formData: FormData) => Promise<void>;
  archiveAction: () => Promise<void>;
  removeAction: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  if (!editing) {
    return (
      <tr className="border-t border-border">
        <td className="p-3">{registration.registrant_name}</td>
        <td className="p-3">{registration.registrant_phone ?? '-'}</td>
        <td className="p-3">{locationLabel}</td>
        <td className="p-3">{attendees.length ? attendees.map((a) => a.name).join(', ') : '-'}</td>
        <td className="p-3">{1 + attendees.length}</td>
        <td className="p-3">{registration.fee_amount !== null ? registration.fee_amount.toFixed(2) : '-'}</td>
        <td className="p-3">
          <EventPaymentLog
            payments={payments}
            totalPaid={totalPaid}
            addAction={addPaymentAction}
            removeAction={removePaymentAction}
          />
        </td>
        <td className="p-3">{registration.remarks ?? '-'}</td>
        <td className="p-3">
          <div className="flex gap-3">
            <button type="button" onClick={() => setEditing(true)} className="underline">
              Edit
            </button>
            <form action={archiveAction}>
              <SubmitButton className="underline">Archive</SubmitButton>
            </form>
            <form action={removeAction}>
              <SubmitButton className="text-red-600 underline">Remove</SubmitButton>
            </form>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t border-border bg-muted/5">
      <td colSpan={9} className="p-3">
        <form
          action={async (formData) => {
            await updateAction(formData);
            setEditing(false);
          }}
          className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          <input
            name="registrant_name"
            defaultValue={registration.registrant_name}
            placeholder="Registrant full name"
            required
            className={FIELD_CLASS}
          />
          <input
            name="registrant_phone"
            defaultValue={registration.registrant_phone ?? ''}
            placeholder="Phone (optional)"
            className={FIELD_CLASS}
          />
          <select name="location_id" defaultValue={registration.location_id ?? ''} required className={FIELD_CLASS}>
            <option value="" disabled>
              Location
            </option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
          <input
            name="fee_amount"
            type="number"
            step="0.01"
            min="0"
            defaultValue={registration.fee_amount ?? ''}
            placeholder="Fee (leave blank if free)"
            className={FIELD_CLASS}
          />
          <AttendeeRows fieldClass={FIELD_CLASS} initialAttendees={attendees} />
          <input
            name="remarks"
            defaultValue={registration.remarks ?? ''}
            placeholder="Remarks"
            className={`col-span-2 sm:col-span-3 ${FIELD_CLASS}`}
          />
          <div className="col-span-2 flex gap-3 sm:col-span-4">
            <SubmitButton className="rounded-[var(--radius)] bg-accent px-3 py-2 text-sm font-medium text-accent-foreground">
              Save
            </SubmitButton>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-[var(--radius)] border border-border px-3 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </td>
    </tr>
  );
}
