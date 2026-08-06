'use client';
/**
 * The detail page's "Details" form, extracted into a client component for
 * two reasons: useActionState (inline errors instead of a page-crashing
 * throw, same fix as the two add-forms) and a hard lock + confirmation step
 * on marking someone Joined - the owner's explicit ask, mirroring the Inquiry
 * list's own quick-set. Since this form can set batch/fee AND status in the
 * same save, the check reads the form's *submitted* values, not the
 * student's stored ones - unlike the quick-set, which only ever changes
 * status and so has to check what's already saved.
 */
import { useActionState, useRef, useState } from 'react';
import { updateStudent } from './actions';
import { STATUS_OPTIONS, statusLabel } from '@/lib/status';
import { LocationBatchSelect } from './location-batch-select';
import { SourceField } from './source-field';
import { SubmitButton } from './submit-button';

const FIELD_CLASS = 'mt-1 w-full rounded-[var(--radius)] border border-border px-3 py-2 text-sm';

interface Loc {
  id: string;
  name: string;
}
interface Batch {
  id: string;
  name: string;
  location_id: string;
}

export function StudentEditForm({
  studentId,
  student,
  locations,
  batches,
}: {
  studentId: string;
  student: {
    name: string;
    phone_number: string;
    whatsapp_number: string | null;
    source: string | null;
    source_detail: string | null;
    status: string | null;
    location_id: string | null;
    batch_id: string | null;
    inquiry_date: string | null;
    fee_total: number | null;
    demo_fee_amount: number | null;
    demo_fee_paid: number;
    remarks: string | null;
  };
  locations: Loc[];
  batches: Batch[];
}) {
  const [state, formAction] = useActionState(updateStudent.bind(null, studentId), null);
  const formRef = useRef<HTMLFormElement>(null);
  const skipInterceptRef = useRef(false);
  const [confirming, setConfirming] = useState(false);
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (skipInterceptRef.current) {
      skipInterceptRef.current = false;
      return;
    }
    const alreadyJoined = student.status === 'joined';
    const fd = new FormData(e.currentTarget);
    if (fd.get('status') === 'joined' && !alreadyJoined) {
      if (!fd.get('batch_id') || !fd.get('fee_total')) {
        e.preventDefault();
        setBlockedMessage('Add a batch and a fee amount before marking as Joined.');
        return;
      }
      e.preventDefault();
      setConfirming(true);
    }
  }

  function confirmAndSubmit() {
    setConfirming(false);
    skipInterceptRef.current = true;
    formRef.current?.requestSubmit();
  }

  return (
    <>
      <form ref={formRef} action={formAction} onSubmit={handleSubmit} className="space-y-3">
        {state?.error ? (
          <p className="rounded-[var(--radius)] border border-red-600/30 bg-red-600/10 px-3 py-2 text-sm text-red-600">
            {state.error}
          </p>
        ) : null}
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            Full Name
            <input name="name" defaultValue={student.name} required className={FIELD_CLASS} />
          </label>
          <label className="text-sm">
            Phone
            <input name="phone_number" defaultValue={student.phone_number} required className={FIELD_CLASS} />
          </label>
          <label className="text-sm">
            WhatsApp (if different)
            <input name="whatsapp_number" defaultValue={student.whatsapp_number ?? ''} className={FIELD_CLASS} />
          </label>
          <div className="col-span-2 text-sm">
            Source
            <div className="mt-1 grid grid-cols-2 gap-3">
              <SourceField
                defaultSource={student.source ?? ''}
                defaultSourceDetail={student.source_detail ?? ''}
                className="w-full rounded-[var(--radius)] border border-border px-3 py-2 text-sm"
              />
            </div>
          </div>
          <label className="text-sm">
            Status
            <select name="status" defaultValue={student.status ?? ''} className={FIELD_CLASS}>
              <option value="">-</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {statusLabel(s)}
                </option>
              ))}
            </select>
          </label>
          <div className="col-span-2 text-sm">
            Location / Batch
            <div className="mt-1 grid grid-cols-2 gap-3">
              <LocationBatchSelect
                locations={locations}
                batches={batches}
                locationField="location_id"
                batchField="batch_id"
                defaultLocationId={student.location_id ?? ''}
                defaultBatchId={student.batch_id ?? ''}
                className="w-full rounded-[var(--radius)] border border-border px-3 py-2 text-sm"
              />
            </div>
          </div>
          <label className="text-sm">
            Inquiry date (when this lead came in)
            <input name="inquiry_date" type="date" defaultValue={student.inquiry_date ?? ''} className={FIELD_CLASS} />
          </label>
          <label className="text-sm">
            Fee total
            <input
              name="fee_total"
              type="number"
              step="0.01"
              min="0"
              defaultValue={student.fee_total ?? ''}
              className={FIELD_CLASS}
            />
          </label>
          <label className="text-sm">
            Demo fee amount
            <input
              name="demo_fee_amount"
              type="number"
              step="0.01"
              min="0"
              defaultValue={student.demo_fee_amount ?? ''}
              className={FIELD_CLASS}
            />
          </label>
          <label className="text-sm">
            Demo fee paid
            <input
              name="demo_fee_paid"
              type="number"
              step="0.01"
              min="0"
              defaultValue={student.demo_fee_paid ?? 0}
              className={FIELD_CLASS}
            />
          </label>
        </div>
        <label className="block text-sm">
          Remarks
          <textarea name="remarks" defaultValue={student.remarks ?? ''} rows={3} className={FIELD_CLASS} />
        </label>
        <SubmitButton className="rounded-[var(--radius)] bg-accent px-3 py-2 text-sm font-medium text-accent-foreground disabled:opacity-60">
          Save
        </SubmitButton>
      </form>

      {blockedMessage ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-[var(--radius)] border border-border bg-background p-4">
            <p className="text-sm">Can&apos;t mark as Joined yet: {blockedMessage}</p>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setBlockedMessage(null)}
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
              Save and mark <span className="font-semibold">{student.name}</span> as Joined? They&apos;ll move to
              the Joined tab.
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
                onClick={confirmAndSubmit}
                className="rounded-[var(--radius)] bg-accent px-3 py-2 text-sm font-medium text-accent-foreground"
              >
                Yes, save and mark as Joined
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
