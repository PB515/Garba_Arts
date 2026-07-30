'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { writeAuditLog } from '@/lib/patterns/audit-log';
import { requireUser, str, num } from '@/lib/form';

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

  const { error: regError } = await supabase.from('event_registrations').delete().eq('event_id', eventId);
  if (regError) throw new Error(`Could not remove registrations: ${regError.message}`);

  const { error } = await supabase.from('events').delete().eq('id', eventId);
  if (error) throw new Error(`Could not permanently remove event: ${error.message}`);

  await writeAuditLog(supabase, {
    actorId: user.id,
    action: 'event.permanently_deleted',
    entity: 'event',
    entityId: eventId,
    meta: { snapshot: existing ?? null, registrations: registrations ?? [] },
  });

  revalidatePath('/events');
  redirect('/events');
}

export async function createRegistration(eventId: string, formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();

  const registrant_name = str(formData, 'registrant_name');
  if (!registrant_name) throw new Error('Registrant name is required.');

  const { error } = await supabase.from('event_registrations').insert({
    event_id: eventId,
    registrant_name,
    registrant_phone: str(formData, 'registrant_phone'),
    friend_count: num(formData, 'friend_count') ?? 0,
    fee_amount: num(formData, 'fee_amount'),
    amount_paid: num(formData, 'amount_paid') ?? 0,
    remarks: str(formData, 'remarks'),
    created_by: user.id,
  });

  if (error) throw new Error(`Could not add registration: ${error.message}`);

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

  const { error } = await supabase
    .from('event_registrations')
    .update({
      registrant_name,
      registrant_phone: str(formData, 'registrant_phone'),
      friend_count: num(formData, 'friend_count') ?? 0,
      fee_amount: num(formData, 'fee_amount'),
      amount_paid: num(formData, 'amount_paid') ?? 0,
      remarks: str(formData, 'remarks'),
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', registrationId);

  if (error) throw new Error(`Could not save registration: ${error.message}`);

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

  const { error } = await supabase.from('event_registrations').delete().eq('id', registrationId);
  if (error) throw new Error(`Could not permanently remove registration: ${error.message}`);

  await writeAuditLog(supabase, {
    actorId: user.id,
    action: 'event_registration.permanently_deleted',
    entity: 'event_registration',
    entityId: registrationId,
    meta: { snapshot: existing ?? null },
  });

  revalidatePath(`/events/${eventId}`);
}
