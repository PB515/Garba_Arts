'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { writeAuditLog } from '@/lib/patterns/audit-log';
import { requireUser, str, num, parseAttendeeRows, slugify } from '@/lib/form';
import type { createClient } from '@/lib/supabase/server';

// decision #89: one square-ish upload has to work as both a circular crop
// (the poster ring) and a wide banner (desktop layout, thank-you page, the
// og:image link preview) - so it's validated for real, not just accepted
// as-is. The client-side `accept` attribute is a UX nicety only; this is
// the actual guard, same "server is the real lock" split as everywhere else.
const ALLOWED_BANNER_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_BANNER_BYTES = 5 * 1024 * 1024;

/**
 * Uploads an event's poster banner to the public `event-banners` bucket
 * (0031) and returns its public URL. Only called when a real file was
 * actually chosen (decision #83) - the upload input is optional, so an
 * empty file selection is silently skipped rather than erroring.
 */
async function uploadEventBanner(
  supabase: Awaited<ReturnType<typeof createClient>>,
  eventId: string,
  file: File,
): Promise<string> {
  if (!ALLOWED_BANNER_TYPES.has(file.type)) {
    throw new Error('Banner image must be a JPG, PNG, or WebP file.');
  }
  if (file.size > MAX_BANNER_BYTES) {
    throw new Error('Banner image must be under 5MB.');
  }

  const path = `${eventId}/${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from('event-banners').upload(path, file, { upsert: true });
  if (error) throw new Error(`Could not upload banner image: ${error.message}`);
  const { data } = supabase.storage.from('event-banners').getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Finds a free slug for the short /e/[slug] link (0032/decision #85) - tries
 * the plain kebab-cased name first, then an incrementing -2/-3/... suffix on
 * a real collision (two events with the same or similar name).
 */
async function uniqueEventSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  name: string,
): Promise<string> {
  const base = slugify(name);
  let slug = base;
  let suffix = 2;
  while (true) {
    const { data: existing } = await supabase.from('events').select('id').eq('slug', slug).maybeSingle();
    if (!existing) return slug;
    slug = `${base}-${suffix}`;
    suffix++;
  }
}

export async function createEvent(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();

  const name = str(formData, 'name');
  if (!name) throw new Error('Event name is required.');

  const slug = await uniqueEventSlug(supabase, name);

  const { data, error } = await supabase
    .from('events')
    .insert({
      name,
      slug,
      event_date: str(formData, 'event_date'),
      description: str(formData, 'description'),
      created_by: user.id,
    })
    .select('id')
    .single();

  if (error) throw new Error(`Could not add event: ${error.message}`);

  const bannerFile = formData.get('banner_image');
  if (bannerFile instanceof File && bannerFile.size > 0) {
    const banner_image_url = await uploadEventBanner(supabase, data.id, bannerFile);
    await supabase.from('events').update({ banner_image_url }).eq('id', data.id);
  }

  revalidatePath('/events');
  redirect(`/events/${data.id}`);
}

export async function updateEvent(eventId: string, formData: FormData): Promise<void> {
  const { supabase } = await requireUser();

  const name = str(formData, 'name');
  if (!name) throw new Error('Event name is required.');

  const bannerFile = formData.get('banner_image');
  let banner_image_url: string | undefined;
  if (bannerFile instanceof File && bannerFile.size > 0) {
    banner_image_url = await uploadEventBanner(supabase, eventId, bannerFile);
    // Replacing a banner shouldn't leave the old file orphaned in Storage.
    const { data: current } = await supabase.from('events').select('banner_image_url').eq('id', eventId).single();
    const oldPath = current?.banner_image_url?.split('/event-banners/')[1];
    if (oldPath) await supabase.storage.from('event-banners').remove([oldPath]);
  }

  const { error } = await supabase
    .from('events')
    .update({
      name,
      event_date: str(formData, 'event_date'),
      description: str(formData, 'description'),
      fee_per_person: num(formData, 'fee_per_person'),
      venue: str(formData, 'venue'),
      public_registration_enabled: formData.get('public_registration_enabled') === 'on',
      show_in_gallery: formData.get('show_in_gallery') === 'on',
      ...(banner_image_url ? { banner_image_url } : {}),
    })
    .eq('id', eventId);

  if (error) throw new Error(`Could not save event: ${error.message}`);

  revalidatePath('/events');
  revalidatePath(`/events/${eventId}`);
}

export async function permanentlyDeleteEvent(eventId: string): Promise<void> {
  const { supabase, user } = await requireUser();

  const { data: existing } = await supabase.from('events').select('*').eq('id', eventId).single();
  const { data: registrations } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('event_id', eventId);
  const registrationIds = (registrations ?? []).map((r) => r.id);
  const { data: attendees } = registrationIds.length
    ? await supabase.from('event_attendees').select('*').in('registration_id', registrationIds)
    : { data: [] as unknown[] };
  const { data: payments } = registrationIds.length
    ? await supabase.from('event_payments').select('*').in('registration_id', registrationIds)
    : { data: [] as unknown[] };
  const { data: broadcasts } = await supabase.from('event_broadcasts').select('*').eq('event_id', eventId);
  const broadcastIds = (broadcasts ?? []).map((b) => b.id);

  if (broadcastIds.length) {
    const { error: sendsError } = await supabase.from('event_broadcast_sends').delete().in('broadcast_id', broadcastIds);
    if (sendsError) throw new Error(`Could not remove broadcast send records: ${sendsError.message}`);

    const { error: broadcastsError } = await supabase.from('event_broadcasts').delete().in('id', broadcastIds);
    if (broadcastsError) throw new Error(`Could not remove updates: ${broadcastsError.message}`);
  }

  if (registrationIds.length) {
    const { error: paymentsError } = await supabase
      .from('event_payments')
      .delete()
      .in('registration_id', registrationIds);
    if (paymentsError) throw new Error(`Could not remove payments: ${paymentsError.message}`);

    const { error: attendeesError } = await supabase
      .from('event_attendees')
      .delete()
      .in('registration_id', registrationIds);
    if (attendeesError) throw new Error(`Could not remove attendees: ${attendeesError.message}`);
  }

  const { error: regError } = await supabase.from('event_registrations').delete().eq('event_id', eventId);
  if (regError) throw new Error(`Could not remove registrations: ${regError.message}`);

  const { error } = await supabase.from('events').delete().eq('id', eventId);
  if (error) throw new Error(`Could not permanently remove event: ${error.message}`);

  // The banner lives in Storage, not the events row - deleting the row
  // alone would leave it orphaned there forever.
  if (existing?.banner_image_url) {
    const path = existing.banner_image_url.split('/event-banners/')[1];
    if (path) await supabase.storage.from('event-banners').remove([path]);
  }

  await writeAuditLog(supabase, {
    actorId: user.id,
    action: 'event.permanently_deleted',
    entity: 'event',
    entityId: eventId,
    meta: {
      snapshot: existing ?? null,
      registrations: registrations ?? [],
      attendees: attendees ?? [],
      payments: payments ?? [],
      broadcasts: broadcasts ?? [],
    },
  });

  revalidatePath('/events');
  redirect('/events');
}

export async function createRegistration(eventId: string, formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();

  const registrant_name = str(formData, 'registrant_name');
  if (!registrant_name) throw new Error('Registrant name is required.');

  // The event's own venue doesn't matter for scoping - the location lives on
  // the registration itself, so each admin's count reflects who registered
  // from their location, not where the event happens.
  const location_id = str(formData, 'location_id');
  if (!location_id) throw new Error('Location is required.');

  const { data: registration, error } = await supabase
    .from('event_registrations')
    .insert({
      event_id: eventId,
      registrant_name,
      registrant_phone: str(formData, 'registrant_phone'),
      location_id,
      fee_amount: num(formData, 'fee_amount'),
      remarks: str(formData, 'remarks'),
      created_by: user.id,
    })
    .select('id')
    .single();

  if (error) throw new Error(`Could not add registration: ${error.message}`);

  const attendeeRows = parseAttendeeRows(formData);
  if (attendeeRows.length) {
    const { error: attendeesError } = await supabase.from('event_attendees').insert(
      attendeeRows.map((a) => ({
        registration_id: registration.id,
        name: a.name,
        phone_number: a.phone,
        whatsapp_number: a.whatsapp,
      }))
    );
    if (attendeesError) throw new Error(`Could not add attendees: ${attendeesError.message}`);
  }

  revalidatePath(`/events/${eventId}`);
}

export async function updateRegistration(
  registrationId: string,
  eventId: string,
  formData: FormData
): Promise<void> {
  const { supabase, user } = await requireUser();

  const registrant_name = str(formData, 'registrant_name');
  if (!registrant_name) throw new Error('Registrant name is required.');

  const location_id = str(formData, 'location_id');
  if (!location_id) throw new Error('Location is required.');

  const { error } = await supabase
    .from('event_registrations')
    .update({
      registrant_name,
      registrant_phone: str(formData, 'registrant_phone'),
      location_id,
      fee_amount: num(formData, 'fee_amount'),
      remarks: str(formData, 'remarks'),
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', registrationId);

  if (error) throw new Error(`Could not save registration: ${error.message}`);

  // Replace the attendee list wholesale rather than diffing - simpler and
  // matches the dynamic-rows form's own "this is the current full list" mental model.
  const { error: clearError } = await supabase.from('event_attendees').delete().eq('registration_id', registrationId);
  if (clearError) throw new Error(`Could not update attendees: ${clearError.message}`);

  const attendeeRows = parseAttendeeRows(formData);
  if (attendeeRows.length) {
    const { error: attendeesError } = await supabase.from('event_attendees').insert(
      attendeeRows.map((a) => ({
        registration_id: registrationId,
        name: a.name,
        phone_number: a.phone,
        whatsapp_number: a.whatsapp,
      }))
    );
    if (attendeesError) throw new Error(`Could not update attendees: ${attendeesError.message}`);
  }

  revalidatePath(`/events/${eventId}`);
}

export async function archiveRegistration(registrationId: string, eventId: string): Promise<void> {
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from('event_registrations')
    .update({ deleted_by: user.id, deleted_at: new Date().toISOString() })
    .eq('id', registrationId);
  if (error) throw new Error(`Could not archive registration: ${error.message}`);

  revalidatePath(`/events/${eventId}`);
}

export async function permanentlyDeleteRegistration(registrationId: string, eventId: string): Promise<void> {
  const { supabase, user } = await requireUser();

  const { data: existing } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('id', registrationId)
    .single();
  const { data: attendees } = await supabase.from('event_attendees').select('*').eq('registration_id', registrationId);
  const { data: payments } = await supabase.from('event_payments').select('*').eq('registration_id', registrationId);
  const { data: broadcastSends } = await supabase
    .from('event_broadcast_sends')
    .select('*')
    .eq('registration_id', registrationId);

  const { error: sendsError } = await supabase.from('event_broadcast_sends').delete().eq('registration_id', registrationId);
  if (sendsError) throw new Error(`Could not remove broadcast send records: ${sendsError.message}`);

  const { error: paymentsError } = await supabase.from('event_payments').delete().eq('registration_id', registrationId);
  if (paymentsError) throw new Error(`Could not remove payments: ${paymentsError.message}`);

  const { error: attendeesError } = await supabase.from('event_attendees').delete().eq('registration_id', registrationId);
  if (attendeesError) throw new Error(`Could not remove attendees: ${attendeesError.message}`);

  const { error } = await supabase.from('event_registrations').delete().eq('id', registrationId);
  if (error) throw new Error(`Could not permanently remove registration: ${error.message}`);

  await writeAuditLog(supabase, {
    actorId: user.id,
    action: 'event_registration.permanently_deleted',
    entity: 'event_registration',
    entityId: registrationId,
    meta: { snapshot: existing ?? null, attendees: attendees ?? [], payments: payments ?? [], broadcastSends: broadcastSends ?? [] },
  });

  revalidatePath(`/events/${eventId}`);
}

/**
 * The event-side "Log payment" action (decision #86) - mirrors students'
 * addPayment exactly (same mode/split validation, same whole-rupee rule),
 * against event_payments instead of payments. Unlike students, there's no
 * hard lock requiring fee_amount to be set first - the owner never asked for
 * one here, and a registration's fee is optional/nullable by design (free
 * events exist), so inventing that lock would block a legitimate free-event
 * "log a donation" case nobody asked to prevent.
 */
export async function addEventPayment(
  registrationId: string,
  eventId: string,
  _prevState: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const { supabase, user } = await requireUser();

  const mode = str(formData, 'mode');
  const paid_date = str(formData, 'paid_date');
  if (!mode || !paid_date) return { error: 'Mode and date are required.' };

  let amount: number | null;
  let cash_amount: number | null = null;
  let upi_amount: number | null = null;
  if (mode === 'cash_upi') {
    cash_amount = num(formData, 'cash_amount');
    upi_amount = num(formData, 'upi_amount');
    if (!cash_amount || cash_amount <= 0 || !upi_amount || upi_amount <= 0) {
      return { error: 'Both cash amount and UPI amount are required for a split payment.' };
    }
    if (!Number.isInteger(cash_amount) || !Number.isInteger(upi_amount)) {
      return { error: 'Amounts must be whole numbers.' };
    }
    amount = cash_amount + upi_amount;
  } else {
    amount = num(formData, 'amount');
    if (!amount || amount <= 0) return { error: 'Amount is required.' };
    if (!Number.isInteger(amount)) return { error: 'Amount must be a whole number.' };
  }

  const upi_transaction_id = mode === 'cash' ? null : str(formData, 'upi_transaction_id');

  const { error } = await supabase.from('event_payments').insert({
    registration_id: registrationId,
    amount,
    mode,
    cash_amount,
    upi_amount,
    upi_transaction_id,
    paid_date,
    remarks: str(formData, 'remarks'),
    created_by: user.id,
  });
  if (error) return { error: `Could not log payment: ${error.message}` };

  revalidatePath(`/events/${eventId}`);
  revalidatePath('/events/fees');
  return null;
}

/**
 * Takes eventId first, paymentId second (opposite order from addEventPayment
 * above) deliberately - the caller binds eventId once at the page level
 * (`.bind(null, eventId)`), leaving a plain `(paymentId) => Promise<void>`
 * that EventPaymentLog can bind per-row itself, one payment at a time.
 */
export async function permanentlyDeleteEventPayment(eventId: string, paymentId: string): Promise<void> {
  const { supabase } = await requireUser();

  const { error } = await supabase.from('event_payments').delete().eq('id', paymentId);
  if (error) throw new Error(`Could not remove payment: ${error.message}`);

  revalidatePath(`/events/${eventId}`);
  revalidatePath('/events/fees');
}

/**
 * Creates a new "update" for an event (decision #87) - either freshly typed
 * or started from a message_templates entry and edited (the form doesn't
 * distinguish the two once submitted, both just produce a message string
 * that may contain {name}/{event_name}/{event_date}/{venue} placeholders,
 * filled in per-recipient at render time via fillEventTemplate()).
 */
export async function createEventBroadcast(eventId: string, formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();

  const label = str(formData, 'label');
  const message = str(formData, 'message');
  if (!label || !message) throw new Error('Label and message are required.');

  const { error } = await supabase.from('event_broadcasts').insert({
    event_id: eventId,
    label,
    message,
    created_by: user.id,
  });
  if (error) throw new Error(`Could not create update: ${error.message}`);

  revalidatePath(`/events/${eventId}`);
}

export async function permanentlyDeleteEventBroadcast(eventId: string, broadcastId: string): Promise<void> {
  const { supabase } = await requireUser();

  const { error: sendsError } = await supabase.from('event_broadcast_sends').delete().eq('broadcast_id', broadcastId);
  if (sendsError) throw new Error(`Could not remove send records: ${sendsError.message}`);

  const { error } = await supabase.from('event_broadcasts').delete().eq('id', broadcastId);
  if (error) throw new Error(`Could not remove update: ${error.message}`);

  revalidatePath(`/events/${eventId}`);
}

/**
 * A "send" row only exists once staff manually confirms they actually sent
 * the message (decision #87's core point: clicking the WhatsApp button
 * doesn't guarantee it was sent, so this is a deliberate separate
 * confirmation, not auto-tied to the link). Absence of a row means "not
 * sent yet" - so a registrant added after the broadcast was created shows
 * up as pending automatically, no backfill needed.
 */
export async function markBroadcastSent(eventId: string, broadcastId: string, registrationId: string): Promise<void> {
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from('event_broadcast_sends')
    .insert({ broadcast_id: broadcastId, registration_id: registrationId, sent_by: user.id });
  if (error) throw new Error(`Could not mark as sent: ${error.message}`);

  revalidatePath(`/events/${eventId}`);
}

export async function unmarkBroadcastSent(eventId: string, broadcastId: string, registrationId: string): Promise<void> {
  const { supabase } = await requireUser();

  const { error } = await supabase
    .from('event_broadcast_sends')
    .delete()
    .eq('broadcast_id', broadcastId)
    .eq('registration_id', registrationId);
  if (error) throw new Error(`Could not undo: ${error.message}`);

  revalidatePath(`/events/${eventId}`);
}
