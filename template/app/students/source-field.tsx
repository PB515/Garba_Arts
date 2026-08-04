'use client';

import { useState } from 'react';

/**
 * Source dropdown + an optional detail field. Originally only appeared for
 * source = referral ("who referred them"); the owner asked for the same
 * mechanic on every source so any of them can carry extra context (which
 * Instagram post, which WhatsApp group, who spoke to them at a walk-in,
 * etc.) — one generic field, not a different one per source.
 */
export function SourceField({
  defaultSource = '',
  defaultSourceDetail = '',
  className,
}: {
  defaultSource?: string;
  defaultSourceDetail?: string;
  className?: string;
}) {
  const [source, setSource] = useState(defaultSource);

  return (
    <>
      <select name="source" value={source} onChange={(e) => setSource(e.target.value)} className={className}>
        <option value="">Source</option>
        <option value="whatsapp">WhatsApp</option>
        <option value="instagram">Instagram</option>
        <option value="referral">Referral</option>
        <option value="walk-in">Walk-in</option>
        <option value="society">Society</option>
        <option value="corporate">Corporate</option>
        {/* Placeholder: owner said 4 more categories exist but hasn't given
            the real list yet. Loudly marked so these never get mistaken for
            confirmed values; swap in the real ones, don't just relabel these. */}
        <option value="placeholder-1">[Placeholder source 1, TBD]</option>
        <option value="placeholder-2">[Placeholder source 2, TBD]</option>
        <option value="placeholder-3">[Placeholder source 3, TBD]</option>
        <option value="placeholder-4">[Placeholder source 4, TBD]</option>
        <option value="other">Other</option>
      </select>
      {source ? (
        <input
          name="source_detail"
          placeholder="Source detail (optional)"
          defaultValue={defaultSourceDetail}
          className={className}
        />
      ) : null}
    </>
  );
}
