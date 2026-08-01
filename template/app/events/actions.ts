'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { writeAuditLog } from '@/lib/patterns/audit-log';
import { requireUser, str, num, parseAttendeeRows } from '@/lib/form';

export async function createEvent(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();

  const name = str(formData, 'name');
  if (!name) throw new Error('Event name is required.');

  const { data, error } = await supabase
    .from('events')
    .insert({
      name,
      event_date: str(formData, 'event_date'),
      description: str(formData, 'description'),
      created_by: user.id,
    })
    .select('id')
    .single();

  if (error) throw new Error(`Could not add event: ${error.message}`);

  revalidatePath('/events');
  redirect(`/events/${data.id}`);
}

export async function updateEvent(eventId: string, formData: FormData): Promise<void> {
  const { supabase } = await requireUser();

  const name = str(formData, 'name');
  if (!name) throw new Error('Event name is required.');

  const { error } = await supabase
    .from('events')
    .update({
      name,
      event_date: str(formData, 'event_date'),
      description: str(formData, 'description'),
      public_registration_enabled: formData.get('public_registration_enabled') === 'on',
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

  if (registrationIds.length) {
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

  await writeAuditLog(supabase, {
    actorId: user.id,
    action: 'event.permanently_deleted',
    entity: 'event',
    entityId: eventId,
    meta: { snapshot: existing ?? null, registrations: registrations ?? [], attendees: attendees ?? [] },
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
      amount_paid: num(formData, 'amount_paid') ?? 0,
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
      amount_paid: num(formData, 'amount_paid') ?? 0,
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

  const { error: attendeesError } = await supabase.from('event_attendees').delete().eq('registration_id', registrationId);
  if (attendeesError) throw new Error(`Could not remove attendees: ${attendeesError.message}`);

  const { error } = await supabase.from('event_registrations').delete().eq('id', registrationId);
  if (error) throw new Error(`Could not permanently remove registration: ${error.message}`);

  await writeAuditLog(supabase, {
    actorId: user.id,
    action: 'event_registration.permanently_deleted',
    entity: 'event_registration',
    entityId: registrationId,
    meta: { snapshot: existing ?? null, attendees: attendees ?? [] },
  });

  revalidatePath(`/events/${eventId}`);
}
