#!/usr/bin/env tsx
/**
 * create-account — invite-only account creation for core team members.
 *
 * There is no public sign-up page (app-prd.md: accounts are invite-only,
 * created by the core team). This script uses the service-role admin API to
 * create a confirmed account directly — no email flow needed for a 5–8
 * person team.
 *
 *   tsx tooling/create-account.ts <email> <temp-password>
 *
 * SAFETY: uses SUPABASE_SERVICE_ROLE_KEY — never run this against production
 * without knowing exactly whose account you're creating.
 */
import { createClient } from '@supabase/supabase-js';

function loadEnv(): void {
  for (const f of ['.env.local', '.env']) {
    try {
      process.loadEnvFile(f);
    } catch {
      /* absent — fine */
    }
  }
}

async function main(): Promise<void> {
  loadEnv();

  const [, , email, password] = process.argv;
  if (!email || !password) {
    console.error('usage: tsx tooling/create-account.ts <email> <temp-password>');
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    throw new Error('create-account needs NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in env');
  }

  const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    console.error(`✗ ${error.message}`);
    process.exit(1);
  }

  console.log(`✓ account created: ${data.user?.email} (${data.user?.id})`);
}

main();
