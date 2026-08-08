import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/app/app-shell';
import { getStaffRole, isSuperAdmin } from '@/lib/roles';
import { sortBatches } from '@/lib/batches';

/**
 * A past season, read-only - a summary, not a second copy of Lead/Inquiry/
 * Joined's full interactive UI. "History should be visible" (the owner's
 * ask) is satisfied by real numbers + CSV export scoped to this season;
 * editing historical records isn't the point of a history view.
 */
export default async function SeasonHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const staffRole = await getStaffRole();
  if (!isSuperAdmin(staffRole)) redirect('/dashboard');

  const [{ data: season, error }, { data: locations }, { data: batches }, { data: students }] = await Promise.all([
    supabase.from('seasons').select('*').eq('id', id).single(),
    supabase.from('locations').select('id, name').order('name'),
    supabase.from('batches').select('id, name, location_id').eq('season_id', id).order('name'),
    supabase
      .from('students')
      .select('id, status, location_id, batch_id, is_lead')
      .eq('season_id', id)
      .is('deleted_at', null),
  ]);

  if (error || !season) notFound();

  const all = students ?? [];
  const totalLeads = all.filter((s) => s.is_lead).length;
  const totalInquiry = all.filter((s) => s.location_id).length;
  const joined = all.filter((s) => s.status === 'joined');
  const droppedCount = all.filter((s) => s.status === 'dropped').length;

  const headcountByLocation = new Map<string, number>();
  const headcountByBatch = new Map<string, number>();
  for (const s of joined) {
    if (s.location_id) headcountByLocation.set(s.location_id, (headcountByLocation.get(s.location_id) ?? 0) + 1);
    if (s.batch_id) headcountByBatch.set(s.batch_id, (headcountByBatch.get(s.batch_id) ?? 0) + 1);
  }
  const locationName = new Map((locations ?? []).map((l) => [l.id, l.name]));

  const cards = [
    { label: 'Total leads', value: totalLeads },
    { label: 'Total inquiry', value: totalInquiry },
    { label: 'Joined', value: joined.length },
    { label: 'Dropped', value: droppedCount },
  ];

  return (
    <AppShell active="seasons" userEmail={user?.email}>
      <div className="mb-4">
        <Link href="/seasons" className="text-sm underline">
          ← Back to seasons
        </Link>
      </div>
      <div className="space-y-8">
        <div>
          <h1 className="text-lg font-semibold">{season.label}</h1>
          {season.start_date || season.end_date ? (
            <p className="text-sm text-muted">
              {season.start_date ?? '?'} – {season.end_date ?? '?'}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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
            {!locations?.length ? (
              <p className="text-sm text-muted">No locations.</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {locations.map((l) => (
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
            {!batches?.length ? (
              <p className="text-sm text-muted">No batches for this season.</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {sortBatches(batches).map((b) => (
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

        <section className="rounded-[var(--radius)] border border-border p-4">
          <h2 className="mb-3 text-sm font-semibold">Export this season</h2>
          <div className="flex gap-3">
            <a
              href={`/api/export/students?season=${id}`}
              className="rounded-[var(--radius)] border border-border px-3 py-2 text-sm"
            >
              Students CSV
            </a>
            <a
              href={`/api/export/payments?season=${id}`}
              className="rounded-[var(--radius)] border border-border px-3 py-2 text-sm"
            >
              Payments CSV
            </a>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
