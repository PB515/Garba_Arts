import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/app/app-shell';
import { EmptyState } from '@/lib/patterns/empty-state';
import { getStaffRole, isSuperAdmin } from '@/lib/roles';

export default async function FeesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Combined fee data across students — super-admin only. A location_admin
  // can still see one student's own fees on that student's own page; this
  // page is specifically the "combined" view the owner said should be
  // restricted.
  const staffRole = await getStaffRole();
  if (!isSuperAdmin(staffRole)) redirect('/dashboard');

  const [{ data: students }, { data: payments }] = await Promise.all([
    supabase.from('students').select('id, name, fee_total, demo_fee_amount, demo_fee_paid').is('deleted_at', null),
    supabase
      .from('payments')
      .select('id, student_id, amount, mode, paid_date, remarks')
      .is('deleted_at', null)
      .order('paid_date', { ascending: false }),
  ]);

  const studentName = new Map((students ?? []).map((s) => [s.id, s.name]));

  const totalExpected = (students ?? []).reduce((sum, s) => sum + (s.fee_total ?? 0), 0);
  const totalCollected = (payments ?? []).reduce((sum, p) => sum + p.amount, 0);
  const totalPending = totalExpected - totalCollected;

  const totalDemoExpected = (students ?? []).reduce((sum, s) => sum + (s.demo_fee_amount ?? 0), 0);
  const totalDemoCollected = (students ?? []).reduce((sum, s) => sum + s.demo_fee_paid, 0);

  const cards = [
    { label: 'Total fee expected', value: totalExpected.toFixed(2) },
    { label: 'Total collected', value: totalCollected.toFixed(2) },
    { label: 'Total pending', value: totalPending.toFixed(2) },
    { label: 'Demo fees expected', value: totalDemoExpected.toFixed(2) },
    { label: 'Demo fees collected', value: totalDemoCollected.toFixed(2) },
  ];

  return (
    <AppShell active="fees" userEmail={user?.email}>
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {cards.map((c) => (
            <div key={c.label} className="rounded-[var(--radius)] border border-border p-4">
              <p className="text-xs text-muted">{c.label}</p>
              <p className="mt-1 text-2xl font-semibold">{c.value}</p>
            </div>
          ))}
        </div>

        <section>
          <h2 className="mb-3 text-sm font-semibold">All payments</h2>
          {!payments?.length ? (
            <EmptyState title="No payments logged yet" message="Payments logged against any student show up here." />
          ) : (
            <div className="overflow-x-auto rounded-[var(--radius)] border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/10 text-left">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Student</th>
                    <th className="p-3">Mode</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-t border-border">
                      <td className="p-3">{p.paid_date}</td>
                      <td className="p-3">
                        <Link href={`/students/${p.student_id}`} className="underline">
                          {studentName.get(p.student_id) ?? '-'}
                        </Link>
                      </td>
                      <td className="p-3">{p.mode.toUpperCase()}</td>
                      <td className="p-3">{p.amount.toFixed(2)}</td>
                      <td className="p-3">{p.remarks ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
