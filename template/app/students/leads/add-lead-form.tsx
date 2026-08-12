'use client';
/**
 * useActionState (not a plain <form action={createLead}>) so a recoverable
 * problem - missing fields, a duplicate phone - shows inline instead of
 * crashing the whole page (there's no error.tsx boundary anywhere in this
 * app). The parent page keys this component on the current lead count, so a
 * successful add remounts it - clearing both the input fields and any
 * lingering error message together.
 */
import { useActionState } from 'react';
import { createLead } from '../actions';
import { SourceField } from '../source-field';
import { SubmitButton } from '@/lib/patterns/submit-button';

const FIELD_CLASS = 'rounded-[var(--radius)] border border-border px-3 py-2 text-sm';

export function AddLeadForm() {
  const [state, formAction] = useActionState(createLead, null);

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
      <select name="gender" defaultValue="" className={FIELD_CLASS}>
        <option value="">Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>
      <SourceField variant="lead" className={FIELD_CLASS} />
      <input name="remarks" placeholder="Remarks" className={`col-span-2 sm:col-span-3 ${FIELD_CLASS}`} />
      <SubmitButton className="rounded-[var(--radius)] bg-accent px-3 py-2 text-sm font-medium text-accent-foreground disabled:opacity-60">
        Add
      </SubmitButton>
    </form>
  );
}
