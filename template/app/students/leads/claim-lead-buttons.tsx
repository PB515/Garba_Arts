'use client';

import { useTransition } from 'react';

interface LocationOption {
  id: string;
  name: string;
}

/**
 * One-click "Claim for X" buttons on the Lead list — deliberately no
 * confirmation step, unlike marking someone Joined. Claiming is easy to
 * undo (just re-editing the student's location), so speed wins here; the
 * owner's whole reason for this button existing is that staff are often on
 * the phone and need this to be as fast as possible.
 */
export function ClaimLeadButtons({
  locations,
  onClaim,
}: {
  locations: LocationOption[];
  onClaim: (locationId: string) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      {locations.map((l) => (
        <button
          key={l.id}
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => onClaim(l.id))}
          className="rounded-[var(--radius)] border border-border px-2 py-1 text-xs font-medium disabled:opacity-50"
        >
          Claim for {l.name}
        </button>
      ))}
    </div>
  );
}
