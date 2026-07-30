'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { HONEYPOT_FIELD, failsHoneypot, clientIp, rateLimit } from '@/lib/security';
import { currentNavratriTier } from '@/lib/navratri-config';
import { str, num } from '@/lib/form';

/**
 * The only write path to navratri_registrations for the public. No RLS
 * grant exists for anon (see 0007_navratri_registrations.sql) — this uses
 * the service-role client deliberately, because the price must be computed
 * HERE, server-side, from the real clock. A direct anon insert would let a
 * client submit whatever price it wants.
 */
export async function submitRegistration(formData: FormData): Promise<{ error: string } | void> {
  if (failsHoneypot(formData.get(HONEYPOT_FIELD))) {
    // Bots fill hidden fields; silently pretend success rather than tipping
    // them off that they were caught.
    redirect('/navratri/thank-you');
  }

  const ip = clientIp(await headers());
  const limit = rateLimit(`navratri:${ip}`, 5, 60_000);
  if (!limit.ok) {
    return { error: 'Too many attempts. Wait a minute and try again.' };
  }

  const tier = currentNavratriTier();
  if (tier.status === 'closed') {
    return { error: 'Registration is closed.' };
  }

  const representative_name = str(formData, 'representative_name');
  const representative_phone = str(formData, 'representative_phone');
  const pass_count = num(formData, 'pass_count');

  if (!representative_name || !representative_phone) {
    return { error: 'Name and phone are required.' };
  }
  if (!pass_count || pass_count < 1) {
    return { error: 'Enter how many passes you need (at least 1).' };
  }

  const total_amount = tier.pricePerPass * pass_count;

  const supabase = createServiceRoleClient();
  const { error } = await supabase.from('navratri_registrations').insert({
    representative_name,
    representative_phone,
    pass_count,
    price_per_pass: tier.pricePerPass,
    total_amount,
    remarks: str(formData, 'remarks'),
  });

  if (error) {
    return { error: 'Something went wrong. Please try again.' };
  }

  redirect('/navratri/thank-you');
}
