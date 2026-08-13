'use client';

import { useEffect, useState } from 'react';

const DEFAULT_MAX_ATTENDEES = 20;

interface AttendeeRow {
  name: string;
  phone: string;
  whatsapp: string;
}

/**
 * "How many additional people are coming?" - a number input that drives how
 * many name+phone+WhatsApp row-triples render. Replaces the old one-name-
 * per-line textarea, which couldn't capture phone/WhatsApp per attendee -
 * the owner's own words: "5 is written then 5 rows will come... name and
 * whatsapp number all we need to collect current is too complex."
 * Only Name is required per row; Phone/WhatsApp stay optional, matching the
 * registrant's own phone field. Capped at maxAttendees (default 20, admin
 * forms) so a typo like "500" can't generate hundreds of rows - the public
 * poster form passes 10 instead (decision #85/pending-feedback.md item #7).
 */
export function AttendeeRows({
  fieldClass,
  initialAttendees = [],
  maxAttendees = DEFAULT_MAX_ATTENDEES,
  onCountChange,
}: {
  fieldClass: string;
  initialAttendees?: AttendeeRow[];
  maxAttendees?: number;
  /** Optional - lets a parent (e.g. the fee-per-person auto-calc, decision #86) track headcount without owning the rows itself. Omitting it changes nothing about this component's own behavior. */
  onCountChange?: (count: number) => void;
}) {
  const [rows, setRows] = useState<AttendeeRow[]>(initialAttendees);

  // Reports the starting count once too (not just on every change below), so
  // a parent tracking headcount (e.g. the fee auto-calc) is correct from the
  // first render even when initialAttendees is pre-filled (an edit form).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    onCountChange?.(initialAttendees.length);
  }, []);

  function setCount(next: number) {
    const clamped = Math.max(0, Math.min(maxAttendees, Math.floor(next) || 0));
    setRows((prev) => {
      if (clamped === prev.length) return prev;
      onCountChange?.(clamped);
      if (clamped < prev.length) return prev.slice(0, clamped);
      return [
        ...prev,
        ...Array.from({ length: clamped - prev.length }, () => ({ name: '', phone: '', whatsapp: '' })),
      ];
    });
  }

  function updateRow(index: number, field: keyof AttendeeRow, value: string) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  }

  return (
    <div className="col-span-2 space-y-2 sm:col-span-4">
      <label className="block text-sm">
        How many additional people are coming?
        <input
          type="number"
          min="0"
          max={maxAttendees}
          value={rows.length}
          onChange={(e) => setCount(Number(e.target.value))}
          className={`mt-1 w-32 ${fieldClass}`}
        />
      </label>
      <input type="hidden" name="attendee_count" value={rows.length} />

      {rows.length > 0 ? (
        <div className="space-y-2">
          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <input
                name={`attendee_name_${i}`}
                placeholder="Name"
                value={row.name}
                onChange={(e) => updateRow(i, 'name', e.target.value)}
                className={fieldClass}
              />
              <input
                name={`attendee_phone_${i}`}
                placeholder="Phone (optional)"
                value={row.phone}
                onChange={(e) => updateRow(i, 'phone', e.target.value)}
                className={fieldClass}
              />
              <input
                name={`attendee_whatsapp_${i}`}
                placeholder="WhatsApp (optional)"
                value={row.whatsapp}
                onChange={(e) => updateRow(i, 'whatsapp', e.target.value)}
                className={fieldClass}
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
