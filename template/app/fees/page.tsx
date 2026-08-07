import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/app/app-shell';
import { EmptyState } from '@/lib/patterns/empty-state';
import { getStaffRole, isSuperAdmin } from '@/lib/roles';
import { getCurrentSeason } from '@/lib/seasons';
import { paymentModeLabel } from '@/lib/fee-status';
import { LocationBatchSelect } from '@/app/students/location-batch-select';
import { buildQueryString } from '@/lib/form';

const FIELD_CLASS = 'rounded-[var(--radius)] border border-border px-3 py-2 text-sm';

export default async function FeesPage({
  searchParams,
}: {
  searchParams: Promise<{ location?: string; batch?: string; mode?: string; type?: string }>;
}) {
  const params = await searchParams;
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

  const season = await getCurrentSeason(supabase);

  const [{ data: students }, { data: allPayments }, { data: locations }, { data: batches }] = await Promise.all([
    supabase
      .from('students')
      .select('id, name, location_id, batch_id, fee_total, demo_fee_amount')
      .is('deleted_at', null)
      .eq('season_id', season?.id ?? ''),
    supabase
      .from('payments')
      .select('id, student_id, amount, mode, cash_amount, upi_amount, paid_date, payment_type, remarks')
      .is('deleted_at', null)
      .order('paid_date', { ascending: false }),
    supabase.from('locations').select('id, name').order('name'),
    supabase.from('batches').select('id, name, location_id').eq('season_id', season?.id ?? '').order('name'),
  ]);

  const studentById = new Map((students ?? []).map((s) => [s.id, s]));
  // Payments don't carry season_id themselves - a payment belongs to
  // whatever season its student belongs to, so this is how the whole tab
  // stays scoped to the current season without denormalizing the column.
  const payments = (allPayments ?? []).filter((p) => studentById.has(p.student_id));
  const locationName = new Map((locations ?? []).map((l) => [l.id, l.name]));
  const batchName = new Map((batches ?? []).map((b) => [b.id, b.name]));

  // --- Fixed breakdown report — always the full picture, unaffected by the
  // filters below (which only narrow the payment log). "So can see what
  // type of payment come" was the ask: every slice at a glance, not one
  // slice at a time.
  //
  // Total fee expected/collected/pending is the real *course* fee -
  // 'main'-tagged payments only. Demo fees expected/collected is now
  // derived from real logged 'demo' payments (decision #67), not a bare
  // typed-in number that never counted as real money. Total Cash/UPI and
  // "Collected by payment mode" below intentionally sum BOTH types - that's
  // the actual cash/UPI in hand, regardless of what it was for. This is the
  // specific gap the owner reported live: demo payments weren't showing up
  // in the real Cash/UPI totals at all. ---
  const mainPayments = (payments ?? []).filter((p) => p.payment_type === 'main');
  const demoPayments = (payments ?? []).filter((p) => p.payment_type === 'demo');
  const totalExpected = (students ?? []).reduce((sum, s) => sum + (s.fee_total ?? 0), 0);
  const totalCollected = mainPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalPending = totalExpected - totalCollected;
  const totalDemoExpected = (students ?? []).reduce((sum, s) => sum + (s.demo_fee_amount ?? 0), 0);
  const totalDemoCollected = demoPayments.reduce((sum, p) => sum + p.amount, 0);

  const byMode: Record<string, number> = { cash: 0, upi: 0, cash_upi: 0 };
  const byLocation = new Map<string, number>();
  const byBatch = new Map<string, number>();
  // Total Cash / Total UPI — real money reconciliation, separate from "how
  // it was logged" above. A split payment decomposes into its actual
  // cash_amount/upi_amount so these two numbers always add up to the grand
  // total of ALL payments (main + demo), unlike byMode.cash_upi which
  // counts the whole split amount as its own bucket.
  let totalCash = 0;
  let totalUpi = 0;
  for (const p of payments ?? []) {
    byMode[p.mode] = (byMode[p.mode] ?? 0) + p.amount;
    if (p.mode === 'cash_upi') {
      totalCash += p.cash_amount ?? 0;
      totalUpi += p.upi_amount ?? 0;
    } else if (p.mode === 'cash') {
      totalCash += p.amount;
    } else if (p.mode === 'upi') {
      totalUpi += p.amount;
    }
    const student = studentById.get(p.student_id);
    if (!student) continue;
    if (student.location_id) byLocation.set(student.location_id, (byLocation.get(student.location_id) ?? 0) + p.amount);
    if (student.batch_id) byBatch.set(student.batch_id, (byBatch.get(student.batch_id) ?? 0) + p.amount);
  }
  const totalAllPayments = (payments ?? []).reduce((sum, p) => sum + p.amount, 0);

  // --- Filters — narrow the payment log only, per the breakdown/filter split above ---
  let filteredStudentIds: Set<string> | null = null;
  if (params.location || params.batch) {
    filteredStudentIds = new Set(
      (students ?? [])
        .filter((s) => (params.location ? s.location_id === params.location : true))
        .filter((s) => (params.batch ? s.batch_id === params.batch : true))
        .map((s) => s.id)
    );
  }
  const filteredPayments = (payments ?? [])
    .filter((p) => (filteredStudentIds ? filteredStudentIds.has(p.student_id) : true))
    .filter((p) => (params.mode ? p.mode === params.mode : true))
    .filter((p) => (params.type ? p.payment_type === params.type : true));

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
        {season ? <p className="text-sm text-muted">Season: {season.label}</p> : null}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {cards.map((c) => (
            <div key={c.label} className="rounded-[var(--radius)] border border-border p-4">
              <p className="text-xs text-muted">{c.label}</p>
              <p className="mt-1 text-2xl font-semibold">{c.value}</p>
            </div>
          ))}
        </div>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[var(--radius)] border border-border p-4">
            <p className="text-xs text-muted">Total Cash</p>
            <p className="mt-1 text-2xl font-semibold">{totalCash.toFixed(2)}</p>
          </div>
          <div className="rounded-[var(--radius)] border border-border p-4">
            <p className="text-xs text-muted">Total UPI</p>
            <p className="mt-1 text-2xl font-semibold">{totalUpi.toFixed(2)}</p>
          </div>
        </section>

        <section className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-[var(--radius)] border border-border p-4">
            <h2 className="mb-3 text-sm font-semibold">Collected by payment mode</h2>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between">
                <dt>Cash</dt>
                <dd>{(byMode.cash ?? 0).toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>UPI</dt>
                <dd>{(byMode.upi ?? 0).toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Cash + UPI</dt>
                <dd>{(byMode.cash_upi ?? 0).toFixed(2)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-1 font-semibold">
                <dt>All</dt>
                <dd>{totalAllPayments.toFixed(2)}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-[var(--radius)] border border-border p-4">
            <h2 className="mb-3 text-sm font-semibold">Collected by location</h2>
            <dl className="space-y-1 text-sm">
              {(locations ?? []).map((l) => (
                <div key={l.id} className="flex justify-between">
                  <dt>{l.name}</dt>
                  <dd>{(byLocation.get(l.id) ?? 0).toFixed(2)}</dd>
                </div>
              ))}
              <div className="flex justify-between border-t border-border pt-1 font-semibold">
                <dt>All</dt>
                <dd>{totalAllPayments.toFixed(2)}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-[var(--radius)] border border-border p-4">
            <h2 className="mb-3 text-sm font-semibold">Collected by batch</h2>
            <dl className="space-y-1 text-sm">
              {(batches ?? []).map((b) => (
                <div key={b.id} className="flex justify-between">
                  <dt>
                    {locationName.get(b.location_id)} · {b.name}
                  </dt>
                  <dd>{(byBatch.get(b.id) ?? 0).toFixed(2)}</dd>
                </div>
              ))}
              <div className="flex justify-between border-t border-border pt-1 font-semibold">
                <dt>All</dt>
                <dd>{totalAllPayments.toFixed(2)}</dd>
              </div>
            </dl>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold">All payments</h2>
          <form className="mb-4 flex flex-wrap gap-3" method="get">
            <LocationBatchSelect
              locations={locations ?? []}
              batches={batches ?? []}
              locationField="location"
              batchField="batch"
              defaultLocationId={params.location ?? ''}
              defaultBatchId={params.batch ?? ''}
              locationPlaceholder="All locations"
              batchPlaceholder="All batches"
              className={FIELD_CLASS}
            />
            <select name="mode" defaultValue={params.mode ?? ''} className={FIELD_CLASS}>
              <option value="">All payment modes</option>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="cash_upi">Cash + UPI</option>
            </select>
            <select name="type" defaultValue={params.type ?? ''} className={FIELD_CLASS}>
              <option value="">Main + Demo</option>
              <option value="main">Main fee only</option>
              <option value="demo">Demo fee only</option>
            </select>
            <button type="submit" className="rounded-[var(--radius)] border border-border px-3 py-2 text-sm">
              Filter
            </button>
            <a
              href={`/api/export/payments${buildQueryString({
                location: params.location,
                batch: params.batch,
                mode: params.mode,
                type: params.type,
              })}`}
              className="ml-auto rounded-[var(--radius)] border border-border px-3 py-2 text-sm"
            >
              Export CSV
            </a>
          </form>

          {!filteredPayments.length ? (
            <EmptyState title="No payments" message="No payments match this filter." />
          ) : (
            <div className="overflow-x-auto rounded-[var(--radius)] border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/10 text-left">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Student</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Batch</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Mode</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((p) => {
                    const student = studentById.get(p.student_id);
                    return (
                      <tr key={p.id} className="border-t border-border">
                        <td className="p-3">{p.paid_date}</td>
                        <td className="p-3">
                          <Link href={`/students/${p.student_id}`} className="underline">
                            {student?.name ?? '-'}
                          </Link>
                        </td>
                        <td className="p-3">{student?.location_id ? locationName.get(student.location_id) : '-'}</td>
                        <td className="p-3">{student?.batch_id ? batchName.get(student.batch_id) : '-'}</td>
                        <td className="p-3">{p.payment_type === 'demo' ? 'Demo' : 'Main'}</td>
                        <td className="p-3">{paymentModeLabel(p.mode)}</td>
                        <td className="p-3">{p.amount.toFixed(2)}</td>
                        <td className="p-3">{p.remarks ?? '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
