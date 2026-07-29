/**
 * Supabase — BROWSER client (1 of the 4-client split).
 *
 * Use when: you need Supabase from a Client Component (`'use client'`) — e.g.
 * interactive forms, realtime subscriptions, client-side auth actions.
 * Runs with the anon key under the user's RLS policies. Never holds secrets.
 */
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
