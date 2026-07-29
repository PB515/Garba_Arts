/**
 * Supabase — SERVICE-ROLE client (4 of the 4-client split). CROWN JEWELS.
 *
 * Use when: a trusted server-only task must BYPASS RLS — webhooks, cron jobs,
 * admin back-office writes, the verify/seed harness. Uses the service-role key,
 * which ignores every row-level policy.
 *
 * NEVER import this into a Client Component or anything bundled to the browser.
 * The `server-only` import makes that a build error, not a silent leak.
 */
import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export function createServiceRoleClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
