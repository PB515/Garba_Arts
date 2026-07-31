import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/app/app-shell';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // No fee/payment data here at all — money only appears on an individual
  // student's own page, or the super-admin-only Fees tab. This is a
  // deliberate call, not an oversight.
  const [{ data: students }, { data: locations }, { data: batches }] = await Promise.all([
    supabase.from('students').select('id, status, location_id, batch_id, created_at').is('deleted_at', null),
    supabase.from('locations').select('id, name').order('name'),
    supabase.from('batches').select('id, name, location_id').order('name'),
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
            {!locations?.length ? (
              <p className="text-sm text-muted">No locations yet.</p>
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
              <p className="text-sm text-muted">No batches yet.</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {batches.map((b) => (
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
