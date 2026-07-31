import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/app/app-shell';
import { STATUS_OPTIONS, statusLabel } from '@/lib/status';
import {
  updateStudent,
  archiveStudent,
  restoreStudent,
  permanentlyDeleteStudent,
  addPayment,
  archivePayment,
  permanentlyDeletePayment,
} from '../actions';
import { LocationBatchSelect } from '../location-batch-select';
import { SourceField } from '../source-field';
import { getStaffRole, isSuperAdmin } from '@/lib/roles';
import { paymentModeLabel } from '@/lib/fee-status';

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: student, error }, { data: allLocations }, { data: batches }, { data: payments }, staffRole] =
    await Promise.all([
      supabase.from('students').select('*').eq('id', id).single(),
      supabase.from('locations').select('id, name').order('name'),
      supabase.from('batches').select('id, name, location_id').order('name'),
      supabase
        .from('payments')
        .select('*')
        .eq('student_id', id)
        .is('deleted_at', null)
        .order('paid_date', { ascending: false }),
      getStaffRole(),
    ]);

  if (error || !student) notFound();

  const superAdmin = isSuperAdmin(staffRole);
  const locations = superAdmin
    ? (allLocations ?? [])
    : (allLocations ?? []).filter((l) => l.id === staffRole?.locationId);

  const boundUpdate = updateStudent.bind(null, id);
  const boundAddPayment = addPayment.bind(null, id);
  const boundArchive = archiveStudent.bind(null, id);
  const boundRestore = restoreStudent.bind(null, id);
  const boundPermanentDelete = permanentlyDeleteStudent.bind(null, id);

  const totalPaid = (payments ?? []).reduce((sum, p) => sum + p.amount, 0);
  const balance = student.fee_total !== null ? student.fee_total - totalPaid : null;

  return (
    <AppShell active={student.status === 'joined' ? 'joined' : 'inquiry'} userEmail={user?.email}>
      <div className="mb-4">
        <Link href="/students" className="text-sm underline">
          ← Back to students
        </Link>
      </div>

      {student.deleted_at ? (
        <div className="mb-4 flex items-center justify-between rounded-[var(--radius)] border border-border bg-muted/10 p-3 text-sm">
          <span>This record is archived.</span>
          <form action={boundRestore}>
            <button type="submit" className="underline">
              Restore
            </button>
          </form>
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="space-y-3 rounded-[var(--radius)] border border-border p-4">
          <h2 className="text-sm font-semibold">Details</h2>
          <form action={boundUpdate} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">
                Name
                <input name="name" defaultValue={student.name} required className="mt-1 w-full rounded-[var(--radius)] border border-border px-3 py-2 text-sm" />
              </label>
              <label className="text-sm">
                Phone
                <input name="phone_number" defaultValue={student.phone_number} required className="mt-1 w-full rounded-[var(--radius)] border border-border px-3 py-2 text-sm" />
              </label>
              <label className="text-sm">
                WhatsApp (if different)
                <input name="whatsapp_number" defaultValue={student.whatsapp_number ?? ''} className="mt-1 w-full rounded-[var(--radius)] border border-border px-3 py-2 text-sm" />
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
                <select name="status" defaultValue={student.status ?? ''} className="mt-1 w-full rounded-[var(--radius)] border border-border px-3 py-2 text-sm">
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
                    locations={locations ?? []}
                    batches={batches ?? []}
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
                <input name="inquiry_date" type="date" defaultValue={student.inquiry_date ?? ''} className="mt-1 w-full rounded-[var(--radius)] border border-border px-3 py-2 text-sm" />
              </label>
              <label className="text-sm">
                Fee total
                <input name="fee_total" type="number" step="0.01" defaultValue={student.fee_total ?? ''} className="mt-1 w-full rounded-[var(--radius)] border border-border px-3 py-2 text-sm" />
              </label>
              <label className="text-sm">
                Demo fee amount
                <input name="demo_fee_amount" type="number" step="0.01" defaultValue={student.demo_fee_amount ?? ''} className="mt-1 w-full rounded-[var(--radius)] border border-border px-3 py-2 text-sm" />
              </label>
              <label className="text-sm">
                Demo fee paid
                <input name="demo_fee_paid" type="number" step="0.01" defaultValue={student.demo_fee_paid ?? 0} className="mt-1 w-full rounded-[var(--radius)] border border-border px-3 py-2 text-sm" />
              </label>
            </div>
            <label className="block text-sm">
              Remarks
              <textarea name="remarks" defaultValue={student.remarks ?? ''} rows={3} className="mt-1 w-full rounded-[var(--radius)] border border-border px-3 py-2 text-sm" />
            </label>
            <button type="submit" className="rounded-[var(--radius)] bg-accent px-3 py-2 text-sm font-medium text-accent-foreground">
              Save
            </button>
          </form>

          <div className="flex gap-4 border-t border-border pt-3 text-sm">
            {!student.deleted_at ? (
              <form action={boundArchive}>
                <button type="submit" className="underline">
                  Archive
                </button>
              </form>
            ) : null}
            <form action={boundPermanentDelete}>
              <button type="submit" className="text-red-600 underline">
                Permanently remove
              </button>
            </form>
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-[var(--radius)] border border-border p-4">
            <h2 className="mb-2 text-sm font-semibold">Fees</h2>
            <dl className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <dt className="text-muted">Fee total</dt>
                <dd>{student.fee_total !== null ? student.fee_total.toFixed(2) : '-'}</dd>
              </div>
              <div>
                <dt className="text-muted">Paid</dt>
                <dd>{totalPaid.toFixed(2)}</dd>
              </div>
              <div>
                <dt className="text-muted">Balance</dt>
                <dd className="font-semibold">{balance !== null ? balance.toFixed(2) : '-'}</dd>
              </div>
            </dl>

            <form action={boundAddPayment} className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 sm:grid-cols-4">
              <input name="amount" type="number" step="0.01" placeholder="Amount" required className="rounded-[var(--radius)] border border-border px-3 py-2 text-sm" />
              <select name="mode" defaultValue="cash" required className="rounded-[var(--radius)] border border-border px-3 py-2 text-sm">
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="cash_upi">Cash + UPI (split)</option>
              </select>
              <input name="paid_date" type="date" required className="rounded-[var(--radius)] border border-border px-3 py-2 text-sm" />
              <input name="remarks" placeholder="Remarks" className="rounded-[var(--radius)] border border-border px-3 py-2 text-sm" />
              <button type="submit" className="col-span-2 rounded-[var(--radius)] bg-accent px-3 py-2 text-sm font-medium text-accent-foreground sm:col-span-4">
                Log payment
              </button>
            </form>
          </div>

          <div className="rounded-[var(--radius)] border border-border p-4">
            <h2 className="mb-2 text-sm font-semibold">Payment history</h2>
            {!payments?.length ? (
              <p className="text-sm text-muted">No payments logged yet.</p>
            ) : (
              <ul className="divide-y divide-border text-sm">
                {payments.map((p) => (
                  <li key={p.id} className="flex items-center justify-between py-2">
                    <span>
                      {p.paid_date} · {paymentModeLabel(p.mode)} · {p.amount.toFixed(2)}
                      {p.remarks ? ` · ${p.remarks}` : ''}
                    </span>
                    <span className="flex gap-3">
                      <form action={archivePayment.bind(null, p.id, id)}>
                        <button type="submit" className="underline">
                          Archive
                        </button>
                      </form>
                      <form action={permanentlyDeletePayment.bind(null, p.id, id)}>
                        <button type="submit" className="text-red-600 underline">
                          Remove
                        </button>
                      </form>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
