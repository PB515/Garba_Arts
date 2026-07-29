'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { clientIp, rateLimit } from '@/lib/security';

export async function signIn(formData: FormData): Promise<{ error: string } | void> {
  const ip = clientIp(await headers());
  const limit = rateLimit(`login:${ip}`, 5, 60_000);
  if (!limit.ok) {
    return { error: 'Too many attempts. Wait a minute and try again.' };
  }

  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const next = String(formData.get('next') ?? '/dashboard');

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: 'Invalid email or password.' };
  }

  redirect(next.startsWith('/') ? next : '/dashboard');
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
