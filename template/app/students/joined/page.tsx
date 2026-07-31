import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/app/app-shell';
import { EmptyState } from '@/lib/patterns/empty-state';
import { LocationBatchSelect } from '../location-batch-select';
import { feeStatus, feeStatusLabel, feeStatusColor, feeStatusRowTint, isFeePending } from '@/lib/fee-status';
import { StatusDot } from '../status-dot';
import { getStaffRole, isSuperAdmin } from '@/lib/roles';
import { orIlikeValue, buildQueryString } from '@/lib/form';

const FIELD_CLASS = 'rounded-[var(--radius)] border border-border px-3 py-2 text-sm';

export default async function JoinedStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; location?: string; batch?: string; pending?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const staffRole = await getStaffRole();
  const superAdmin = isSuperAdmin(staffRole);

  const [{ data: allLocations }, { data: batches }] = await Promise.all([
    supabase.from('locations').select('id, name').order('name'),
    supabase.from('batches').select('id, name, location_id').order('name'),
  ]);
  const locations = superAdmin
    ? (allLocations ?? [])
    : (allLocations ?? []).filter((l) => l.id === staffRole?.locationId);

  let query = supabase
    .from('students')
    .select('id, name, phone_number, location_id, batch_id, fee_total')
    .is('deleted_at', null)
    .eq('status', 'joined')
    .order('created_at', { ascending: false });

  if (params.location) query = query.eq('location_id', params.location);
  if (params.batch) query = query.eq('batch_id', params.batch);
  if (params.q) {
    const v = orIlikeValue(params.q);
    query = query.or(`name.ilike.${v},phone_number.ilike.${v}`);
  }

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

  const locationName = new Map((allLocations ?? []).map((l) => [l.id, l.name]));
  const batchName = new Map((batches ?? []).map((b) => [b.id, b.name]));

  // Fee status is derived (payments aren't in the initial query), so the
  // "pending fees only" filter is applied here in JS, after computing it -
  // not as a SQL filter.
  let rows = (students ?? []).map((s) => ({
    student: s,
    status: feeStatus(s.fee_total, paidByStudent.get(s.id) ?? 0),
  }));
  if (params.pending === '1') rows = rows.filter((r) => isFeePending(r.status));

  return (
    <AppShell active="joined" userEmail={user?.email}>
      <div className="space-y-6">
        {/* Keyed on the current filters so a soft-navigation (e.g. "Reset
            filters") remounts the form - otherwise uncontrolled fields like
            the checkbox/selects keep their stale DOM state after the URL
            (and the data) has already changed. */}
        <form key={JSON.stringify(params)} className="mb-4 flex flex-wrap gap-3" method="get">
          <input
            name="q"
            defaultValue={params.q ?? ''}
            placeholder="Search name or phone"
            className={FIELD_CLASS}
          />
          {superAdmin ? (
            <LocationBatchSelect
              locations={locations}
              batches={batches ?? []}
              locationField="location"
              batchField="batch"
              defaultLocationId={params.location ?? ''}
              defaultBatchId={params.batch ?? ''}
              locationPlaceholder="All locations"
              batchPlaceholder="All batches"
              className={FIELD_CLASS}
            />
          ) : null}
          <label className="flex items-center gap-2 rounded-[var(--radius)] border border-border px-3 py-2 text-sm">
            <input type="checkbox" name="pending" value="1" defaultChecked={params.pending === '1'} />
            Pending fees only
          </label>
          <button type="submit" className="rounded-[var(--radius)] border border-border px-3 py-2 text-sm">
            Filter
          </button>
          <Link href="/students/joined" className="rounded-[var(--radius)] border border-border px-3 py-2 text-sm">
            Reset filters
          </Link>
          {superAdmin ? (
            <a
              href={`/api/export/students${buildQueryString({
                q: params.q,
                location: params.location,
                batch: params.batch,
                pending: params.pending,
                status: 'joined',
              })}`}
              className="ml-auto rounded-[var(--radius)] border border-border px-3 py-2 text-sm"
            >
              Export CSV
            </a>
          ) : null}
        </form>

        {error ? (
          <p className="text-sm text-red-600">Could not load: {error.message}</p>
        ) : !rows.length ? (
          <EmptyState
            title={params.pending === '1' ? 'No pending fees' : 'No joined students yet'}
            message={
              params.pending === '1'
                ? 'Nobody joined is currently Not Paid or Half Paid.'
                : 'Mark someone green in the Inquiry list, then finish their details here.'
            }
          />
        ) : (
          <div className="overflow-x-auto rounded-[var(--radius)] border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/10 text-left">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Batch</th>
                  <th className="p-3">Fees</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ student: s, status }) => {
                  const missingDetails = !s.batch_id || s.fee_total === null;
                  return (
                    <tr
                      key={s.id}
                      className="border-t border-border"
                      style={{ backgroundColor: feeStatusRowTint(status) }}
                    >
                      <td className="p-3">
                        <Link href={`/students/${s.id}`} className="font-medium underline">
                          {s.name}
                        </Link>
                        {missingDetails ? (
                          <Link href={`/students/${s.id}`} className="ml-2 text-xs text-accent underline">
                            Complete details
                          </Link>
                        ) : null}
                      </td>
                      <td className="p-3">{s.phone_number}</td>
                      <td className="p-3">{s.location_id ? (locationName.get(s.location_id) ?? '-') : '-'}</td>
                      <td className="p-3">{s.batch_id ? (batchName.get(s.batch_id) ?? '-') : '-'}</td>
                      <td className="p-3">
                        <StatusDot color={feeStatusColor(status)} label={feeStatusLabel(status)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
