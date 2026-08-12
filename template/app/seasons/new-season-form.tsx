'use client';
/**
 * Starting a new season - label/dates, plus a dynamic list of batch rows
 * (same "number-driven dynamic rows" pattern as event attendees). Rows are
 * pre-filled from the current season's batches per location - "prefilled
 * but option to change" was the owner's explicit ask, not a fresh blank
 * form every time and not forced carryover either.
 */
import { useActionState, useState } from 'react';
import { startNewSeason } from './actions';
import { SubmitButton } from '@/lib/patterns/submit-button';

const FIELD_CLASS = 'rounded-[var(--radius)] border border-border px-3 py-2 text-sm';

interface Loc {
  id: string;
  name: string;
}
interface BatchRow {
  name: string;
  location_id: string;
}

export function NewSeasonForm({ locations, prefillBatches }: { locations: Loc[]; prefillBatches: BatchRow[] }) {
  const [state, formAction] = useActionState(startNewSeason, null);
  const [rows, setRows] = useState<BatchRow[]>(
    prefillBatches.length ? prefillBatches : [{ name: '', location_id: locations[0]?.id ?? '' }],
  );

  function updateRow(i: number, field: keyof BatchRow, value: string) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  }
  function addRow() {
    setRows((prev) => [...prev, { name: '', location_id: locations[0]?.id ?? '' }]);
  }
  function removeRow(i: number) {
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  }

  return (
    <form action={formAction} className="space-y-4">
      {state?.error ? (
        <p className="rounded-[var(--radius)] border border-red-600/30 bg-red-600/10 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      ) : null}

      <div className="grid grid-cols-3 gap-3">
        <label className="text-sm">
          Season label
          <input name="label" required placeholder="e.g. TGA-2027" className={`mt-1 w-full ${FIELD_CLASS}`} />
        </label>
        <label className="text-sm">
          Start date
          <input name="start_date" type="date" className={`mt-1 w-full ${FIELD_CLASS}`} />
        </label>
        <label className="text-sm">
          End date
          <input name="end_date" type="date" className={`mt-1 w-full ${FIELD_CLASS}`} />
        </label>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Batches</h3>
        <input type="hidden" name="batch_count" value={rows.length} />
        <div className="space-y-2">
          {rows.map((row, i) => (
            <div key={i} className="flex gap-2">
              <select
                name={`batch_location_${i}`}
                value={row.location_id}
                onChange={(e) => updateRow(i, 'location_id', e.target.value)}
                className={FIELD_CLASS}
              >
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
              <input
                name={`batch_name_${i}`}
                value={row.name}
                onChange={(e) => updateRow(i, 'name', e.target.value)}
                placeholder="Batch name, e.g. 8-9 PM"
                className={`flex-1 ${FIELD_CLASS}`}
              />
              <button
                type="button"
                onClick={() => removeRow(i)}
                className="rounded-[var(--radius)] border border-border px-3 py-2 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addRow}
          className="mt-2 rounded-[var(--radius)] border border-border px-3 py-2 text-sm"
        >
          Add batch
        </button>
      </div>

      <SubmitButton className="rounded-[var(--radius)] bg-accent px-3 py-2 text-sm font-medium text-accent-foreground disabled:opacity-60">
        Start new season
      </SubmitButton>
    </form>
  );
}
