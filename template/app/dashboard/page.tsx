import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/app/app-shell';
import { getStaffRole, isSuperAdmin, isTriageAdmin } from '@/lib/roles';
import { getCurrentSeason } from '@/lib/seasons';
import { sortBatches } from '@/lib/batches';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const staffRole = await getStaffRole();
  const superAdmin = isSuperAdmin(staffRole);
  const triageAdmin = isTriageAdmin(staffRole);
  const season = await getCurrentSeason(supabase);

  if (triageAdmin) {
    return <TriageDashboard userEmail={user?.email} seasonLabel={season?.label} />;
  }

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // No fee/payment data here at all — money only appears on an individual
  // student's own page, or the super-admin-only Fees tab. This is a
  // deliberate call, not an oversight.
  //
  // Every list in this app defaults to the current season only (decision
  // #72) - a location_admin adding a new lead should never see last year's
  // numbers mixed into "this season so far." History lives in the Seasons
  // tab instead.
  const [{ data: students }, { data: locations }, { data: batches }] = await Promise.all([
    supabase
      .from('students')
      .select('id, status, location_id, batch_id, created_at')
      .is('deleted_at', null)
      .eq('season_id', season?.id ?? ''),
    supabase.from('locations').select('id, name').order('name'),
    supabase.from('batches').select('id, name, location_id').eq('season_id', season?.id ?? '').order('name'),
  ]);

  const all = students ?? [];
  const inquiriesThisMonth = all.filter((s) => new Date(s.created_at) >= startOfMonth).length;
  const followUpCount = all.filter((s) => s.status === 'follow_up').length;
  const joinedCount = all.filter((s) => s.status === 'joined').length;
  const droppedCount = all.filter((s) => s.status === 'dropped').length;

  // Headcount reflects actual joined students — a batch's real attendance,
  // not everyone who once expressed interest in it.
  const joined = all.filter((s) => s.status === 'joined');
  const headcountByBatch = new Map<string, number>();
  for (const s of joined) {
    if (!s.batch_id) continue;
    headcountByBatch.set(s.batch_id, (headcountByBatch.get(s.batch_id) ?? 0) + 1);
  }
  const headcountByLocation = new Map<string, number>();
  for (const s of joined) {
    if (!s.location_id) continue;
    headcountByLocation.set(s.location_id, (headcountByLocation.get(s.location_id) ?? 0) + 1);
  }

  const locationName = new Map((locations ?? []).map((l) => [l.id, l.name]));

  // locations/batches are unscoped lookup tables (decision #27) — RLS won't
  // hide the other location's rows here, so a location_admin's dashboard
  // must filter them itself, the same way the add-form's Location field
  // is locked rather than relying on RLS to reject a bad submission.
  const visibleLocations = superAdmin
    ? (locations ?? [])
    : (locations ?? []).filter((l) => l.id === staffRole?.locationId);
  const visibleBatches = sortBatches(
    superAdmin ? (batches ?? []) : (batches ?? []).filter((b) => b.location_id === staffRole?.locationId)
  );

  const cards = [
    { label: 'Total leads', value: all.length },
    { label: 'Inquiries this month', value: inquiriesThisMonth },
    { label: 'Ask again', value: followUpCount },
    { label: 'Joined', value: joinedCount },
    { label: 'Dropped', value: droppedCount },
  ];

  return (
    <AppShell active="dashboard" userEmail={user?.email}>
      <div className="space-y-8">
        {season ? <p className="text-sm text-muted">Season: {season.label}</p> : null}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {cards.map((c) => (
            <div key={c.label} className="rounded-[var(--radius)] border border-border p-4">
              <p className="text-xs text-muted">{c.label}</p>
              <p className="mt-1 text-2xl font-semibold">{c.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-[var(--radius)] border border-border p-4">
            <h2 className="mb-3 text-sm font-semibold">Joined headcount by location</h2>
            {!visibleLocations.length ? (
              <p className="text-sm text-muted">No locations yet.</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {visibleLocations.map((l) => (
                  <li key={l.id} className="flex justify-between">
                    <span>{l.name}</span>
                    <span>{headcountByLocation.get(l.id) ?? 0}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-[var(--radius)] border border-border p-4">
            <h2 className="mb-3 text-sm font-semibold">Joined headcount by batch</h2>
            {!visibleBatches.length ? (
              <p className="text-sm text-muted">No batches yet.</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {visibleBatches.map((b) => (
                  <li key={b.id} className="flex justify-between">
                    <span>
                      {locationName.get(b.location_id)} · {b.name}
                    </span>
                    <span>{headcountByBatch.get(b.id) ?? 0}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

/**
 * triage_admin's whole reason for existing: steer an undecided caller
 * toward whichever batch is actually empty. Sourced from
 * joined_headcount_by_batch() (0018) - a SECURITY DEFINER function
 * returning aggregate counts only, not row-level access to other
 * locations' students. No stat cards here (Total leads/Ask again/Dropped
 * would all just show a nonsensical small number, since RLS only lets this
 * role see unclaimed leads directly) - headcount is the entire point.
 */
async function TriageDashboard({
  userEmail,
  seasonLabel,
}: {
  userEmail: string | undefined;
  seasonLabel: string | undefined;
}) {
  const supabase = await createClient();
  const season = await getCurrentSeason(supabase);

  const [{ data: locations }, { data: batches }, { data: headcounts }] = await Promise.all([
    supabase.from('locations').select('id, name').order('name'),
    supabase.from('batches').select('id, name, location_id').eq('season_id', season?.id ?? '').order('name'),
    supabase.rpc('joined_headcount_by_batch'),
  ]);

  const locationName = new Map((locations ?? []).map((l) => [l.id, l.name]));
  const byLocation = new Map<string, number>();
  const byBatch = new Map<string, number>();
  for (const h of headcounts ?? []) {
    if (h.location_id) byLocation.set(h.location_id, (byLocation.get(h.location_id) ?? 0) + h.headcount);
    if (h.batch_id) byBatch.set(h.batch_id, (byBatch.get(h.batch_id) ?? 0) + h.headcount);
  }

  return (
    <AppShell active="dashboard" userEmail={userEmail}>
      {seasonLabel ? <p className="mb-6 text-sm text-muted">Season: {seasonLabel}</p> : null}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-[var(--radius)] border border-border p-4">
          <h2 className="mb-3 text-sm font-semibold">Joined headcount by location</h2>
          {!locations?.length ? (
            <p className="text-sm text-muted">No locations yet.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {locations.map((l) => (
                <li key={l.id} className="flex justify-between">
                  <span>{l.name}</span>
                  <span>{byLocation.get(l.id) ?? 0}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-[var(--radius)] border border-border p-4">
          <h2 className="mb-3 text-sm font-semibold">Joined headcount by batch</h2>
          {!batches?.length ? (
            <p className="text-sm text-muted">No batches yet.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {sortBatches(batches).map((b) => (
                <li key={b.id} className="flex justify-between">
                  <span>
                    {locationName.get(b.location_id)} · {b.name}
                  </span>
                  <span>{byBatch.get(b.id) ?? 0}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
}
