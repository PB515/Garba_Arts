'use client';
import { useActionState } from 'react';
import { createTemplate } from './actions';
import { SubmitButton } from '@/app/students/submit-button';

const FIELD_CLASS = 'rounded-[var(--radius)] border border-border px-3 py-2 text-sm';

export function AddTemplateForm() {
  const [state, formAction] = useActionState(createTemplate, null);

  return (
    <form action={formAction} className="space-y-3">
      {state?.error ? (
        <p className="rounded-[var(--radius)] border border-red-600/30 bg-red-600/10 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      ) : null}
      <input name="label" placeholder="Template name, e.g. Fee reminder" required className={`w-full ${FIELD_CLASS}`} />
      <textarea
        name="body"
        placeholder="Message - use {name} where the person's name should go"
        required
        rows={3}
        className={`w-full ${FIELD_CLASS}`}
      />
      <SubmitButton className="rounded-[var(--radius)] bg-accent px-3 py-2 text-sm font-medium text-accent-foreground disabled:opacity-60">
        Add template
      </SubmitButton>
    </form>
  );
}
