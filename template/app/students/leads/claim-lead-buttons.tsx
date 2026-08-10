'use client';

import { useState, useTransition } from 'react';

interface LocationOption {
  id: string;
  name: string;
}

/**
 * "Claim for X" buttons on the Lead list, one click plus a confirmation
 * (decision #78) - a misclick (Aalay staff meaning to claim for Aalay but
 * hitting Sportsclub) used to be instant and easy to miss, same shape as the
 * "Mark as Joined" confirm modal already used on Inquiry.
 */
export function ClaimLeadButtons({
  studentName,
  locations,
  onClaim,
}: {
  studentName: string;
  locations: LocationOption[];
  onClaim: (locationId: string) => Promise<void>;
}) {
  const [confirming, setConfirming] = useState<LocationOption | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {locations.map((l) => (
          <button
            key={l.id}
            type="button"
            disabled={pending}
            onClick={() => setConfirming(l)}
            className="rounded-[var(--radius)] border border-border px-2 py-1 text-xs font-medium disabled:opacity-50"
          >
            Claim for {l.name}
          </button>
        ))}
      </div>

      {confirming ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-[var(--radius)] border border-border bg-background p-4">
            <p className="text-sm">
              Claim <span className="font-semibold">{studentName}</span> for{' '}
              <span className="font-semibold">{confirming.name}</span>?
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
                  const locationId = confirming.id;
                  setConfirming(null);
                  startTransition(() => onClaim(locationId));
                }}
                className="rounded-[var(--radius)] bg-accent px-3 py-2 text-sm font-medium text-accent-foreground disabled:opacity-50"
              >
                Yes, claim
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
