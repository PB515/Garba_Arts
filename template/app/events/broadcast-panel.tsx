'use client';

import { useState } from 'react';
import { SubmitButton } from '@/lib/patterns/submit-button';

interface Recipient {
  registrationId: string;
  name: string;
  waLink: string | null;
  sent: boolean;
}

/**
 * One event "update" (decision #87) - a collapsed summary line ("sent to 5,
 * 10 remaining") that expands into the actual per-registrant list. Each row
 * gets a WhatsApp link (opens the real app, staff sends it themselves - same
 * wa.me limitation as Lead/Inquiry, no way to confirm delivery from here)
 * plus a separate "Mark sent"/"Undo" toggle that staff confirms manually
 * after actually sending - clicking WhatsApp does NOT auto-mark it sent.
 */
export function BroadcastPanel({
  label,
  message,
  recipients,
  markSentAction,
  unmarkSentAction,
  removeAction,
}: {
  label: string;
  message: string;
  recipients: Recipient[];
  markSentAction: (registrationId: string) => Promise<void>;
  unmarkSentAction: (registrationId: string) => Promise<void>;
  removeAction: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const sentCount = recipients.filter((r) => r.sent).length;

  return (
    <div className="rounded-[var(--radius)] border border-border p-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <button type="button" onClick={() => setOpen((v) => !v)} className="text-left underline">
          {label}: sent to {sentCount}, {recipients.length - sentCount} remaining
        </button>
        <form action={removeAction}>
          <SubmitButton className="text-xs text-red-600 underline">Remove</SubmitButton>
        </form>
      </div>

      {open ? (
        <div className="mt-2 space-y-2">
          <p className="whitespace-pre-wrap rounded-[var(--radius)] border border-border bg-muted/10 p-2 text-xs text-muted">
            {message}
          </p>
          <ul className="space-y-1">
            {recipients.map((r) => (
              <li key={r.registrationId} className="flex items-center justify-between gap-2">
                <span>{r.name}</span>
                <span className="flex items-center gap-2">
                  {r.waLink ? (
                    <a href={r.waLink} target="_blank" rel="noopener noreferrer" className="underline">
                      WhatsApp
                    </a>
                  ) : (
                    <span className="text-muted">No number</span>
                  )}
                  {r.sent ? (
                    <form action={unmarkSentAction.bind(null, r.registrationId)}>
                      <SubmitButton className="underline">Sent ✓ (undo)</SubmitButton>
                    </form>
                  ) : (
                    <form action={markSentAction.bind(null, r.registrationId)}>
                      <SubmitButton className="rounded-[var(--radius)] border border-border px-2 py-0.5">
                        Mark sent
                      </SubmitButton>
                    </form>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
