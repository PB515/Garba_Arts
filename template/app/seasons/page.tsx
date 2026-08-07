import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/app/app-shell';
import { getStaffRole, isSuperAdmin } from '@/lib/roles';
import { getCurrentSeason } from '@/lib/seasons';
import { NewSeasonForm } from './new-season-form';

/**
 * super_admin-only (decision #72): starting a new season/flipping which one
 * is current affects every admin's view of the whole app at once, a much
 * bigger blast radius than one location_admin's own data.
 */
export default async function SeasonsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const staffRole = await getStaffRole();
  if (!isSuperAdmin(staffRole)) redirect('/dashboard');

  const [season, { data: locations }, { data: allSeasons }] = await Promise.all([
    getCurrentSeason(supabase),
    supabase.from('locations').select('id, name').order('name'),
    supabase.from('seasons').select('id, label, start_date, end_date, is_current').order('created_at', { ascending: false }),
  ]);

  const currentBatches = season
    ? (
        await supabase.from('batches').select('name, location_id').eq('season_id', season.id).order('name')
      ).data
    : [];

  const pastSeasons = (allSeasons ?? []).filter((s) => !s.is_current);

  return (
    <AppShell active="seasons" userEmail={user?.email}>
      <div className="space-y-8">
        <section className="rounded-[var(--radius)] border border-border p-4">
          <h2 className="mb-2 text-sm font-semibold">Current season</h2>
          {season ? (
            <p className="text-sm">
              <span className="font-semibold">{season.label}</span>
              {season.start_date || season.end_date ? (
                <span className="text-muted">
                  {' '}
                  ({season.start_date ?? '?'} – {season.end_date ?? '?'})
                </span>
              ) : null}
            </p>
          ) : (
            <p className="text-sm text-red-600">No current season set.</p>
          )}
        </section>

        <section className="rounded-[var(--radius)] border border-border p-4">
          <h2 className="mb-3 text-sm font-semibold">Start a new season</h2>
          <p className="mb-4 text-sm text-muted">
            This creates a brand-new season and its own batches (pre-filled from the current season below, editable
            before you confirm), then switches every list over to it. History stays exactly as it is, nothing here
            touches past seasons.
          </p>
          <NewSeasonForm
            locations={locations ?? []}
            prefillBatches={(currentBatches ?? []).map((b) => ({ name: b.name, location_id: b.location_id }))}
          />
        </section>

        <section className="rounded-[var(--radius)] border border-border p-4">
          <h2 className="mb-3 text-sm font-semibold">Past seasons</h2>
          {!pastSeasons.length ? (
            <p className="text-sm text-muted">No past seasons yet.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {pastSeasons.map((s) => (
                <li key={s.id}>
                  <Link href={`/seasons/${s.id}`} className="underline">
                    {s.label}
                  </Link>
                  {s.start_date || s.end_date ? (
                    <span className="text-muted">
                      {' '}
                      ({s.start_date ?? '?'} – {s.end_date ?? '?'})
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}
