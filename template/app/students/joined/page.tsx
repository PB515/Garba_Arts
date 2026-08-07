import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/app/app-shell';
import { EmptyState } from '@/lib/patterns/empty-state';
import { LocationBatchSelect } from '../location-batch-select';
import { getStaffRole, isSuperAdmin } from '@/lib/roles';
import { getCurrentSeason } from '@/lib/seasons';
import { orIlikeValue, buildQueryString } from '@/lib/form';

const FIELD_CLASS = 'rounded-[var(--radius)] border border-border px-3 py-2 text-sm';

/**
 * A plain student list, nothing money-related (decision #66) - fee status
 * lives entirely on Inquiry now. The underlying assumption: nothing reaches
 * "joined" status without already being complete (batch + fee), enforced at
 * the point of marking someone Joined (setStudentStatus/updateStudent), not
 * checked again here.
 */
export default async function JoinedStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; location?: string; batch?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const staffRole = await getStaffRole();
  const superAdmin = isSuperAdmin(staffRole);
  const season = await getCurrentSeason(supabase);

  const [{ data: allLocations }, { data: batches }] = await Promise.all([
    supabase.from('locations').select('id, name').order('name'),
    supabase.from('batches').select('id, name, location_id').eq('season_id', season?.id ?? '').order('name'),
  ]);
  const locations = superAdmin
    ? (allLocations ?? [])
    : (allLocations ?? []).filter((l) => l.id === staffRole?.locationId);

  let query = supabase
    .from('students')
    .select('id, name, phone_number, location_id, batch_id')
    .is('deleted_at', null)
    .eq('status', 'joined')
    .eq('season_id', season?.id ?? '')
    .order('created_at', { ascending: false });

  if (params.location) query = query.eq('location_id', params.location);
  if (params.batch) query = query.eq('batch_id', params.batch);
  if (params.q) {
    const v = orIlikeValue(params.q);
    query = query.or(`name.ilike.${v},phone_number.ilike.${v}`);
  }

  const { data: students, error } = await query;

  const locationName = new Map((allLocations ?? []).map((l) => [l.id, l.name]));
  const batchName = new Map((batches ?? []).map((b) => [b.id, b.name]));

  return (
    <AppShell active="joined" userEmail={user?.email}>
      <div className="space-y-6">
        {season ? <p className="text-sm text-muted">Season: {season.label}</p> : null}
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
        ) : !students?.length ? (
          <EmptyState
            title="No joined students yet"
            message="Mark someone green in the Inquiry list, then finish their details there."
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
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-t border-border">
                    <td className="p-3">
                      <Link href={`/students/${s.id}?from=joined`} className="font-medium underline">
                        {s.name}
                      </Link>
                    </td>
                    <td className="p-3">{s.phone_number}</td>
                    <td className="p-3">{s.location_id ? (locationName.get(s.location_id) ?? '-') : '-'}</td>
                    <td className="p-3">{s.batch_id ? (batchName.get(s.batch_id) ?? '-') : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
