'use client';
/**
 * The detail page's "Details" form, extracted into a client component for
 * two reasons: useActionState (inline errors instead of a page-crashing
 * throw, same fix as the two add-forms) and a hard lock + confirmation step
 * on marking someone Joined - the owner's explicit ask, mirroring the Inquiry
 * list's own quick-set. Fee total/Demo fee amount live in their own boxes
 * now (decision #67), not this form, so the batch check reads this form's
 * submission but the fee check reads the student's currently-stored value
 * (passed in as a prop) instead - same end result, just sourced from
 * wherever each field actually lives now.
 */
import { useActionState, useRef, useState } from 'react';
import { updateStudent } from './actions';
import { STATUS_OPTIONS, statusLabel } from '@/lib/status';
import { LocationBatchSelect } from './location-batch-select';
import { SourceField } from './source-field';
import { SubmitButton } from '@/lib/patterns/submit-button';

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
    gender: string | null;
    residential_area: string | null;
    status: string | null;
    location_id: string | null;
    batch_id: string | null;
    inquiry_date: string | null;
    fee_total: number | null;
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
      if (!fd.get('batch_id') || student.fee_total === null) {
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
          <label className="text-sm">
            Gender
            <select name="gender" defaultValue={student.gender ?? ''} className={FIELD_CLASS}>
              <option value="">-</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </label>
          <label className="text-sm">
            Residential area
            <input name="residential_area" defaultValue={student.residential_area ?? ''} className={FIELD_CLASS} />
          </label>
          <div className="col-span-2 text-sm">
            Source
            <div className="mt-1 grid grid-cols-2 gap-3">
              <SourceField
                variant={student.location_id ? 'inquiry' : 'lead'}
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
