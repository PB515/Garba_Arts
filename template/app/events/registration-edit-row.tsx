'use client';

import { useState } from 'react';
import { AttendeeRows } from './attendee-rows';

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
  amount_paid: number;
  remarks: string | null;
}

interface Attendee {
  name: string;
  phone: string;
  whatsapp: string;
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
  updateAction,
  archiveAction,
  removeAction,
}: {
  registration: Registration;
  attendees: Attendee[];
  locations: Loc[];
  locationLabel: string;
  updateAction: (formData: FormData) => Promise<void>;
  archiveAction: () => Promise<void>;
  removeAction: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);

  if (!editing) {
    return (
      <tr className="border-t border-border">
        <td className="p-3">{registration.registrant_name}</td>
        <td className="p-3">{registration.registrant_phone ?? '-'}</td>
        <td className="p-3">{locationLabel}</td>
        <td className="p-3">{attendees.length ? attendees.map((a) => a.name).join(', ') : '-'}</td>
        <td className="p-3">{1 + attendees.length}</td>
        <td className="p-3">{registration.fee_amount !== null ? registration.fee_amount.toFixed(2) : '-'}</td>
        <td className="p-3">{registration.amount_paid.toFixed(2)}</td>
        <td className="p-3">{registration.remarks ?? '-'}</td>
        <td className="p-3">
          <div className="flex gap-3">
            <button type="button" onClick={() => setEditing(true)} className="underline">
              Edit
            </button>
            <form action={archiveAction}>
              <button type="submit" className="underline">
                Archive
              </button>
            </form>
            <form action={removeAction}>
              <button type="submit" className="text-red-600 underline">
                Remove
              </button>
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
          <input
            name="amount_paid"
            type="number"
            step="0.01"
            min="0"
            defaultValue={registration.amount_paid}
            placeholder="Amount paid"
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
            <button type="submit" className="rounded-[var(--radius)] bg-accent px-3 py-2 text-sm font-medium text-accent-foreground">
              Save
            </button>
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
