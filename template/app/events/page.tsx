import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createEvent } from './actions';
import { AppShell } from '@/app/app-shell';
import { EmptyState } from '@/lib/patterns/empty-state';

const FIELD_CLASS = 'rounded-[var(--radius)] border border-border px-3 py-2 text-sm';

export default async function EventsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: events, error }, { data: registrations }] = await Promise.all([
    supabase.from('events').select('id, name, event_date').order('event_date', { ascending: false }),
    supabase.from('event_registrations').select('event_id, friend_count').is('deleted_at', null),
  ]);

  const headcountByEvent = new Map<string, number>();
  for (const r of registrations ?? []) {
    headcountByEvent.set(r.event_id, (headcountByEvent.get(r.event_id) ?? 0) + 1 + r.friend_count);
  }

  return (
    <AppShell active="events" userEmail={user?.email}>
      <div className="space-y-8">
        <section className="rounded-[var(--radius)] border border-border p-4">
          <h2 className="mb-3 text-sm font-semibold">Add event</h2>
          <form action={createEvent} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <input name="name" placeholder="Event name" required className={FIELD_CLASS} />
            <input name="event_date" type="date" className={FIELD_CLASS} />
            <input name="description" placeholder="Description" className={`col-span-2 ${FIELD_CLASS}`} />
            <button type="submit" className="rounded-[var(--radius)] bg-accent px-3 py-2 text-sm font-medium text-accent-foreground">
              Add
            </button>
          </form>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold">Events</h2>
          {error ? (
            <p className="text-sm text-red-600">Could not load events: {error.message}</p>
          ) : !events?.length ? (
            <EmptyState title="No events yet" message="Add your first event above." />
          ) : (
            <div className="overflow-x-auto rounded-[var(--radius)] border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/10 text-left">
                  <tr>
                    <th className="p-3">Name</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Total registered (incl. friends)</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((e) => (
                    <tr key={e.id} className="border-t border-border">
                      <td className="p-3">
                        <Link href={`/events/${e.id}`} className="font-medium underline">
                          {e.name}
                        </Link>
                      </td>
                      <td className="p-3">{e.event_date ?? '-'}</td>
                      <td className="p-3">{headcountByEvent.get(e.id) ?? 0}</td>
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
