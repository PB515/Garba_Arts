'use client';

import { useState, useTransition } from 'react';

interface StatusOption {
  value: string;
  label: string;
  color: string;
  action: () => Promise<void>;
}

/**
 * The Inquiry list's per-row colored status buttons. Marking someone
 * "Joined" is a one-way, easy-to-miss moment (their record starts showing
 * up on the Joined tab too), so that one option asks for confirmation
 * first - the owner's explicit ask, after noticing there was no visible
 * "this is happening now" moment. The other statuses stay instant, same
 * as before.
 */
export function StatusQuickSet({ studentName, options }: { studentName: string; options: StatusOption[] }) {
  const [confirming, setConfirming] = useState<StatusOption | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <div className="flex gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            title={opt.label}
            onClick={() => {
              if (opt.value === 'joined') {
                setConfirming(opt);
              } else {
                startTransition(opt.action);
              }
            }}
            className="size-5 rounded-full border border-border"
            style={{ backgroundColor: opt.color }}
          />
        ))}
      </div>

      {confirming ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-[var(--radius)] border border-border bg-background p-4">
            <p className="text-sm">
              Mark <span className="font-semibold">{studentName}</span> as Joined? They&apos;ll move to the Joined
              tab.
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirming(null)}
                className="rounded-[var(--radius)] border border-border px-3 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  const action = confirming.action;
                  setConfirming(null);
                  startTransition(action);
                }}
                className="rounded-[var(--radius)] bg-accent px-3 py-2 text-sm font-medium text-accent-foreground disabled:opacity-50"
              >
                Yes, mark as Joined
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
