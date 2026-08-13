import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/app/app-shell';
import { EmptyState } from '@/lib/patterns/empty-state';
import { getStaffRole, isSuperAdmin } from '@/lib/roles';
import { paymentModeLabel } from '@/lib/fee-status';

const FIELD_CLASS = 'rounded-[var(--radius)] border border-border px-3 py-2 text-sm';

/**
 * The combined Event Fees view (decision #86) - same "individual fees open
 * to every admin, combined view super_admin-only" split as the student Fees
 * tab (decision #28). The per-registration side needs no separate gating:
 * it already inherits event_registrations' own location-scoped RLS, so a
 * location_admin naturally only ever sees/logs payments for their own
 * location's registrations from the event's own admin page.
 */
export default async function EventFeesPage({
  searchParams,
}: {
  searchParams: Promise<{ location?: string; event?: string; mode?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const staffRole = await getStaffRole();
  if (!isSuperAdmin(staffRole)) redirect('/events');

  const [{ data: registrations }, { data: allPayments }, { data: locations }, { data: events }] = await Promise.all([
    supabase.from('event_registrations').select('id, event_id, location_id, fee_amount').is('deleted_at', null),
    supabase
      .from('event_payments')
      .select('id, registration_id, amount, mode, cash_amount, upi_amount, upi_transaction_id, paid_date')
      .is('deleted_at', null)
      .order('paid_date', { ascending: false }),
    supabase.from('locations').select('id, name').order('name'),
    supabase.from('events').select('id, name').order('event_date', { ascending: false }),
  ]);

  const registrationById = new Map((registrations ?? []).map((r) => [r.id, r]));
  const eventName = new Map((events ?? []).map((e) => [e.id, e.name]));
  const locationName = new Map((locations ?? []).map((l) => [l.id, l.name]));
  const payments = (allPayments ?? []).filter((p) => registrationById.has(p.registration_id));

  const totalExpected = (registrations ?? []).reduce((sum, r) => sum + (r.fee_amount ?? 0), 0);
  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalPending = totalExpected - totalCollected;

  const byMode: Record<string, number> = { cash: 0, upi: 0, cash_upi: 0 };
  const byLocation = new Map<string, number>();
  const byEvent = new Map<string, number>();
  let totalCash = 0;
  let totalUpi = 0;
  for (const p of payments) {
    byMode[p.mode] = (byMode[p.mode] ?? 0) + p.amount;
    if (p.mode === 'cash_upi') {
      totalCash += p.cash_amount ?? 0;
      totalUpi += p.upi_amount ?? 0;
    } else if (p.mode === 'cash') {
      totalCash += p.amount;
    } else if (p.mode === 'upi') {
      totalUpi += p.amount;
    }
    const registration = registrationById.get(p.registration_id);
    if (!registration) continue;
    if (registration.location_id) {
      byLocation.set(registration.location_id, (byLocation.get(registration.location_id) ?? 0) + p.amount);
    }
    byEvent.set(registration.event_id, (byEvent.get(registration.event_id) ?? 0) + p.amount);
  }

  const filteredPayments = payments
    .filter((p) => {
      if (!params.location) return true;
      return registrationById.get(p.registration_id)?.location_id === params.location;
    })
    .filter((p) => (params.event ? registrationById.get(p.registration_id)?.event_id === params.event : true))
    .filter((p) => (params.mode ? p.mode === params.mode : true));

  const cards = [
    { label: 'Total fee expected', value: totalExpected.toFixed(2) },
    { label: 'Total collected', value: totalCollected.toFixed(2) },
    { label: 'Total pending', value: totalPending.toFixed(2) },
  ];

  return (
    <AppShell active="event-fees" userEmail={user?.email}>
      <div className="space-y-8">
        <div>
          <Link href="/events" className="text-sm underline">
            ← Back to events
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {cards.map((c) => (
            <div key={c.label} className="rounded-[var(--radius)] border border-border p-4">
              <p className="text-xs text-muted">{c.label}</p>
              <p className="mt-1 text-2xl font-semibold">{c.value}</p>
            </div>
          ))}
        </div>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[var(--radius)] border border-border p-4">
            <p className="text-xs text-muted">Total Cash</p>
            <p className="mt-1 text-2xl font-semibold">{totalCash.toFixed(2)}</p>
          </div>
          <div className="rounded-[var(--radius)] border border-border p-4">
            <p className="text-xs text-muted">Total UPI</p>
            <p className="mt-1 text-2xl font-semibold">{totalUpi.toFixed(2)}</p>
          </div>
        </section>

        <section className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-[var(--radius)] border border-border p-4">
            <h2 className="mb-3 text-sm font-semibold">Collected by payment mode</h2>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between">
                <dt>Cash</dt>
                <dd>{(byMode.cash ?? 0).toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>UPI</dt>
                <dd>{(byMode.upi ?? 0).toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Cash + UPI</dt>
                <dd>{(byMode.cash_upi ?? 0).toFixed(2)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-1 font-semibold">
                <dt>All</dt>
                <dd>{totalCollected.toFixed(2)}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-[var(--radius)] border border-border p-4">
            <h2 className="mb-3 text-sm font-semibold">Collected by location</h2>
            <dl className="space-y-1 text-sm">
              {(locations ?? []).map((l) => (
                <div key={l.id} className="flex justify-between">
                  <dt>{l.name}</dt>
                  <dd>{(byLocation.get(l.id) ?? 0).toFixed(2)}</dd>
                </div>
              ))}
              <div className="flex justify-between">
                <dt>Unattributed (public)</dt>
                <dd>{(totalCollected - Array.from(byLocation.values()).reduce((s, v) => s + v, 0)).toFixed(2)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-1 font-semibold">
                <dt>All</dt>
                <dd>{totalCollected.toFixed(2)}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-[var(--radius)] border border-border p-4">
            <h2 className="mb-3 text-sm font-semibold">Collected by event</h2>
            <dl className="space-y-1 text-sm">
              {(events ?? []).map((e) => (
                <div key={e.id} className="flex justify-between">
                  <dt>{e.name}</dt>
                  <dd>{(byEvent.get(e.id) ?? 0).toFixed(2)}</dd>
                </div>
              ))}
              <div className="flex justify-between border-t border-border pt-1 font-semibold">
                <dt>All</dt>
                <dd>{totalCollected.toFixed(2)}</dd>
              </div>
            </dl>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold">All event payments</h2>
          <form className="mb-4 flex flex-wrap gap-3" method="get">
            <select name="location" defaultValue={params.location ?? ''} className={FIELD_CLASS}>
              <option value="">All locations</option>
              {(locations ?? []).map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
            <select name="event" defaultValue={params.event ?? ''} className={FIELD_CLASS}>
              <option value="">All events</option>
              {(events ?? []).map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
            <select name="mode" defaultValue={params.mode ?? ''} className={FIELD_CLASS}>
              <option value="">All payment modes</option>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="cash_upi">Cash + UPI</option>
            </select>
            <button type="submit" className="rounded-[var(--radius)] border border-border px-3 py-2 text-sm">
              Filter
            </button>
          </form>

          {!filteredPayments.length ? (
            <EmptyState title="No payments" message="No payments match this filter." />
          ) : (
            <div className="overflow-x-auto rounded-[var(--radius)] border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/10 text-left">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Event</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Mode</th>
                    <th className="p-3">UPI txn ID</th>
                    <th className="p-3">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((p) => {
                    const registration = registrationById.get(p.registration_id);
                    return (
                      <tr key={p.id} className="border-t border-border">
                        <td className="p-3">{p.paid_date}</td>
                        <td className="p-3">
                          {registration ? (
                            <Link href={`/events/${registration.event_id}`} className="underline">
                              {eventName.get(registration.event_id) ?? '-'}
                            </Link>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="p-3">
                          {registration?.location_id ? (locationName.get(registration.location_id) ?? '-') : 'Unattributed'}
                        </td>
                        <td className="p-3">{paymentModeLabel(p.mode)}</td>
                        <td className="p-3">{p.upi_transaction_id ?? '-'}</td>
                        <td className="p-3">{p.amount.toFixed(2)}</td>
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
