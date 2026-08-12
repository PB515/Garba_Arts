import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/app/app-shell';
import { EmptyState } from '@/lib/patterns/empty-state';
import {
  updateEvent,
  permanentlyDeleteEvent,
  createRegistration,
  updateRegistration,
  archiveRegistration,
  permanentlyDeleteRegistration,
} from '../actions';
import { getStaffRole, isSuperAdmin } from '@/lib/roles';
import { RegistrationEditRow } from '../registration-edit-row';
import { AttendeeRows } from '../attendee-rows';
import { SubmitButton } from '@/lib/patterns/submit-button';

const FIELD_CLASS = 'rounded-[var(--radius)] border border-border px-3 py-2 text-sm';

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const staffRole = await getStaffRole();
  const superAdmin = isSuperAdmin(staffRole);

  const [{ data: event, error }, { data: registrations }, { data: allLocations }] = await Promise.all([
    supabase.from('events').select('*').eq('id', id).single(),
    supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false }),
    supabase.from('locations').select('id, name').order('name'),
  ]);

  if (error || !event) notFound();

  // A location_admin only ever has one real choice, so the registration
  // form's location field ends up with a single, effectively-locked option -
  // same pattern the student add form already uses.
  const locations = superAdmin
    ? (allLocations ?? [])
    : (allLocations ?? []).filter((l) => l.id === staffRole?.locationId);
  const locationName = new Map((allLocations ?? []).map((l) => [l.id, l.name]));

  const registrationIds = (registrations ?? []).map((r) => r.id);
  const { data: attendees } = registrationIds.length
    ? await supabase
        .from('event_attendees')
        .select('id, registration_id, name, phone_number, whatsapp_number')
        .in('registration_id', registrationIds)
    : {
        data: [] as { id: string; registration_id: string; name: string; phone_number: string | null; whatsapp_number: string | null }[],
      };

  const attendeesByRegistration = new Map<
    string,
    { name: string; phone: string; whatsapp: string }[]
  >();
  for (const a of attendees ?? []) {
    const list = attendeesByRegistration.get(a.registration_id) ?? [];
    list.push({ name: a.name, phone: a.phone_number ?? '', whatsapp: a.whatsapp_number ?? '' });
    attendeesByRegistration.set(a.registration_id, list);
  }

  const boundUpdate = updateEvent.bind(null, id);
  const boundPermanentDelete = permanentlyDeleteEvent.bind(null, id);
  const boundCreateRegistration = createRegistration.bind(null, id);

  const totalHeadcount = (registrations ?? []).reduce(
    (sum, r) => sum + 1 + (attendeesByRegistration.get(r.id)?.length ?? 0),
    0
  );
  const totalFeeExpected = (registrations ?? []).reduce((sum, r) => sum + (r.fee_amount ?? 0), 0);
  const totalCollected = (registrations ?? []).reduce((sum, r) => sum + r.amount_paid, 0);

  // By-location breakdown - super_admin only, since a location_admin's
  // registrations list is already RLS-filtered to their own location, so
  // the combined summary above is already correct for them without this.
  // "Unattributed" tracks public self-registrations (location_id null),
  // which stay invisible to every location_admin but must still show up
  // somewhere for the numbers to visibly reconcile against the combined total.
  const byLocation = new Map<string, { headcount: number; feeExpected: number; collected: number }>();
  let unattributed = { headcount: 0, feeExpected: 0, collected: 0 };
  for (const r of registrations ?? []) {
    const names = attendeesByRegistration.get(r.id)?.length ?? 0;
    const entry = r.location_id ? (byLocation.get(r.location_id) ?? { headcount: 0, feeExpected: 0, collected: 0 }) : unattributed;
    entry.headcount += 1 + names;
    entry.feeExpected += r.fee_amount ?? 0;
    entry.collected += r.amount_paid;
    if (r.location_id) byLocation.set(r.location_id, entry);
  }

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
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="public_registration_enabled" defaultChecked={event.public_registration_enabled} />
              Allow public self-registration for this event
            </label>
            <SubmitButton className="rounded-[var(--radius)] bg-accent px-3 py-2 text-sm font-medium text-accent-foreground">
              Save
            </SubmitButton>
          </form>

          {event.public_registration_enabled ? (
            <p className="border-t border-border pt-3 text-sm">
              Public link: <code>/events/{id}/register</code>
            </p>
          ) : null}

          <div className="border-t border-border pt-3 text-sm">
            <form action={boundPermanentDelete}>
              <SubmitButton className="text-red-600 underline">
                Permanently remove event (and its registrations)
              </SubmitButton>
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

          {superAdmin ? (
            <div className="mt-4 border-t border-border pt-3">
              <h3 className="mb-2 text-xs font-semibold text-muted">Registered by location</h3>
              <dl className="space-y-1 text-sm">
                {(allLocations ?? []).map((l) => {
                  const entry = byLocation.get(l.id);
                  return (
                    <div key={l.id} className="flex justify-between">
                      <dt>{l.name}</dt>
                      <dd>{entry?.headcount ?? 0}</dd>
                    </div>
                  );
                })}
                <div className="flex justify-between">
                  <dt>Unattributed (public)</dt>
                  <dd>{unattributed.headcount}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-1 font-semibold">
                  <dt>All</dt>
                  <dd>{totalHeadcount}</dd>
                </div>
              </dl>
            </div>
          ) : null}
        </section>
      </div>

      <section className="mt-8 rounded-[var(--radius)] border border-border p-4">
        <h2 className="mb-3 text-sm font-semibold">Add registration</h2>
        <form action={boundCreateRegistration} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <input name="registrant_name" placeholder="Registrant full name" required className={FIELD_CLASS} />
          <input name="registrant_phone" placeholder="Phone (optional)" className={FIELD_CLASS} />
          <select
            name="location_id"
            required
            defaultValue={!superAdmin ? locations[0]?.id : ''}
            className={FIELD_CLASS}
          >
            <option value="" disabled>
              Location
            </option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
          <input name="fee_amount" type="number" step="0.01" placeholder="Fee (leave blank if free)" className={FIELD_CLASS} />
          <input name="amount_paid" type="number" step="0.01" placeholder="Amount paid" defaultValue="0" className={FIELD_CLASS} />
          <AttendeeRows key={registrations?.length ?? 0} fieldClass={FIELD_CLASS} />
          <input name="remarks" placeholder="Remarks" className={`col-span-2 sm:col-span-3 ${FIELD_CLASS}`} />
          <SubmitButton className="rounded-[var(--radius)] bg-accent px-3 py-2 text-sm font-medium text-accent-foreground">
            Add
          </SubmitButton>
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
                  <th className="p-3">Location</th>
                  <th className="p-3">Coming with them</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Fee</th>
                  <th className="p-3">Paid</th>
                  <th className="p-3">Remarks</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((r) => {
                  const attendeesForRow = attendeesByRegistration.get(r.id) ?? [];
                  return (
                    <RegistrationEditRow
                      key={r.id}
                      registration={{
                        id: r.id,
                        registrant_name: r.registrant_name,
                        registrant_phone: r.registrant_phone,
                        location_id: r.location_id,
                        fee_amount: r.fee_amount,
                        amount_paid: r.amount_paid,
                        remarks: r.remarks,
                      }}
                      attendees={attendeesForRow}
                      locations={locations}
                      locationLabel={r.location_id ? (locationName.get(r.location_id) ?? '-') : 'Unattributed'}
                      updateAction={updateRegistration.bind(null, r.id, id)}
                      archiveAction={archiveRegistration.bind(null, r.id, id)}
                      removeAction={permanentlyDeleteRegistration.bind(null, r.id, id)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppShell>
  );
}
