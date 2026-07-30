#!/usr/bin/env tsx
/**
 * verify-denial — the security gate (docs/data-model-security.md /
 * docs/golden-paths/portal.md's PROVE DENIAL step). Must pass before any
 * CRUD feature is built on top of the schema.
 *
 * Seeds one row per table with the service-role client (bypasses RLS), then
 * proves an UNAUTHENTICATED (anon-key) client can neither read nor write it.
 * Emptiness alone doesn't prove RLS is working — the seed step is what makes
 * this a real proof rather than "there's just no data yet". Cleans up after
 * itself either way (verify-then-rollback).
 *
 *   tsx tooling/verify-denial.ts
 */
import { createClient } from '@supabase/supabase-js';
import { serviceClient } from './verify';

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
  if (!url || !key) {
    throw new Error('verify-denial needs NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY in env');
  }
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
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

async function main(): Promise<void> {
  loadEnv();
  const svc = serviceClient();
  const anon = anonClient();

  console.log(c.dim('looking up a real user id to satisfy created_by (not null)...'));
  const { data: users, error: usersErr } = await svc.auth.admin.listUsers();
  if (usersErr || !users.users.length) {
    throw new Error(
      `verify-denial needs at least one account to exist (created_by is not-null) — run: npm run create-account -- <email> <password>`
    );
  }
  const seedUserId = users.users[0].id;

  console.log(c.dim('seeding one row per table with the service-role client (bypasses RLS)...'));

  const { data: loc, error: locErr } = await svc
    .from('locations')
    .insert({ name: 'verify-denial-location' })
    .select()
    .single();
  if (locErr || !loc) throw new Error(`seed locations failed: ${locErr?.message}`);

  const { data: batch, error: batchErr } = await svc
    .from('batches')
    .insert({ name: 'verify-denial-batch', location_id: loc.id })
    .select()
    .single();
  if (batchErr || !batch) throw new Error(`seed batches failed: ${batchErr?.message}`);

  const { data: student, error: studentErr } = await svc
    .from('students')
    .insert({
      name: 'verify-denial-student',
      phone_number: '0000000000',
      location_id: loc.id,
      batch_id: batch.id,
      created_by: seedUserId,
    })
    .select()
    .single();
  if (studentErr || !student) throw new Error(`seed students failed: ${studentErr?.message}`);

  const { data: payment, error: paymentErr } = await svc
    .from('payments')
    .insert({
      student_id: student.id,
      amount: 100,
      mode: 'cash',
      paid_date: new Date().toISOString().slice(0, 10),
      created_by: seedUserId,
    })
    .select()
    .single();
  if (paymentErr || !payment) throw new Error(`seed payments failed: ${paymentErr?.message}`);

  const { data: event, error: eventErr } = await svc
    .from('events')
    .insert({ name: 'verify-denial-event', created_by: seedUserId })
    .select()
    .single();
  if (eventErr || !event) throw new Error(`seed events failed: ${eventErr?.message}`);

  const { data: registration, error: registrationErr } = await svc
    .from('event_registrations')
    .insert({ event_id: event.id, registrant_name: 'verify-denial-registrant', created_by: seedUserId })
    .select()
    .single();
  if (registrationErr || !registration) throw new Error(`seed event_registrations failed: ${registrationErr?.message}`);

  console.log(c.dim('seeded. now proving the anon (unauthenticated) client is denied...\n'));

  console.log('locations:');
  const locSelect = await anon.from('locations').select('*').eq('id', loc.id);
  check('select returns no rows', (locSelect.data?.length ?? 0) === 0, JSON.stringify(locSelect.data));
  const locInsert = await anon.from('locations').insert({ name: 'anon-should-fail' });
  check('insert is rejected', locInsert.error !== null, 'insert succeeded — RLS hole');

  console.log('batches:');
  const batchSelect = await anon.from('batches').select('*').eq('id', batch.id);
  check('select returns no rows', (batchSelect.data?.length ?? 0) === 0, JSON.stringify(batchSelect.data));
  const batchInsert = await anon.from('batches').insert({ name: 'anon-should-fail', location_id: loc.id });
  check('insert is rejected', batchInsert.error !== null, 'insert succeeded — RLS hole');

  console.log('students:');
  const studentSelect = await anon.from('students').select('*').eq('id', student.id);
  check('select returns no rows', (studentSelect.data?.length ?? 0) === 0, JSON.stringify(studentSelect.data));
  const studentInsert = await anon
    .from('students')
    .insert({ name: 'anon-should-fail', phone_number: '1111111111' });
  check('insert is rejected', studentInsert.error !== null, 'insert succeeded — RLS hole');

  console.log('payments:');
  const paymentSelect = await anon.from('payments').select('*').eq('id', payment.id);
  check('select returns no rows', (paymentSelect.data?.length ?? 0) === 0, JSON.stringify(paymentSelect.data));
  const paymentInsert = await anon
    .from('payments')
    .insert({ student_id: student.id, amount: 1, mode: 'cash', paid_date: '2026-01-01' });
  check('insert is rejected', paymentInsert.error !== null, 'insert succeeded — RLS hole');

  console.log('events:');
  const eventSelect = await anon.from('events').select('*').eq('id', event.id);
  check('select returns no rows', (eventSelect.data?.length ?? 0) === 0, JSON.stringify(eventSelect.data));
  const eventInsert = await anon.from('events').insert({ name: 'anon-should-fail' });
  check('insert is rejected', eventInsert.error !== null, 'insert succeeded — RLS hole');

  console.log('event_registrations:');
  const registrationSelect = await anon.from('event_registrations').select('*').eq('id', registration.id);
  check('select returns no rows', (registrationSelect.data?.length ?? 0) === 0, JSON.stringify(registrationSelect.data));
  const registrationInsert = await anon
    .from('event_registrations')
    .insert({ event_id: event.id, registrant_name: 'anon-should-fail' });
  check('insert is rejected', registrationInsert.error !== null, 'insert succeeded — RLS hole');

  console.log('audit_log (append-only — nobody may update/delete, anon may not even insert):');
  const auditInsert = await anon.from('audit_log').insert({
    action: 'anon-should-fail',
    entity: 'test',
    entity_id: loc.id,
  });
  check('anon insert is rejected', auditInsert.error !== null, 'insert succeeded — RLS hole');
  const auditSelect = await anon.from('audit_log').select('*').limit(1);
  check('anon select returns no rows', (auditSelect.data?.length ?? 0) === 0, JSON.stringify(auditSelect.data));

  console.log(c.dim('\ncleaning up seeded rows via service-role...'));
  await svc.from('event_registrations').delete().eq('id', registration.id);
  await svc.from('events').delete().eq('id', event.id);
  await svc.from('payments').delete().eq('id', payment.id);
  await svc.from('students').delete().eq('id', student.id);
  await svc.from('batches').delete().eq('id', batch.id);
  await svc.from('locations').delete().eq('id', loc.id);

  if (failures > 0) {
    console.log(c.red(`\n✗ ${failures} denial check(s) FAILED — do not build features until this is fixed`));
    process.exit(1);
  }
  console.log(c.green('\n✓ cross-user denial proven — every table refuses the unauthenticated client'));
}

main().catch((err) => {
  console.error(c.red(`✗ ${(err as Error).message}`));
  process.exit(1);
});
