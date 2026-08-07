import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { setStudentStatus } from './actions';
import { AppShell } from '@/app/app-shell';
import { EmptyState } from '@/lib/patterns/empty-state';
import { STATUS_OPTIONS, statusLabel, statusColor } from '@/lib/status';
import { LocationBatchSelect } from './location-batch-select';
import { StatusDot } from './status-dot';
import { StatusQuickSet } from './status-quick-set';
import { AddInquiryForm } from './add-inquiry-form';
import { feeStatus, feeStatusLabel, feeStatusColor, isFeePending } from '@/lib/fee-status';
import { orIlikeValue, buildQueryString } from '@/lib/form';
import { getStaffRole, isSuperAdmin } from '@/lib/roles';

const FIELD_CLASS = 'rounded-[var(--radius)] border border-border px-3 py-2 text-sm';

export default async function InquiryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; location?: string; batch?: string; status?: string; pending?: string }>;
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

  // A location_admin only ever has one real choice, so don't show a
  // dropdown with locations RLS would reject anyway.
  const locations = superAdmin
    ? (allLocations ?? [])
    : (allLocations ?? []).filter((l) => l.id === staffRole?.locationId);

  let query = supabase
    .from('students')
    .select('id, name, phone_number, status, location_id, batch_id, fee_total, remarks, deleted_at')
    .is('deleted_at', null)
    .not('location_id', 'is', null) // an unclaimed Lead lives on its own tab, not here
    .order('created_at', { ascending: false });

  if (params.location) query = query.eq('location_id', params.location);
  if (params.batch) query = query.eq('batch_id', params.batch);
  if (params.status) query = query.eq('status', params.status);
  if (params.q) {
    const v = orIlikeValue(params.q);
    query = query.or(`name.ilike.${v},phone_number.ilike.${v}`);
  }

  const { data: students, error } = await query;

  // Fee status moved here from Joined (decision #66) - Inquiry is now where
  // fee data actually gets managed, so this is where the badge belongs.
  const studentIds = (students ?? []).map((s) => s.id);
  const paidByStudent = new Map<string, number>();
  if (studentIds.length) {
    // 'main' only - demo fee payments (0025) also live in this table now,
    // but shouldn't count toward the real course fee's Paid/Balance/badge.
    const { data: payments } = await supabase
      .from('payments')
      .select('student_id, amount')
      .is('deleted_at', null)
      .eq('payment_type', 'main')
      .in('student_id', studentIds);
    for (const p of payments ?? []) {
      paidByStudent.set(p.student_id, (paidByStudent.get(p.student_id) ?? 0) + p.amount);
    }
  }

  let rows = (students ?? []).map((s) => ({
    student: s,
    status: feeStatus(s.fee_total, paidByStudent.get(s.id) ?? 0),
  }));
  if (params.pending === '1') rows = rows.filter((r) => isFeePending(r.status));

  const locationName = new Map((allLocations ?? []).map((l) => [l.id, l.name]));
  const batchName = new Map((batches ?? []).map((b) => [b.id, b.name]));

  return (
    <AppShell active="inquiry" userEmail={user?.email}>
      <div className="space-y-8">
        <section className="rounded-[var(--radius)] border border-border p-4">
          <h2 className="mb-3 text-sm font-semibold">Add inquiry / lead</h2>
          <AddInquiryForm
            locations={locations}
            batches={batches ?? []}
            defaultLocationId={!superAdmin ? (locations[0]?.id ?? '') : ''}
          />
        </section>

        <section>
          <form className="mb-4 flex flex-wrap gap-3" method="get">
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
            <select name="status" defaultValue={params.status ?? ''} className={FIELD_CLASS}>
              <option value="">All</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {statusLabel(s)}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 rounded-[var(--radius)] border border-border px-3 py-2 text-sm">
              <input type="checkbox" name="pending" value="1" defaultChecked={params.pending === '1'} />
              Pending fees only
            </label>
            <button type="submit" className="rounded-[var(--radius)] border border-border px-3 py-2 text-sm">
              Filter
            </button>
            {superAdmin ? (
              <a
                href={`/api/export/students${buildQueryString({
                  q: params.q,
                  location: params.location,
                  batch: params.batch,
                  status: params.status,
                  pending: params.pending,
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
              title={params.pending === '1' ? 'No pending fees' : 'No inquiries yet'}
              message={params.pending === '1' ? 'Nobody here is currently Not Paid or Half Paid.' : 'Add your first inquiry above.'}
            />
          ) : (
            <div className="overflow-x-auto rounded-[var(--radius)] border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/10 text-left">
                  <tr>
                    <th className="p-3">Status</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Batch</th>
                    <th className="p-3">Fees</th>
                    <th className="p-3">Remarks</th>
                    <th className="p-3">Quick set</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ student: s, status: fStatus }) => {
                    // "if joined, it's already complete" (the owner's stated
                    // assumption) is enforced, not just displayed - a
                    // missing batch or fee blocks the Joined quick-set
                    // outright, via joinedBlockedReason below.
                    const missingBatch = !s.batch_id;
                    const missingFee = s.fee_total === null;
                    return (
                      <tr key={s.id} className="border-t border-border">
                        <td className="p-3">
                          <StatusDot color={statusColor(s.status)} label={statusLabel(s.status)} />
                        </td>
                        <td className="p-3">
                          <Link href={`/students/${s.id}?from=inquiry`} className="font-medium underline">
                            {s.name}
                          </Link>
                          {missingBatch ? (
                            <Link href={`/students/${s.id}?from=inquiry`} className="ml-2 text-xs text-accent underline">
                              Complete details
                            </Link>
                          ) : null}
                        </td>
                        <td className="p-3">{s.phone_number}</td>
                        <td className="p-3">{s.location_id ? (locationName.get(s.location_id) ?? '-') : '-'}</td>
                        <td className="p-3">{s.batch_id ? (batchName.get(s.batch_id) ?? '-') : '-'}</td>
                        <td className="p-3">
                          <StatusDot color={feeStatusColor(fStatus)} label={feeStatusLabel(fStatus)} />
                        </td>
                        <td className="p-3 max-w-[16rem] truncate">{s.remarks ?? '-'}</td>
                        <td className="p-3">
                          <StatusQuickSet
                            studentName={s.name}
                            joinedBlockedReason={
                              missingBatch || missingFee ? 'add a batch and a fee amount first.' : undefined
                            }
                            options={STATUS_OPTIONS.map((opt) => ({
                              value: opt,
                              label: statusLabel(opt),
                              color: statusColor(opt),
                              action: setStudentStatus.bind(null, s.id, opt),
                            }))}
                          />
                        </td>
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
