#!/usr/bin/env tsx
/**
 * verify-location-denial — proves the location-scoped RLS from
 * 0008_roles_and_location_scoping.sql actually holds, for real signed-in
 * users, not just the anon-vs-authenticated boundary verify-denial.ts
 * already covers.
 *
 * Requires the two test location-admin accounts + the super-admin account
 * to already exist (see CLAUDE.md decision for the exact test emails) and
 * real students to exist at both locations (the demo seed provides this).
 *
 *   tsx tooling/verify-location-denial.ts
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

function anonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) throw new Error('needs NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function signedInAs(email: string, password: string) {
  const client = anonClient();
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`sign-in failed for ${email}: ${error.message}`);
  return client;
}

const c = {
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
};

let failures = 0;
function check(label: string, ok: boolean, detail?: string): void {
  if (ok) {
    console.log(c.green(`  ✓ ${label}`));
  } else {
    failures++;
    console.log(c.red(`  ✗ ${label}${detail ? ` — ${detail}` : ''}`));
  }
}

const PASSWORD = 'TempPass123!';

async function main(): Promise<void> {
  loadEnv();

  const aliya = await signedInAs('aliya-admin@thegarbaarts.local', PASSWORD);
  const sportsclub = await signedInAs('sportsclub-admin@thegarbaarts.local', PASSWORD);
  const superAdmin = await signedInAs('owner@thegarbaarts.local', PASSWORD);

  const { data: locations } = await superAdmin.from('locations').select('id, name');
  const aliyaLoc = locations?.find((l) => l.name === 'Aliya');
  const sportsclubLoc = locations?.find((l) => l.name === 'Sportsclub');
  if (!aliyaLoc || !sportsclubLoc) throw new Error('expected both Aliya and Sportsclub locations to exist');

  console.log(c.dim('positive controls (each admin sees their OWN location)...'));
  const { data: aliyaOwn } = await aliya.from('students').select('id').eq('location_id', aliyaLoc.id).limit(1);
  check('Aliya admin can see Aliya students', (aliyaOwn?.length ?? 0) > 0, 'expected at least 1 row from demo seed');

  const { data: sportsclubOwn } = await sportsclub
    .from('students')
    .select('id')
    .eq('location_id', sportsclubLoc.id)
    .limit(1);
  check('Sportsclub admin can see Sportsclub students', (sportsclubOwn?.length ?? 0) > 0, 'expected at least 1 row from demo seed');

  console.log(c.dim('\ncross-location denial (the actual proof)...'));
  const { data: aliyaSeesSportsclub } = await aliya.from('students').select('id').eq('location_id', sportsclubLoc.id);
  check('Aliya admin sees 0 Sportsclub students', (aliyaSeesSportsclub?.length ?? 0) === 0, JSON.stringify(aliyaSeesSportsclub));

  const { data: sportsclubSeesAliya } = await sportsclub.from('students').select('id').eq('location_id', aliyaLoc.id);
  check('Sportsclub admin sees 0 Aliya students', (sportsclubSeesAliya?.length ?? 0) === 0, JSON.stringify(sportsclubSeesAliya));

  console.log(c.dim('\ncross-location write denial...'));
  const insertAttempt = await aliya
    .from('students')
    .insert({ name: 'cross-location-should-fail', phone_number: '0000000000', location_id: sportsclubLoc.id });
  check('Aliya admin cannot insert a Sportsclub-location student', insertAttempt.error !== null, 'insert succeeded — RLS hole');

  console.log(c.dim('\npayments follow the same scoping (via the parent student)...'));
  const { data: sportsclubStudentForPayment } = await superAdmin
    .from('students')
    .select('id')
    .eq('location_id', sportsclubLoc.id)
    .limit(1)
    .single();
  if (sportsclubStudentForPayment) {
    const { data: aliyaSeesPayment } = await aliya
      .from('payments')
      .select('id')
      .eq('student_id', sportsclubStudentForPayment.id);
    check(
      'Aliya admin sees 0 payments for a Sportsclub student',
      (aliyaSeesPayment?.length ?? 0) === 0,
      JSON.stringify(aliyaSeesPayment)
    );
  }

  console.log(c.dim('\nsuper_admin sees both locations merged...'));
  const { data: superAliya } = await superAdmin.from('students').select('id').eq('location_id', aliyaLoc.id).limit(1);
  const { data: superSportsclub } = await superAdmin
    .from('students')
    .select('id')
    .eq('location_id', sportsclubLoc.id)
    .limit(1);
  check('super_admin sees Aliya students', (superAliya?.length ?? 0) > 0);
  check('super_admin sees Sportsclub students', (superSportsclub?.length ?? 0) > 0);

  if (failures > 0) {
    console.log(c.red(`\n✗ ${failures} check(s) FAILED — location scoping is not correctly enforced`));
    process.exit(1);
  }
  console.log(c.green('\n✓ location scoping proven: each admin sees only their own location; super_admin sees both'));
}

main().catch((err) => {
  console.error(c.red(`✗ ${(err as Error).message}`));
  process.exit(1);
});
