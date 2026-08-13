'use client';

import { useState } from 'react';
import { SubmitButton } from '@/lib/patterns/submit-button';

const FIELD_CLASS = 'rounded-[var(--radius)] border border-border px-3 py-2 text-sm';

/**
 * Creates a new event "update" (decision #87) - two ways to start it,
 * matching the owner's own two examples ("generic like thank you for
 * registration... but with name" vs. an ad hoc "venue change" message):
 * pick a starting point from the shared message_templates library (the same
 * one Lead/Inquiry use), or just type one from scratch. Either way it's the
 * same plain textarea by the time it's submitted - picking a template just
 * pre-fills it, staff can still edit before creating.
 */
export function NewBroadcastForm({
  templates,
  createAction,
}: {
  templates: { id: string; label: string; body: string }[];
  createAction: (formData: FormData) => Promise<void>;
}) {
  const [label, setLabel] = useState('');
  const [message, setMessage] = useState('');

  return (
    <form action={createAction} className="space-y-2">
      <input
        name="label"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Update label (e.g. Venue change)"
        required
        className={`w-full ${FIELD_CLASS}`}
      />
      {templates.length ? (
        <select
          defaultValue=""
          onChange={(e) => {
            const t = templates.find((t) => t.id === e.target.value);
            if (t) {
              setMessage(t.body);
              if (!label) setLabel(t.label);
            }
          }}
          className={`w-full ${FIELD_CLASS}`}
        >
          <option value="">Start from a template (optional)</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      ) : null}
      <textarea
        name="message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Message - {name}, {event_name}, {event_date}, {venue} all fill in automatically"
        required
        rows={3}
        className={`w-full ${FIELD_CLASS}`}
      />
      <SubmitButton className="rounded-[var(--radius)] bg-accent px-3 py-2 text-sm font-medium text-accent-foreground disabled:opacity-60">
        Create update
      </SubmitButton>
    </form>
  );
}
