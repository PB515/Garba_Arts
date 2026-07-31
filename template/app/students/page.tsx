import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createStudent, setStudentStatus } from './actions';
import { AppShell } from '@/app/app-shell';
import { EmptyState } from '@/lib/patterns/empty-state';
import { STATUS_OPTIONS, statusLabel, statusColor } from '@/lib/status';
import { LocationBatchSelect } from './location-batch-select';
import { SourceField } from './source-field';
import { StatusDot } from './status-dot';
import { StatusQuickSet } from './status-quick-set';
import { orIlikeValue, buildQueryString } from '@/lib/form';
import { getStaffRole, isSuperAdmin } from '@/lib/roles';

const FIELD_CLASS = 'rounded-[var(--radius)] border border-border px-3 py-2 text-sm';

export default async function InquiryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; location?: string; batch?: string; status?: string }>;
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
    .select('id, name, phone_number, status, location_id, batch_id, remarks, deleted_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (params.location) query = query.eq('location_id', params.location);
  if (params.batch) query = query.eq('batch_id', params.batch);
  if (params.status) query = query.eq('status', params.status);
  if (params.q) {
    const v = orIlikeValue(params.q);
    query = query.or(`name.ilike.${v},phone_number.ilike.${v}`);
  }

  const { data: students, error } = await query;

  const locationName = new Map((allLocations ?? []).map((l) => [l.id, l.name]));
  const batchName = new Map((batches ?? []).map((b) => [b.id, b.name]));

  return (
    <AppShell active="inquiry" userEmail={user?.email}>
      <div className="space-y-8">
        <section className="rounded-[var(--radius)] border border-border p-4">
          <h2 className="mb-3 text-sm font-semibold">Add inquiry / lead</h2>
          <form action={createStudent} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <input name="name" placeholder="Full Name" required className={FIELD_CLASS} />
            <input name="phone_number" placeholder="Phone" required className={FIELD_CLASS} />
            <input name="whatsapp_number" placeholder="WhatsApp (if different)" className={FIELD_CLASS} />
            <SourceField className={FIELD_CLASS} />
            <LocationBatchSelect
              locations={locations}
              batches={batches ?? []}
              locationField="location_id"
              batchField="batch_id"
              defaultLocationId={!superAdmin ? locations[0]?.id : ''}
              className={FIELD_CLASS}
            />
            <input name="fee_total" type="number" step="0.01" min="0" placeholder="Fee (once decided)" className={FIELD_CLASS} />
            <input name="demo_fee_amount" type="number" step="0.01" min="0" placeholder="Demo fee (small, optional)" className={FIELD_CLASS} />
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
                })}`}
                className="ml-auto rounded-[var(--radius)] border border-border px-3 py-2 text-sm"
              >
                Export CSV
              </a>
            ) : null}
          </form>

          {error ? (
            <p className="text-sm text-red-600">Could not load: {error.message}</p>
          ) : !students?.length ? (
            <EmptyState title="No inquiries yet" message="Add your first inquiry above." />
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
                    <th className="p-3">Remarks</th>
                    <th className="p-3">Quick set</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id} className="border-t border-border">
                      <td className="p-3">
                        <StatusDot color={statusColor(s.status)} label={statusLabel(s.status)} />
                      </td>
                      <td className="p-3">
                        <Link href={`/students/${s.id}`} className="font-medium underline">
                          {s.name}
                        </Link>
                      </td>
                      <td className="p-3">{s.phone_number}</td>
                      <td className="p-3">{s.location_id ? (locationName.get(s.location_id) ?? '-') : '-'}</td>
                      <td className="p-3">{s.batch_id ? (batchName.get(s.batch_id) ?? '-') : '-'}</td>
                      <td className="p-3 max-w-[16rem] truncate">{s.remarks ?? '-'}</td>
                      <td className="p-3">
                        <StatusQuickSet
                          studentName={s.name}
                          options={STATUS_OPTIONS.map((opt) => ({
                            value: opt,
                            label: statusLabel(opt),
                            color: statusColor(opt),
                            action: setStudentStatus.bind(null, s.id, opt),
                          }))}
                        />
                      </td>
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
