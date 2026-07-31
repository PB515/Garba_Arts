#!/usr/bin/env tsx
/**
 * create-account — invite-only account creation for core team members.
 *
 * There is no public sign-up page (app-prd.md: accounts are invite-only,
 * created by the core team). This script uses the service-role admin API to
 * create a confirmed account directly — no email flow needed.
 *
 * Every account needs a role (0008_roles_and_location_scoping.sql):
 *
 *   tsx tooling/create-account.ts <email> <password> super_admin
 *   tsx tooling/create-account.ts <email> <password> location_admin "Aliya"
 *
 * Safe to re-run against an email that already has an account — it looks
 * the user up instead of failing, and (re-)assigns the role, so this also
 * doubles as "fix someone's role."
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

  const [, , email, password, role, locationName] = process.argv;
  if (!email || !password || !role) {
    console.error('usage: tsx tooling/create-account.ts <email> <password> super_admin');
    console.error('       tsx tooling/create-account.ts <email> <password> location_admin "<location name>"');
    process.exit(1);
  }
  if (role !== 'super_admin' && role !== 'location_admin') {
    console.error(`✗ role must be "super_admin" or "location_admin", got "${role}"`);
    process.exit(1);
  }
  if (role === 'location_admin' && !locationName) {
    console.error('✗ location_admin needs a location name as the 4th argument');
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    throw new Error('create-account needs NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in env');
  }

  const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  let userId: string;
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });

  if (error) {
    if (!/already.*registered|already.*exists/i.test(error.message)) {
      console.error(`✗ ${error.message}`);
      process.exit(1);
    }
    const { data: existing, error: listErr } = await admin.auth.admin.listUsers();
    const found = listErr ? undefined : existing.users.find((u) => u.email === email);
    if (!found) {
      console.error(`✗ ${email} already exists but could not be looked up: ${listErr?.message}`);
      process.exit(1);
    }
    userId = found.id;
    console.log(`  (account already existed: ${email} — assigning/updating role only)`);
  } else {
    userId = data.user!.id;
    console.log(`✓ account created: ${email} (${userId})`);
  }

  let locationId: string | null = null;
  if (role === 'location_admin') {
    const { data: location, error: locErr } = await admin
      .from('locations')
      .select('id, name')
      .ilike('name', locationName)
      .maybeSingle();
    if (locErr || !location) {
      console.error(`✗ no location found matching "${locationName}": ${locErr?.message ?? 'not found'}`);
      process.exit(1);
    }
    locationId = location.id;
  }

  const { error: roleErr } = await admin
    .from('staff_roles')
    .upsert({ user_id: userId, role, location_id: locationId });

  if (roleErr) {
    console.error(`✗ account exists but role assignment failed: ${roleErr.message}`);
    process.exit(1);
  }

  console.log(`✓ role set: ${role}${locationId ? ` (location: ${locationName})` : ''}`);
}

main();
