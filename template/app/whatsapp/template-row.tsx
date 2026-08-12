'use client';
import { useActionState, useState } from 'react';
import { updateTemplate, deleteTemplate } from './actions';
import { SubmitButton } from '@/lib/patterns/submit-button';

const FIELD_CLASS = 'rounded-[var(--radius)] border border-border px-3 py-2 text-sm';

export function TemplateRow({ id, label, body }: { id: string; label: string; body: string }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction] = useActionState(updateTemplate.bind(null, id), null);

  if (editing) {
    return (
      <form action={formAction} className="space-y-3 rounded-[var(--radius)] border border-border p-4">
        {state?.error ? (
          <p className="rounded-[var(--radius)] border border-red-600/30 bg-red-600/10 px-3 py-2 text-sm text-red-600">
            {state.error}
          </p>
        ) : null}
        <input name="label" defaultValue={label} required className={`w-full ${FIELD_CLASS}`} />
        <textarea name="body" defaultValue={body} required rows={3} className={`w-full ${FIELD_CLASS}`} />
        <div className="flex gap-3">
          <SubmitButton className="rounded-[var(--radius)] bg-accent px-3 py-2 text-sm font-medium text-accent-foreground disabled:opacity-60">
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
    );
  }

  return (
    <div className="rounded-[var(--radius)] border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{label}</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-muted">{body}</p>
        </div>
        <div className="flex shrink-0 gap-3 text-sm">
          <button type="button" onClick={() => setEditing(true)} className="underline">
            Edit
          </button>
          <form action={deleteTemplate.bind(null, id)}>
            <SubmitButton className="text-red-600 underline">Remove</SubmitButton>
          </form>
        </div>
      </div>
    </div>
  );
}
