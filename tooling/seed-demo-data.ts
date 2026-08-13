#!/usr/bin/env tsx
/**
 * seed-demo-data — fills the app with clearly-tagged fake data so the owner
 * can demo it to people before real students exist in the system.
 *
 * Every row this script creates has `remarks` starting with "[DEMO]" so it
 * can be found and removed later in one pass, without touching real data
 * once it exists.
 *
 *   tsx tooling/seed-demo-data.ts          seed ~50 students + 3 events
 *   tsx tooling/seed-demo-data.ts --clear   delete everything tagged [DEMO]
 */
import { createClient } from '@supabase/supabase-js';

const DEMO_TAG = '[DEMO]';

function loadEnv(): void {
  for (const f of ['.env.local', '.env']) {
    try {
      process.loadEnvFile(f);
    } catch {
      /* absent — fine */
    }
  }
}

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) throw new Error('seed-demo-data needs NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in env');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

const c = {
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
};

const FIRST_NAMES = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
  'Rohan', 'Kabir', 'Aryan', 'Dev', 'Yash', 'Ananya', 'Diya', 'Saanvi', 'Aadhya', 'Kiara',
  'Myra', 'Anika', 'Riya', 'Ira', 'Pari', 'Navya', 'Zara', 'Aarohi', 'Meera', 'Sara',
  'Neha', 'Karan', 'Priya', 'Rahul', 'Simran',
];
const LAST_NAMES = [
  'Patel', 'Shah', 'Mehta', 'Desai', 'Joshi', 'Trivedi', 'Pandya', 'Modi', 'Chauhan', 'Gohil',
  'Rana', 'Vaghela', 'Solanki', 'Parekh', 'Thakkar',
];
const SOURCES = ['whatsapp', 'instagram', 'referral', 'walk-in', 'other'];
const STATUSES = ['inquiry', 'demo_scheduled', 'demo_done', 'joined', 'joined', 'joined', 'not_interested', 'dropped'];
const REFERRERS = ['Priya Shah', 'Karan Mehta', "a friend's parent", 'Neha Joshi'];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randomPhone(): string {
  return `9${Math.floor(100000000 + Math.random() * 899999999)}`;
}
function randomDateWithinDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * days));
  return d.toISOString().slice(0, 10);
}

async function seed(): Promise<void> {
  const svc = serviceClient();

  const { data: users, error: usersErr } = await svc.auth.admin.listUsers();
  if (usersErr || !users.users.length) {
    throw new Error('seed-demo-data needs at least one account to exist — run: npm run create-account -- <email> <password>');
  }
  const seedUserId = users.users[0].id;

  const { data: locations, error: locErr } = await svc.from('locations').select('id, name');
  if (locErr || !locations?.length) throw new Error(`no locations found: ${locErr?.message ?? 'run 0004 migration first'}`);

  const { data: batches, error: batchErr } = await svc.from('batches').select('id, name, location_id');
  if (batchErr || !batches?.length) throw new Error(`no batches found: ${batchErr?.message}`);

  console.log(c.dim(`seeding students against ${locations.length} locations / ${batches.length} batches...`));

  let studentsCreated = 0;
  let paymentsCreated = 0;

  for (let i = 0; i < 50; i++) {
    const location = pick(locations);
    const batchesAtLocation = batches.filter((b) => b.location_id === location.id);
    const batch = batchesAtLocation.length ? pick(batchesAtLocation) : pick(batches);
    const source = pick(SOURCES);
    const status = pick(STATUSES);
    const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
    const hasFee = status !== 'inquiry' && status !== 'not_interested';
    const feeTotal = hasFee ? [2500, 3000, 3500, 4000, 5000][Math.floor(Math.random() * 5)] : null;

    const { data: student, error: studentErr } = await svc
      .from('students')
      .insert({
        name,
        phone_number: randomPhone(),
        source,
        referred_by: source === 'referral' ? pick(REFERRERS) : null,
        status,
        location_id: location.id,
        batch_id: batch.id,
        inquiry_date: randomDateWithinDays(60),
        fee_total: feeTotal,
        remarks: `${DEMO_TAG} generated for demo purposes`,
        created_by: seedUserId,
      })
      .select('id')
      .single();

    if (studentErr || !student) {
      console.error(`  ✗ failed to create student ${i + 1}: ${studentErr?.message}`);
      continue;
    }
    studentsCreated++;

    if (hasFee && feeTotal) {
      // Roughly a third unpaid, a third partially paid, a third fully paid.
      const paidFraction = [0, 0.5, 1][Math.floor(Math.random() * 3)];
      if (paidFraction > 0) {
        const amount = Math.round(feeTotal * paidFraction);
        const { error: paymentErr } = await svc.from('payments').insert({
          student_id: student.id,
          amount,
          mode: Math.random() > 0.5 ? 'cash' : 'upi',
          paid_date: randomDateWithinDays(30),
          remarks: DEMO_TAG,
          created_by: seedUserId,
        });
        if (!paymentErr) paymentsCreated++;
      }
    }
  }

  console.log(c.green(`✓ ${studentsCreated} students created, ${paymentsCreated} payments logged`));

  console.log(c.dim('seeding events...'));
  const eventDefs = [
    { name: `${DEMO_TAG} Garba Practice Meetup`, event_date: randomDateWithinDays(-14), description: 'Open practice session for all batches', registrations: 6 },
    { name: `${DEMO_TAG} Navratri Kickoff Night`, event_date: randomDateWithinDays(-30), description: 'Season opening celebration', registrations: 9 },
    { name: `${DEMO_TAG} Annual Dandiya Showcase`, event_date: randomDateWithinDays(7), description: 'Year-end performance showcase', registrations: 5 },
  ];

  let eventsCreated = 0;
  let registrationsCreated = 0;

  for (const def of eventDefs) {
    const { data: event, error: eventErr } = await svc
      .from('events')
      .insert({
        name: def.name,
        slug: `${def.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}-${Date.now()}`,
        event_date: def.event_date,
        description: def.description,
        created_by: seedUserId,
      })
      .select('id')
      .single();

    if (eventErr || !event) {
      console.error(`  ✗ failed to create event "${def.name}": ${eventErr?.message}`);
      continue;
    }
    eventsCreated++;

    for (let i = 0; i < def.registrations; i++) {
      const feeAmount = Math.random() > 0.3 ? 0 : null; // most demo events are free
      const { error: regErr } = await svc.from('event_registrations').insert({
        event_id: event.id,
        registrant_name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
        registrant_phone: randomPhone(),
        fee_amount: feeAmount === null ? null : feeAmount,
        remarks: DEMO_TAG,
        created_by: seedUserId,
      });
      if (!regErr) registrationsCreated++;
    }
  }

  console.log(c.green(`✓ ${eventsCreated} events created, ${registrationsCreated} registrations logged`));
  console.log(c.dim(`\nAll demo rows are tagged "${DEMO_TAG}" in remarks — run with --clear to remove them later.`));
}

async function clear(): Promise<void> {
  const svc = serviceClient();
  console.log(c.dim(`removing all rows tagged "${DEMO_TAG}"...`));

  const { data: demoStudents } = await svc.from('students').select('id').ilike('remarks', `${DEMO_TAG}%`);
  const studentIds = (demoStudents ?? []).map((s) => s.id);
  if (studentIds.length) {
    await svc.from('payments').delete().in('student_id', studentIds);
    await svc.from('students').delete().in('id', studentIds);
  }
  await svc.from('payments').delete().ilike('remarks', `${DEMO_TAG}%`);

  const { data: demoEvents } = await svc.from('events').select('id').ilike('name', `${DEMO_TAG}%`);
  const eventIds = (demoEvents ?? []).map((e) => e.id);
  if (eventIds.length) {
    await svc.from('event_registrations').delete().in('event_id', eventIds);
    await svc.from('events').delete().in('id', eventIds);
  }

  console.log(c.green(`✓ removed ${studentIds.length} demo students and ${eventIds.length} demo events (with their payments/registrations)`));
}

async function main(): Promise<void> {
  loadEnv();
  if (process.argv.includes('--clear')) {
    await clear();
  } else {
    await seed();
  }
}

main().catch((err) => {
  console.error(`✗ ${(err as Error).message}`);
  process.exit(1);
});
