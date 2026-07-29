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

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: student, error }, { data: locations }, { data: batches }, { data: payments }] =
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
    ]);

  if (error || !student) notFound();

  const boundUpdate = updateStudent.bind(null, id);
  const boundAddPayment = addPayment.bind(null, id);
  const boundArchive = archiveStudent.bind(null, id);
  const boundRestore = restoreStudent.bind(null, id);
  const boundPermanentDelete = permanentlyDeleteStudent.bind(null, id);

  const totalPaid = (payments ?? []).reduce((sum, p) => sum + p.amount, 0);
  const balance = student.fee_total !== null ? student.fee_total - totalPaid : null;

  return (
    <AppShell active="students" userEmail={user?.email}>
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
                Source
                <select name="source" defaultValue={student.source ?? ''} className="mt-1 w-full rounded-[var(--radius)] border border-border px-3 py-2 text-sm">
                  <option value="">-</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="instagram">Instagram</option>
                  <option value="referral">Referral</option>
                  <option value="walk-in">Walk-in</option>
                  <option value="other">Other</option>
                </select>
              </label>
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
              <label className="text-sm">
                Location
                <select name="location_id" defaultValue={student.location_id ?? ''} className="mt-1 w-full rounded-[var(--radius)] border border-border px-3 py-2 text-sm">
                  <option value="">-</option>
                  {(locations ?? []).map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Batch
                <select name="batch_id" defaultValue={student.batch_id ?? ''} className="mt-1 w-full rounded-[var(--radius)] border border-border px-3 py-2 text-sm">
                  <option value="">-</option>
                  {(batches ?? []).map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Starting date
                <input name="starting_date" type="date" defaultValue={student.starting_date ?? ''} className="mt-1 w-full rounded-[var(--radius)] border border-border px-3 py-2 text-sm" />
              </label>
              <label className="text-sm">
                Fee total
                <input name="fee_total" type="number" step="0.01" defaultValue={student.fee_total ?? ''} className="mt-1 w-full rounded-[var(--radius)] border border-border px-3 py-2 text-sm" />
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
                      {p.paid_date} · {p.mode.toUpperCase()} · {p.amount.toFixed(2)}
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
