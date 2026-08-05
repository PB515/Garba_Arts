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

  const aalay = await signedInAs('aalay-admin@thegarbaarts.local', PASSWORD);
  const sportsclub = await signedInAs('sportsclub-admin@thegarbaarts.local', PASSWORD);
  const superAdmin = await signedInAs('owner@thegarbaarts.local', PASSWORD);
  const triage = await signedInAs('triage-admin@thegarbaarts.local', PASSWORD);

  const { data: locations } = await superAdmin.from('locations').select('id, name');
  const aalayLoc = locations?.find((l) => l.name === 'Aalay');
  const sportsclubLoc = locations?.find((l) => l.name === 'Sportsclub');
  if (!aalayLoc || !sportsclubLoc) throw new Error('expected both Aalay and Sportsclub locations to exist');

  console.log(c.dim('positive controls (each admin sees their OWN location)...'));
  const { data: aalayOwn } = await aalay.from('students').select('id').eq('location_id', aalayLoc.id).limit(1);
  check('Aalay admin can see Aalay students', (aalayOwn?.length ?? 0) > 0, 'expected at least 1 row from demo seed');

  const { data: sportsclubOwn } = await sportsclub
    .from('students')
    .select('id')
    .eq('location_id', sportsclubLoc.id)
    .limit(1);
  check('Sportsclub admin can see Sportsclub students', (sportsclubOwn?.length ?? 0) > 0, 'expected at least 1 row from demo seed');

  console.log(c.dim('\ncross-location denial (the actual proof)...'));
  const { data: aalaySeesSportsclub } = await aalay.from('students').select('id').eq('location_id', sportsclubLoc.id);
  check('Aalay admin sees 0 Sportsclub students', (aalaySeesSportsclub?.length ?? 0) === 0, JSON.stringify(aalaySeesSportsclub));

  const { data: sportsclubSeesAalay } = await sportsclub.from('students').select('id').eq('location_id', aalayLoc.id);
  check('Sportsclub admin sees 0 Aalay students', (sportsclubSeesAalay?.length ?? 0) === 0, JSON.stringify(sportsclubSeesAalay));

  console.log(c.dim('\ncross-location write denial...'));
  const insertAttempt = await aalay
    .from('students')
    .insert({ name: 'cross-location-should-fail', phone_number: '0000000000', location_id: sportsclubLoc.id });
  check('Aalay admin cannot insert a Sportsclub-location student', insertAttempt.error !== null, 'insert succeeded — RLS hole');

  console.log(c.dim('\npayments follow the same scoping (via the parent student)...'));
  const { data: sportsclubStudentForPayment } = await superAdmin
    .from('students')
    .select('id')
    .eq('location_id', sportsclubLoc.id)
    .limit(1)
    .single();
  if (sportsclubStudentForPayment) {
    const { data: aalaySeesPayment } = await aalay
      .from('payments')
      .select('id')
      .eq('student_id', sportsclubStudentForPayment.id);
    check(
      'Aalay admin sees 0 payments for a Sportsclub student',
      (aalaySeesPayment?.length ?? 0) === 0,
      JSON.stringify(aalaySeesPayment)
    );
  }

  console.log(c.dim('\nsuper_admin sees both locations merged...'));
  const { data: superAalay } = await superAdmin.from('students').select('id').eq('location_id', aalayLoc.id).limit(1);
  const { data: superSportsclub } = await superAdmin
    .from('students')
    .select('id')
    .eq('location_id', sportsclubLoc.id)
    .limit(1);
  check('super_admin sees Aalay students', (superAalay?.length ?? 0) > 0);
  check('super_admin sees Sportsclub students', (superSportsclub?.length ?? 0) > 0);

  console.log(c.dim('\nevent_registrations follow the same location scoping (0015)...'));
  const {
    data: { user: superAdminUser },
  } = await superAdmin.auth.getUser();
  if (!superAdminUser) throw new Error('could not resolve the signed-in super_admin user');
  const { data: seededEvent, error: seedEventError } = await superAdmin
    .from('events')
    .insert({ name: '[VERIFY] location-scoping test event', created_by: superAdminUser.id })
    .select('id')
    .single();
  if (!seededEvent) throw new Error(`could not seed a test event: ${seedEventError?.message}`);

  const { data: aalayReg } = await superAdmin
    .from('event_registrations')
    .insert({ event_id: seededEvent.id, registrant_name: '[VERIFY] Aalay registrant', location_id: aalayLoc.id })
    .select('id')
    .single();
  const { data: sportsclubReg } = await superAdmin
    .from('event_registrations')
    .insert({ event_id: seededEvent.id, registrant_name: '[VERIFY] Sportsclub registrant', location_id: sportsclubLoc.id })
    .select('id')
    .single();
  const { data: unattributedReg } = await superAdmin
    .from('event_registrations')
    .insert({ event_id: seededEvent.id, registrant_name: '[VERIFY] unattributed (public-style) registrant', location_id: null })
    .select('id')
    .single();
  if (!aalayReg || !sportsclubReg || !unattributedReg) throw new Error('could not seed test registrations');

  const { data: aalaySeesOwnReg } = await aalay.from('event_registrations').select('id').eq('id', aalayReg.id);
  check('Aalay admin sees its own location\'s registration', (aalaySeesOwnReg?.length ?? 0) === 1);

  const { data: aalaySeesSportsclubReg } = await aalay.from('event_registrations').select('id').eq('id', sportsclubReg.id);
  check('Aalay admin sees 0 Sportsclub registrations', (aalaySeesSportsclubReg?.length ?? 0) === 0, JSON.stringify(aalaySeesSportsclubReg));

  const { data: sportsclubSeesAalayReg } = await sportsclub.from('event_registrations').select('id').eq('id', aalayReg.id);
  check('Sportsclub admin sees 0 Aalay registrations', (sportsclubSeesAalayReg?.length ?? 0) === 0, JSON.stringify(sportsclubSeesAalayReg));

  const { data: aalaySeesUnattributed } = await aalay.from('event_registrations').select('id').eq('id', unattributedReg.id);
  const { data: sportsclubSeesUnattributed } = await sportsclub.from('event_registrations').select('id').eq('id', unattributedReg.id);
  check(
    'Neither location admin sees an unattributed (public-style) registration',
    (aalaySeesUnattributed?.length ?? 0) === 0 && (sportsclubSeesUnattributed?.length ?? 0) === 0,
    JSON.stringify({ aalaySeesUnattributed, sportsclubSeesUnattributed })
  );

  const { data: superSeesAll } = await superAdmin
    .from('event_registrations')
    .select('id')
    .in('id', [aalayReg.id, sportsclubReg.id, unattributedReg.id]);
  check('super_admin sees all 3 (both locations + unattributed)', (superSeesAll?.length ?? 0) === 3);

  const crossLocationRegInsert = await aalay
    .from('event_registrations')
    .insert({ event_id: seededEvent.id, registrant_name: '[VERIFY] should fail', location_id: sportsclubLoc.id });
  check(
    'Aalay admin cannot insert a Sportsclub-location registration',
    crossLocationRegInsert.error !== null,
    'insert succeeded — RLS hole'
  );

  console.log(c.dim('\nevent_attendees inherit scoping from their parent registration...'));
  const { data: attendeeUnderAalayReg } = await superAdmin
    .from('event_attendees')
    .insert({ registration_id: aalayReg.id, name: '[VERIFY] attendee under Aalay reg' })
    .select('id')
    .single();
  if (attendeeUnderAalayReg) {
    const { data: aalaySeesAttendee } = await aalay.from('event_attendees').select('id').eq('id', attendeeUnderAalayReg.id);
    check('Aalay admin sees an attendee under its own registration', (aalaySeesAttendee?.length ?? 0) === 1);

    const { data: sportsclubSeesAttendee } = await sportsclub
      .from('event_attendees')
      .select('id')
      .eq('id', attendeeUnderAalayReg.id);
    check(
      'Sportsclub admin sees 0 attendees under an Aalay registration',
      (sportsclubSeesAttendee?.length ?? 0) === 0,
      JSON.stringify(sportsclubSeesAttendee)
    );
  }

  console.log(c.dim('\ncleaning up seeded event-registration rows via super_admin...'));
  await superAdmin.from('event_attendees').delete().eq('registration_id', aalayReg.id);
  await superAdmin.from('event_registrations').delete().eq('event_id', seededEvent.id);
  await superAdmin.from('events').delete().eq('id', seededEvent.id);

  console.log(c.dim('\nLead tier: an unclaimed (location_id null) student is visible to BOTH admins (0017)...'));
  const { data: superAdminUser2 } = await superAdmin.auth.getUser();
  if (!superAdminUser2.user) throw new Error('could not resolve the signed-in super_admin user');
  const { data: seededLead, error: seedLeadError } = await superAdmin
    .from('students')
    .insert({
      name: '[VERIFY] unclaimed lead',
      phone_number: '0000000001',
      location_id: null,
      created_by: superAdminUser2.user.id,
    })
    .select('id')
    .single();
  if (!seededLead) throw new Error(`could not seed a test lead: ${seedLeadError?.message}`);

  const { data: aalaySeesLead } = await aalay.from('students').select('id').eq('id', seededLead.id);
  check('Aalay admin sees the unclaimed lead', (aalaySeesLead?.length ?? 0) === 1, JSON.stringify(aalaySeesLead));

  const { data: sportsclubSeesLead } = await sportsclub.from('students').select('id').eq('id', seededLead.id);
  check(
    'Sportsclub admin ALSO sees the same unclaimed lead',
    (sportsclubSeesLead?.length ?? 0) === 1,
    JSON.stringify(sportsclubSeesLead)
  );

  console.log(c.dim('\nclaiming a lead into the wrong location is rejected by claim_lead() (0020)...'));
  const wrongClaim = await aalay.rpc('claim_lead', { p_student_id: seededLead.id, p_location_id: sportsclubLoc.id });
  const { data: afterWrongClaim } = await superAdmin.from('students').select('location_id').eq('id', seededLead.id).single();
  check(
    "Aalay admin's attempt to claim the lead into Sportsclub is rejected, and it stays unclaimed",
    wrongClaim.error !== null && afterWrongClaim?.location_id === null,
    `wrongClaim.error=${wrongClaim.error?.message ?? 'none'}, location_id after=${afterWrongClaim?.location_id}`
  );

  console.log(c.dim('\nclaiming a lead into your OWN location succeeds, then it disappears from the other admin...'));
  const rightClaim = await aalay.rpc('claim_lead', { p_student_id: seededLead.id, p_location_id: aalayLoc.id });
  check('Aalay admin can claim the lead into Aalay', rightClaim.error === null, rightClaim.error?.message);

  const { data: sportsclubSeesClaimedLead } = await sportsclub.from('students').select('id').eq('id', seededLead.id);
  check(
    'Sportsclub admin no longer sees it once claimed by Aalay',
    (sportsclubSeesClaimedLead?.length ?? 0) === 0,
    JSON.stringify(sportsclubSeesClaimedLead)
  );

  const { data: aalayStillSeesClaimedLead } = await aalay.from('students').select('id').eq('id', seededLead.id);
  check('Aalay admin still sees the lead it just claimed', (aalayStillSeesClaimedLead?.length ?? 0) === 1);

  console.log(c.dim('\ntriage_admin: sees the shared pool, can claim into EITHER location, access ends there (0018/0019)...'));
  const { data: freshLead, error: freshLeadError } = await superAdmin
    .from('students')
    .insert({
      name: '[VERIFY] triage_admin lead',
      phone_number: '0000000002',
      location_id: null,
      created_by: superAdminUser2.user.id,
    })
    .select('id')
    .single();
  if (!freshLead) throw new Error(`could not seed a fresh test lead: ${freshLeadError?.message}`);

  const { data: triageSeesFreshLead } = await triage.from('students').select('id').eq('id', freshLead.id);
  check('triage_admin sees a freshly-unclaimed lead', (triageSeesFreshLead?.length ?? 0) === 1);

  const triageClaimAalay = await triage.rpc('claim_lead', { p_student_id: freshLead.id, p_location_id: aalayLoc.id });
  check('triage_admin can claim a lead into Aalay', triageClaimAalay.error === null, triageClaimAalay.error?.message);

  const { data: triageSeesAfterAalayClaimNoLongerVisible } = await triage
    .from('students')
    .select('id')
    .eq('id', freshLead.id);
  check(
    "triage_admin's own access ends the moment it's claimed — can't see it anymore",
    (triageSeesAfterAalayClaimNoLongerVisible?.length ?? 0) === 0,
    JSON.stringify(triageSeesAfterAalayClaimNoLongerVisible)
  );

  if (aalayOwn?.[0]?.id) {
    const { data: triageSeesRealAalayStudent } = await triage
      .from('students')
      .select('id')
      .eq('id', aalayOwn[0].id);
    check(
      'triage_admin sees 0 real (already-located) students in general, not just the one it claimed',
      (triageSeesRealAalayStudent?.length ?? 0) === 0,
      JSON.stringify(triageSeesRealAalayStudent)
    );
  }

  // A second fresh lead, to prove triage_admin can also claim into
  // Sportsclub — unlike a location_admin, who's locked to one location.
  const { data: freshLead2, error: freshLead2Error } = await superAdmin
    .from('students')
    .insert({
      name: '[VERIFY] triage_admin lead 2',
      phone_number: '0000000003',
      location_id: null,
      created_by: superAdminUser2.user.id,
    })
    .select('id')
    .single();
  if (!freshLead2) throw new Error(`could not seed a second fresh test lead: ${freshLead2Error?.message}`);

  const triageClaimSportsclub = await triage.rpc('claim_lead', {
    p_student_id: freshLead2.id,
    p_location_id: sportsclubLoc.id,
  });
  check(
    'triage_admin can ALSO claim a lead into Sportsclub (not locked to one location, unlike a location_admin)',
    triageClaimSportsclub.error === null,
    triageClaimSportsclub.error?.message
  );
  const { data: afterTriageSportsclubClaim } = await superAdmin
    .from('students')
    .select('location_id')
    .eq('id', freshLead2.id)
    .single();
  check(
    'the Sportsclub claim actually took effect',
    afterTriageSportsclubClaim?.location_id === sportsclubLoc.id
  );

  console.log(c.dim('\njoined_headcount_by_batch(): aggregate-only, gated to super_admin/triage_admin (0018)...'));
  const { data: triageHeadcount } = await triage.rpc('joined_headcount_by_batch');
  check('triage_admin gets real aggregate headcount data', (triageHeadcount?.length ?? 0) > 0, JSON.stringify(triageHeadcount));

  const { data: superHeadcount } = await superAdmin.rpc('joined_headcount_by_batch');
  check('super_admin also gets real aggregate headcount data', (superHeadcount?.length ?? 0) > 0);

  const { data: aalayHeadcount } = await aalay.rpc('joined_headcount_by_batch');
  check(
    'a plain location_admin gets 0 rows from the aggregate function (not authorized, no error, just empty)',
    (aalayHeadcount?.length ?? 0) === 0,
    JSON.stringify(aalayHeadcount)
  );

  console.log(c.dim('\ncleaning up the seeded leads via super_admin...'));
  await superAdmin.from('students').delete().eq('id', seededLead.id);
  await superAdmin.from('students').delete().eq('id', freshLead.id);
  await superAdmin.from('students').delete().eq('id', freshLead2.id);

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
