import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/app/app-shell';
import {
  archiveStudent,
  restoreStudent,
  permanentlyDeleteStudent,
  addPayment,
  archivePayment,
  permanentlyDeletePayment,
} from '../actions';
import { StudentEditForm } from '../student-edit-form';
import { PaymentModeFields } from '../payment-mode-fields';
import { getStaffRole, isSuperAdmin } from '@/lib/roles';
import { paymentModeLabel } from '@/lib/fee-status';

const BACK_TARGETS = {
  leads: { href: '/students/leads', active: 'leads' as const, label: 'Back to leads' },
  inquiry: { href: '/students', active: 'inquiry' as const, label: 'Back to inquiry' },
  joined: { href: '/students/joined', active: 'joined' as const, label: 'Back to joined' },
};

export default async function StudentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const { from } = await searchParams;
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

  // Fall back to inferring from the record itself (a leadless location means
  // it can only have come from the Leads tab) when `from` is missing or
  // unrecognized - e.g. a direct/bookmarked URL, same as the old behavior.
  const inferredKey = !student.location_id ? 'leads' : student.status === 'joined' ? 'joined' : 'inquiry';
  const backTarget = BACK_TARGETS[from as keyof typeof BACK_TARGETS] ?? BACK_TARGETS[inferredKey];

  const superAdmin = isSuperAdmin(staffRole);
  const locations = superAdmin
    ? (allLocations ?? [])
    : (allLocations ?? []).filter((l) => l.id === staffRole?.locationId);

  const boundAddPayment = addPayment.bind(null, id);
  const boundArchive = archiveStudent.bind(null, id);
  const boundRestore = restoreStudent.bind(null, id);
  const boundPermanentDelete = permanentlyDeleteStudent.bind(null, id);

  const totalPaid = (payments ?? []).reduce((sum, p) => sum + p.amount, 0);
  const balance = student.fee_total !== null ? student.fee_total - totalPaid : null;

  return (
    <AppShell active={backTarget.active} userEmail={user?.email}>
      <div className="mb-4">
        <Link href={backTarget.href} className="text-sm underline">
          ← {backTarget.label}
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
          <StudentEditForm studentId={id} student={student} locations={locations ?? []} batches={batches ?? []} />

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
              <PaymentModeFields className="rounded-[var(--radius)] border border-border px-3 py-2 text-sm" />
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
