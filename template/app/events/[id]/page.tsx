import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/app/app-shell';
import { EmptyState } from '@/lib/patterns/empty-state';
import {
  updateEvent,
  permanentlyDeleteEvent,
  createRegistration,
  archiveRegistration,
  permanentlyDeleteRegistration,
} from '../actions';

const FIELD_CLASS = 'rounded-[var(--radius)] border border-border px-3 py-2 text-sm';

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: event, error }, { data: registrations }] = await Promise.all([
    supabase.from('events').select('*').eq('id', id).single(),
    supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false }),
  ]);

  if (error || !event) notFound();

  const boundUpdate = updateEvent.bind(null, id);
  const boundPermanentDelete = permanentlyDeleteEvent.bind(null, id);
  const boundCreateRegistration = createRegistration.bind(null, id);

  const totalHeadcount = (registrations ?? []).reduce((sum, r) => sum + 1 + r.friend_count, 0);
  const totalFeeExpected = (registrations ?? []).reduce((sum, r) => sum + (r.fee_amount ?? 0), 0);
  const totalCollected = (registrations ?? []).reduce((sum, r) => sum + r.amount_paid, 0);

  return (
    <AppShell active="events" userEmail={user?.email}>
      <div className="mb-4">
        <Link href="/events" className="text-sm underline">
          ← Back to events
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="space-y-3 rounded-[var(--radius)] border border-border p-4">
          <h2 className="text-sm font-semibold">Event details</h2>
          <form action={boundUpdate} className="space-y-3">
            <label className="block text-sm">
              Name
              <input name="name" defaultValue={event.name} required className={`mt-1 w-full ${FIELD_CLASS}`} />
            </label>
            <label className="block text-sm">
              Date
              <input name="event_date" type="date" defaultValue={event.event_date ?? ''} className={`mt-1 w-full ${FIELD_CLASS}`} />
            </label>
            <label className="block text-sm">
              Description
              <textarea name="description" defaultValue={event.description ?? ''} rows={2} className={`mt-1 w-full ${FIELD_CLASS}`} />
            </label>
            <button type="submit" className="rounded-[var(--radius)] bg-accent px-3 py-2 text-sm font-medium text-accent-foreground">
              Save
            </button>
          </form>

          <div className="border-t border-border pt-3 text-sm">
            <form action={boundPermanentDelete}>
              <button type="submit" className="text-red-600 underline">
                Permanently remove event (and its registrations)
              </button>
            </form>
          </div>
        </section>

        <section className="rounded-[var(--radius)] border border-border p-4">
          <h2 className="mb-2 text-sm font-semibold">Summary</h2>
          <dl className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <dt className="text-muted">Total registered</dt>
              <dd className="font-semibold">{totalHeadcount}</dd>
            </div>
            <div>
              <dt className="text-muted">Fee expected</dt>
              <dd>{totalFeeExpected.toFixed(2)}</dd>
            </div>
            <div>
              <dt className="text-muted">Collected</dt>
              <dd>{totalCollected.toFixed(2)}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="mt-8 rounded-[var(--radius)] border border-border p-4">
        <h2 className="mb-3 text-sm font-semibold">Add registration</h2>
        <form action={boundCreateRegistration} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <input name="registrant_name" placeholder="Registrant name" required className={FIELD_CLASS} />
          <input name="registrant_phone" placeholder="Phone (optional)" className={FIELD_CLASS} />
          <input name="friend_count" type="number" min="0" placeholder="+ friends" defaultValue="0" className={FIELD_CLASS} />
          <input name="fee_amount" type="number" step="0.01" placeholder="Fee (leave blank if free)" className={FIELD_CLASS} />
          <input name="amount_paid" type="number" step="0.01" placeholder="Amount paid" defaultValue="0" className={FIELD_CLASS} />
          <input name="remarks" placeholder="Remarks" className={`col-span-2 ${FIELD_CLASS}`} />
          <button type="submit" className="rounded-[var(--radius)] bg-accent px-3 py-2 text-sm font-medium text-accent-foreground">
            Add
          </button>
        </form>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold">Registrations</h2>
        {!registrations?.length ? (
          <EmptyState title="No registrations yet" message="Add the first one above." />
        ) : (
          <div className="overflow-x-auto rounded-[var(--radius)] border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/10 text-left">
                <tr>
                  <th className="p-3">Registrant</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">+ Friends</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Fee</th>
                  <th className="p-3">Paid</th>
                  <th className="p-3">Remarks</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="p-3">{r.registrant_name}</td>
                    <td className="p-3">{r.registrant_phone ?? '-'}</td>
                    <td className="p-3">{r.friend_count}</td>
                    <td className="p-3">{1 + r.friend_count}</td>
                    <td className="p-3">{r.fee_amount !== null ? r.fee_amount.toFixed(2) : '-'}</td>
                    <td className="p-3">{r.amount_paid.toFixed(2)}</td>
                    <td className="p-3">{r.remarks ?? '-'}</td>
                    <td className="p-3">
                      <div className="flex gap-3">
                        <form action={archiveRegistration.bind(null, r.id, id)}>
                          <button type="submit" className="underline">
                            Archive
                          </button>
                        </form>
                        <form action={permanentlyDeleteRegistration.bind(null, r.id, id)}>
                          <button type="submit" className="text-red-600 underline">
                            Remove
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppShell>
  );
}
