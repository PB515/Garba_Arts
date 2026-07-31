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
