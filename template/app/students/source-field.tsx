'use client';

import { useState } from 'react';

/**
 * Source dropdown + a "Referred by" name field that only appears when
 * source = referral. Owner feedback: when a lead comes from a referral,
 * capture who referred them, not just the fact that it was a referral.
 */
export function SourceField({
  defaultSource = '',
  defaultReferredBy = '',
  className,
}: {
  defaultSource?: string;
  defaultReferredBy?: string;
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
      {source === 'referral' ? (
        <input
          name="referred_by"
          placeholder="Referred by (name)"
          defaultValue={defaultReferredBy}
          className={className}
        />
      ) : null}
    </>
  );
}
