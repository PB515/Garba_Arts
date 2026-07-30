import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createStudent } from './actions';
import { AppShell } from '@/app/app-shell';
import { EmptyState } from '@/lib/patterns/empty-state';
import { STATUS_OPTIONS, statusLabel } from '@/lib/status';
import { LocationBatchSelect } from './location-batch-select';
import { SourceField } from './source-field';

const FIELD_CLASS = 'rounded-[var(--radius)] border border-border px-3 py-2 text-sm';

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; location?: string; batch?: string; status?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: locations }, { data: batches }] = await Promise.all([
    supabase.from('locations').select('id, name').order('name'),
    supabase.from('batches').select('id, name, location_id').order('name'),
  ]);

  let query = supabase
    .from('students')
    .select('id, name, phone_number, status, location_id, batch_id, fee_total, deleted_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (params.location) query = query.eq('location_id', params.location);
  if (params.batch) query = query.eq('batch_id', params.batch);
  if (params.status) query = query.eq('status', params.status);
  if (params.q) query = query.or(`name.ilike.%${params.q}%,phone_number.ilike.%${params.q}%`);

  const { data: students, error } = await query;

  const studentIds = (students ?? []).map((s) => s.id);
  const paidByStudent = new Map<string, number>();
  if (studentIds.length) {
    const { data: payments } = await supabase
      .from('payments')
      .select('student_id, amount')
      .is('deleted_at', null)
      .in('student_id', studentIds);
    for (const p of payments ?? []) {
      paidByStudent.set(p.student_id, (paidByStudent.get(p.student_id) ?? 0) + p.amount);
    }
  }

  const locationName = new Map((locations ?? []).map((l) => [l.id, l.name]));
  const batchName = new Map((batches ?? []).map((b) => [b.id, b.name]));
  const today = new Date().toISOString().slice(0, 10);

  return (
    <AppShell active="students" userEmail={user?.email}>
      <div className="space-y-8">
        <section className="rounded-[var(--radius)] border border-border p-4">
          <h2 className="mb-3 text-sm font-semibold">Add inquiry / lead</h2>
          <form action={createStudent} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <input name="name" placeholder="Name" required className={FIELD_CLASS} />
            <input name="phone_number" placeholder="Phone" required className={FIELD_CLASS} />
            <SourceField className={FIELD_CLASS} />
            <select name="status" defaultValue="" className={FIELD_CLASS}>
              <option value="">Status</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {statusLabel(s)}
                </option>
              ))}
            </select>
            <LocationBatchSelect
              locations={locations ?? []}
              batches={batches ?? []}
              locationField="location_id"
              batchField="batch_id"
              className={FIELD_CLASS}
            />
            <label className="col-span-2 text-xs text-muted sm:col-span-1">
              Inquiry date (when this lead came in)
              <input name="inquiry_date" type="date" defaultValue={today} className={`mt-1 w-full ${FIELD_CLASS}`} />
            </label>
            <input name="fee_total" type="number" step="0.01" placeholder="Fee" className={FIELD_CLASS} />
            <input name="remarks" placeholder="Remarks" className={`col-span-2 sm:col-span-3 ${FIELD_CLASS}`} />
            <button type="submit" className="rounded-[var(--radius)] bg-accent px-3 py-2 text-sm font-medium text-accent-foreground">
              Add
            </button>
          </form>
        </section>

        <section>
          <form className="mb-4 flex flex-wrap gap-3" method="get">
            <input
              name="q"
              defaultValue={params.q ?? ''}
              placeholder="Search name or phone"
              className={FIELD_CLASS}
            />
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
            <select name="status" defaultValue={params.status ?? ''} className={FIELD_CLASS}>
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {statusLabel(s)}
                </option>
              ))}
            </select>
            <button type="submit" className="rounded-[var(--radius)] border border-border px-3 py-2 text-sm">
              Filter
            </button>
            <a href="/api/export/students" className="ml-auto rounded-[var(--radius)] border border-border px-3 py-2 text-sm">
              Export CSV
            </a>
          </form>

          {error ? (
            <p className="text-sm text-red-600">Could not load students: {error.message}</p>
          ) : !students?.length ? (
            <EmptyState title="No records yet" message="Add your first inquiry above." />
          ) : (
            <div className="overflow-x-auto rounded-[var(--radius)] border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/10 text-left">
                  <tr>
                    <th className="p-3">Name</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Batch</th>
                    <th className="p-3">Fee</th>
                    <th className="p-3">Paid</th>
                    <th className="p-3">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => {
                    const paid = paidByStudent.get(s.id) ?? 0;
                    const balance = s.fee_total !== null ? s.fee_total - paid : null;
                    return (
                      <tr key={s.id} className="border-t border-border">
                        <td className="p-3">
                          <Link href={`/students/${s.id}`} className="font-medium underline">
                            {s.name}
                          </Link>
                        </td>
                        <td className="p-3">{s.phone_number}</td>
                        <td className="p-3">{statusLabel(s.status)}</td>
                        <td className="p-3">{s.location_id ? (locationName.get(s.location_id) ?? '-') : '-'}</td>
                        <td className="p-3">{s.batch_id ? (batchName.get(s.batch_id) ?? '-') : '-'}</td>
                        <td className="p-3">{s.fee_total !== null ? s.fee_total.toFixed(2) : '-'}</td>
                        <td className="p-3">{paid.toFixed(2)}</td>
                        <td className="p-3">{balance !== null ? balance.toFixed(2) : '-'}</td>
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
