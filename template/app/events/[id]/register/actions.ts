'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { HONEYPOT_FIELD, failsHoneypot, clientIp, rateLimit } from '@/lib/security';
import { str, parseAttendeeRows } from '@/lib/form';

/**
 * The only public write path for event registrations — same pattern as
 * /navratri: service-role client, no direct anon RLS grant. Unlike
 * Navratri there's no price to compute server-side, but the same
 * "don't trust a public form's own account of the world" instinct applies:
 * re-check `public_registration_enabled` here rather than trusting that the
 * page wouldn't have rendered the form otherwise.
 */
export async function submitEventRegistration(eventId: string, formData: FormData): Promise<{ error: string } | void> {
  if (failsHoneypot(formData.get(HONEYPOT_FIELD))) {
    redirect(`/events/${eventId}/register/thank-you`);
  }

  const ip = clientIp(await headers());
  const limit = rateLimit(`event-register:${eventId}:${ip}`, 5, 60_000);
  if (!limit.ok) {
    return { error: 'Too many attempts. Wait a minute and try again.' };
  }

  const supabase = createServiceRoleClient();

  const { data: event } = await supabase
    .from('events')
    .select('id, public_registration_enabled')
    .eq('id', eventId)
    .maybeSingle();
  if (!event || !event.public_registration_enabled) {
    return { error: 'Registration is not open for this event.' };
  }

  const registrant_name = str(formData, 'registrant_name');
  if (!registrant_name) {
    return { error: 'Name is required.' };
  }

  const { data: registration, error } = await supabase
    .from('event_registrations')
    .insert({
      event_id: eventId,
      registrant_name,
      registrant_phone: str(formData, 'registrant_phone'),
      remarks: str(formData, 'remarks'),
    })
    .select('id')
    .single();

  if (error || !registration) {
    return { error: 'Something went wrong. Please try again.' };
  }

  const attendeeRows = parseAttendeeRows(formData);
  if (attendeeRows.length) {
    await supabase.from('event_attendees').insert(
      attendeeRows.map((a) => ({
        registration_id: registration.id,
        name: a.name,
        phone_number: a.phone,
        whatsapp_number: a.whatsapp,
      }))
    );
  }

  redirect(`/events/${eventId}/register/thank-you`);
}
