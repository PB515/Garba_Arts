'use client';
/**
 * useActionState so a recoverable problem (missing fields, duplicate phone,
 * negative fee) shows inline instead of crashing the page - see
 * add-lead-form.tsx for the fuller reasoning, same pattern here. On success
 * createStudent redirects to the new student's detail page itself, so this
 * form never needs to reset in place.
 */
import { useActionState } from 'react';
import { createStudent } from './actions';
import { LocationBatchSelect } from './location-batch-select';
import { SourceField } from './source-field';
import { SubmitButton } from '@/lib/patterns/submit-button';

const FIELD_CLASS = 'rounded-[var(--radius)] border border-border px-3 py-2 text-sm';

interface Loc {
  id: string;
  name: string;
}
interface Batch {
  id: string;
  name: string;
  location_id: string;
}

export function AddInquiryForm({
  locations,
  batches,
  defaultLocationId,
}: {
  locations: Loc[];
  batches: Batch[];
  defaultLocationId: string;
}) {
  const [state, formAction] = useActionState(createStudent, null);

  return (
    <form action={formAction} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {state?.error ? (
        <p className="col-span-2 rounded-[var(--radius)] border border-red-600/30 bg-red-600/10 px-3 py-2 text-sm text-red-600 sm:col-span-4">
          {state.error}
        </p>
      ) : null}
      <input name="name" placeholder="Full Name" required className={FIELD_CLASS} />
      <input name="phone_number" placeholder="Phone" required className={FIELD_CLASS} />
      <input name="whatsapp_number" placeholder="WhatsApp (if different)" className={FIELD_CLASS} />
      <input name="residential_area" placeholder="Residential area" className={FIELD_CLASS} />
      <SourceField variant="inquiry" className={FIELD_CLASS} />
      <LocationBatchSelect
        locations={locations}
        batches={batches}
        locationField="location_id"
        batchField="batch_id"
        defaultLocationId={defaultLocationId}
        className={FIELD_CLASS}
      />
      {/* Only Demo fee belongs on the quick-add form - the real course fee
          isn't decided yet at inquiry time. Fee total is still editable
          later, on the full detail page, once it is. */}
      <input
        name="demo_fee_amount"
        type="number"
        step="1"
        min="0"
        placeholder="Demo fee (small, optional)"
        className={FIELD_CLASS}
      />
      <input name="remarks" placeholder="Remarks" className={`col-span-2 sm:col-span-3 ${FIELD_CLASS}`} />
      <SubmitButton className="rounded-[var(--radius)] bg-accent px-3 py-2 text-sm font-medium text-accent-foreground disabled:opacity-60">
        Add
      </SubmitButton>
    </form>
  );
}
