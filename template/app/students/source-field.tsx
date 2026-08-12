'use client';

import { useState } from 'react';

const LEAD_OPTIONS: [string, string][] = [
  ['society', 'Society'],
  ['corporate', 'Corporate'],
  ['navrangpura', 'Navrangpura'],
  ['aalay', 'Aalay'],
];

const INQUIRY_OPTIONS: [string, string][] = [
  ['whatsapp', 'WhatsApp'],
  ['instagram', 'Instagram'],
  ['referral', 'Referral'],
  ['walk-in', 'Walk-in'],
];

/**
 * Source dropdown + an optional detail field. Originally one shared list for
 * both Lead and Inquiry; split per-context (decision #80) since the two
 * stages track genuinely different things - Lead is "where did this call
 * come from" (Society/Corporate/Navrangpura/Aalay), Inquiry is "which
 * channel" (WhatsApp/Instagram/Referral/Walk-in). `variant` picks which list
 * renders; the detail field stays generic either way (the owner's earlier
 * ask - one field, not a different one per source, so any of them can carry
 * extra context).
 */
export function SourceField({
  variant,
  defaultSource = '',
  defaultSourceDetail = '',
  className,
}: {
  variant: 'lead' | 'inquiry';
  defaultSource?: string;
  defaultSourceDetail?: string;
  className?: string;
}) {
  const [source, setSource] = useState(defaultSource);
  const options = variant === 'lead' ? LEAD_OPTIONS : INQUIRY_OPTIONS;
  // A record's stored value might not be in this variant's list (e.g. it was
  // set under the other variant, or it's an old placeholder value) - render
  // it anyway rather than silently dropping it from view.
  const knownValues = new Set(options.map(([value]) => value));
  knownValues.add('other');

  return (
    <>
      <select name="source" value={source} onChange={(e) => setSource(e.target.value)} className={className}>
        <option value="">Source</option>
        {options.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
        {defaultSource && !knownValues.has(defaultSource) ? (
          <option value={defaultSource}>{defaultSource}</option>
        ) : null}
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
