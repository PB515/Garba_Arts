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
 *
 * `joinedBlockedReason` is a hard lock, not just a warning: the owner's
 * stated assumption is "if joined, then it's already complete" - nothing
 * on the Joined tab itself checks batch/fee anymore, so this is the one
 * place that has to actually enforce it. When set, clicking Joined shows
 * why it can't happen yet instead of the normal confirm dialog - there's no
 * path to proceed anyway from here, since the missing fields aren't
 * editable inline.
 */
export function StatusQuickSet({
  studentName,
  options,
  joinedBlockedReason,
}: {
  studentName: string;
  options: StatusOption[];
  joinedBlockedReason?: string;
}) {
  const [confirming, setConfirming] = useState<StatusOption | null>(null);
  const [blocked, setBlocked] = useState(false);
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
                if (joinedBlockedReason) {
                  setBlocked(true);
                } else {
                  setConfirming(opt);
                }
              } else {
                startTransition(opt.action);
              }
            }}
            className="size-5 rounded-full border border-border"
            style={{ backgroundColor: opt.color }}
          />
        ))}
      </div>

      {blocked ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-[var(--radius)] border border-border bg-background p-4">
            <p className="text-sm">
              Can&apos;t mark <span className="font-semibold">{studentName}</span> as Joined yet: {joinedBlockedReason}
            </p>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setBlocked(false)}
                className="rounded-[var(--radius)] border border-border px-3 py-2 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

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
