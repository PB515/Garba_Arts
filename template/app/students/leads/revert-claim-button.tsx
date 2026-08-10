'use client';

import { useState, useTransition } from 'react';

/**
 * Undoes a mistaken claim (decision #78) - shown next to a claimed lead's
 * location name. Confirmed first, same modal pattern as ClaimLeadButtons and
 * the Inquiry "Mark as Joined" flow, since this is also an easy-to-regret
 * one-click action.
 */
export function RevertClaimButton({
  studentName,
  locationName,
  onRevert,
}: {
  studentName: string;
  locationName: string;
  onRevert: () => Promise<void>;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() => setConfirming(true)}
        className="text-xs underline disabled:opacity-50"
      >
        Revert
      </button>

      {confirming ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-[var(--radius)] border border-border bg-background p-4">
            <p className="text-sm">
              Revert <span className="font-semibold">{studentName}</span>&apos;s claim for{' '}
              <span className="font-semibold">{locationName}</span>? They&apos;ll go back to the unclaimed pool.
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="rounded-[var(--radius)] border border-border px-3 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  setConfirming(false);
                  startTransition(onRevert);
                }}
                className="rounded-[var(--radius)] bg-accent px-3 py-2 text-sm font-medium text-accent-foreground disabled:opacity-50"
              >
                Yes, revert
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
