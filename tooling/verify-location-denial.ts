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

  // 0026 - every student/lead now needs a season_id (not-null column).
  const { data: season } = await superAdmin.from('seasons').select('id').eq('is_current', true).single();
  if (!season) throw new Error('expected a current season to exist');

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
    .insert({ name: 'cross-location-should-fail', phone_number: '0000000000', location_id: sportsclubLoc.id, season_id: season.id });
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
    .insert({
      name: '[VERIFY] location-scoping test event',
      slug: `verify-location-denial-event-${Date.now()}`,
      created_by: superAdminUser.id,
    })
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

  console.log(c.dim('\nevent_payments (0033) inherit scoping from their parent registration too, same pattern as event_attendees...'));
  const { data: paymentUnderAalayReg } = await superAdmin
    .from('event_payments')
    .insert({ registration_id: aalayReg.id, amount: 1, mode: 'cash', paid_date: '2026-01-01', created_by: superAdminUser.id })
    .select('id')
    .single();
  if (paymentUnderAalayReg) {
    const { data: aalaySeesPayment } = await aalay.from('event_payments').select('id').eq('id', paymentUnderAalayReg.id);
    check('Aalay admin sees a payment under its own registration', (aalaySeesPayment?.length ?? 0) === 1);

    const { data: sportsclubSeesPayment } = await sportsclub
      .from('event_payments')
      .select('id')
      .eq('id', paymentUnderAalayReg.id);
    check(
      'Sportsclub admin sees 0 payments under an Aalay registration',
      (sportsclubSeesPayment?.length ?? 0) === 0,
      JSON.stringify(sportsclubSeesPayment)
    );
  }

  console.log(c.dim('\nevent_broadcast_sends (0034) inherit scoping from their parent registration too...'));
  const { data: seededBroadcast } = await superAdmin
    .from('event_broadcasts')
    .insert({ event_id: seededEvent.id, label: '[VERIFY] broadcast', message: 'hi {name}', created_by: superAdminUser.id })
    .select('id')
    .single();
  let sendUnderAalayReg: { id: string } | null | undefined;
  if (seededBroadcast) {
    const { data } = await superAdmin
      .from('event_broadcast_sends')
      .insert({ broadcast_id: seededBroadcast.id, registration_id: aalayReg.id, sent_by: superAdminUser.id })
      .select('id')
      .single();
    sendUnderAalayReg = data;
  }
  if (sendUnderAalayReg) {
    const { data: aalaySeesSend } = await aalay.from('event_broadcast_sends').select('id').eq('id', sendUnderAalayReg.id);
    check('Aalay admin sees a broadcast-send under its own registration', (aalaySeesSend?.length ?? 0) === 1);

    const { data: sportsclubSeesSend } = await sportsclub
      .from('event_broadcast_sends')
      .select('id')
      .eq('id', sendUnderAalayReg.id);
    check(
      'Sportsclub admin sees 0 broadcast-sends under an Aalay registration',
      (sportsclubSeesSend?.length ?? 0) === 0,
      JSON.stringify(sportsclubSeesSend)
    );
  }

  console.log(c.dim('\ncleaning up seeded event-registration rows via super_admin...'));
  if (seededBroadcast) {
    await superAdmin.from('event_broadcast_sends').delete().eq('broadcast_id', seededBroadcast.id);
    await superAdmin.from('event_broadcasts').delete().eq('id', seededBroadcast.id);
  }
  await superAdmin.from('event_payments').delete().eq('registration_id', aalayReg.id);
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
      is_lead: true,
      created_by: superAdminUser2.user.id,
      season_id: season.id,
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

  // 0022: claiming is no longer restricted to your own location - any
  // authenticated staff member, any role, can claim into either location
  // (owner's explicit call, superseding 0020's own-location-only rule).
  console.log(c.dim('\na location_admin can now claim a lead into the OTHER location too (0022)...'));
  const crossClaim = await aalay.rpc('claim_lead', { p_student_id: seededLead.id, p_location_id: sportsclubLoc.id });
  check('Aalay admin can claim the lead into Sportsclub', crossClaim.error === null, crossClaim.error?.message);
  const { data: afterCrossClaim } = await superAdmin.from('students').select('location_id').eq('id', seededLead.id).single();
  check('the cross-location claim actually took effect', afterCrossClaim?.location_id === sportsclubLoc.id);

  // 0023: 0022's table-wide "or is_lead = true" branch was too broad -
  // confirmed live, it let an Aalay admin see a Sportsclub-claimed lead's
  // full Inquiry record. Owner's call: sharing stays Lead-tab-only. So the
  // base students/payments RLS is back to its pre-0022 shape - once claimed
  // by Sportsclub, the Aalay admin loses normal-table visibility, exactly
  // like any other cross-location record.
  console.log(c.dim('\n...but once claimed, the base students table stays properly location-scoped (0023 - NOT shared, unlike lead_log())...'));
  const { data: aalayNoLongerSeesViaTable } = await aalay.from('students').select('id').eq('id', seededLead.id);
  check(
    "Aalay admin can no longer see it via the normal students table once Sportsclub claimed it",
    (aalayNoLongerSeesViaTable?.length ?? 0) === 0,
    JSON.stringify(aalayNoLongerSeesViaTable)
  );
  const { data: sportsclubSeesOwnClaimedLead } = await sportsclub.from('students').select('id').eq('id', seededLead.id);
  check('Sportsclub admin (who owns it now) sees it via the normal table', (sportsclubSeesOwnClaimedLead?.length ?? 0) === 1);

  console.log(c.dim('\n...but lead_log() (0023) still shows it to Aalay, permanently, Lead-tab-scoped only...'));
  const { data: aalayLeadLog } = await aalay.rpc('lead_log');
  check(
    "Aalay admin still sees it via lead_log() - the Lead tab's own permanent view",
    (aalayLeadLog ?? []).some((r: { id: string }) => r.id === seededLead.id),
    JSON.stringify(aalayLeadLog?.map((r: { id: string }) => r.id))
  );

  console.log(c.dim('\n...and a normal (non-Lead-origin) record never appears in lead_log() at all...'));
  check(
    'Aalay admin still sees 0 Sportsclub students in general (the earlier cross-location check)',
    (aalaySeesSportsclub?.length ?? 0) === 0
  );
  if (aalayOwn?.[0]?.id) {
    check(
      "a real, already-located student (never a Lead) doesn't show up in lead_log() either",
      !(aalayLeadLog ?? []).some((r: { id: string }) => r.id === aalayOwn[0].id)
    );
  }

  // 0028: undoing a mistaken claim (e.g. Aalay staff meant to claim for
  // Aalay but hit Sportsclub). Symmetric with claim_lead's "any real staff
  // member, any role" authorization (0022) - proven here by having the
  // Aalay admin revert a claim that Sportsclub currently owns, even though
  // Aalay lost normal-table access to it the moment Sportsclub claimed it
  // (the 0023 check just above). revert_lead_claim() is SECURITY DEFINER,
  // so it isn't gated by the caller's own row-level visibility.
  console.log(c.dim('\nrevert_lead_claim() undoes a mistaken claim - any staff may revert any claim, not just the location that owns it (0028)...'));
  const revertByAalay = await aalay.rpc('revert_lead_claim', { p_student_id: seededLead.id });
  check(
    'Aalay admin can revert the lead even though Sportsclub currently owns it',
    revertByAalay.error === null,
    revertByAalay.error?.message
  );
  const { data: afterRevert } = await superAdmin
    .from('students')
    .select('location_id, batch_id')
    .eq('id', seededLead.id)
    .single();
  check('location_id is cleared after revert', afterRevert?.location_id === null, JSON.stringify(afterRevert));
  check(
    "batch_id is also cleared after revert (0028 - a batch belongs to a specific location, so it'd be stale otherwise)",
    afterRevert?.batch_id === null
  );

  const { data: aalaySeesItAgain } = await aalay.from('students').select('id').eq('id', seededLead.id);
  check('Aalay admin sees it again via the normal table, now unclaimed', (aalaySeesItAgain?.length ?? 0) === 1);
  const { data: sportsclubSeesItAgain } = await sportsclub.from('students').select('id').eq('id', seededLead.id);
  check(
    'Sportsclub admin also sees it again via the normal table, now unclaimed',
    (sportsclubSeesItAgain?.length ?? 0) === 1
  );

  const revertAlreadyUnclaimed = await aalay.rpc('revert_lead_claim', { p_student_id: seededLead.id });
  check('reverting an already-unclaimed lead is rejected, not silently a no-op', revertAlreadyUnclaimed.error !== null);

  if (aalayOwn?.[0]?.id) {
    const revertNonLead = await aalay.rpc('revert_lead_claim', { p_student_id: aalayOwn[0].id });
    check(
      'reverting a normal (non-Lead-origin) student is rejected - not a general "clear anyone\'s location" tool',
      revertNonLead.error !== null
    );
  }

  console.log(c.dim('\ntriage_admin: sees the shared pool, can claim into EITHER location (0018/0019)...'));
  const { data: freshLead, error: freshLeadError } = await superAdmin
    .from('students')
    .insert({
      name: '[VERIFY] triage_admin lead',
      phone_number: '0000000002',
      location_id: null,
      is_lead: true,
      created_by: superAdminUser2.user.id,
      season_id: season.id,
    })
    .select('id')
    .single();
  if (!freshLead) throw new Error(`could not seed a fresh test lead: ${freshLeadError?.message}`);

  const { data: triageSeesFreshLead } = await triage.from('students').select('id').eq('id', freshLead.id);
  check('triage_admin sees a freshly-unclaimed lead', (triageSeesFreshLead?.length ?? 0) === 1);

  const triageClaimAalay = await triage.rpc('claim_lead', { p_student_id: freshLead.id, p_location_id: aalayLoc.id });
  check('triage_admin can claim a lead into Aalay', triageClaimAalay.error === null, triageClaimAalay.error?.message);

  // 0023: "access ends at the claim" is back for the normal table (0018's
  // original design) - the permanent view lives only in lead_log() now, not
  // in general table access.
  const { data: triageSeesAfterAalayClaimNoLongerVisible } = await triage
    .from('students')
    .select('id')
    .eq('id', freshLead.id);
  check(
    "triage_admin's own table access ends the moment it's claimed — can't see it anymore",
    (triageSeesAfterAalayClaimNoLongerVisible?.length ?? 0) === 0,
    JSON.stringify(triageSeesAfterAalayClaimNoLongerVisible)
  );
  const { data: triageLeadLog } = await triage.rpc('lead_log');
  check(
    "triage_admin still sees it via lead_log() - claiming doesn't remove it from the Lead tab's permanent view",
    (triageLeadLog ?? []).some((r: { id: string }) => r.id === freshLead.id)
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
  // Sportsclub — same open-claim rule 0022 gave every role, not special to
  // triage_admin anymore.
  const { data: freshLead2, error: freshLead2Error } = await superAdmin
    .from('students')
    .insert({
      name: '[VERIFY] triage_admin lead 2',
      phone_number: '0000000003',
      location_id: null,
      is_lead: true,
      created_by: superAdminUser2.user.id,
      season_id: season.id,
    })
    .select('id')
    .single();
  if (!freshLead2) throw new Error(`could not seed a second fresh test lead: ${freshLead2Error?.message}`);

  const triageClaimSportsclub = await triage.rpc('claim_lead', {
    p_student_id: freshLead2.id,
    p_location_id: sportsclubLoc.id,
  });
  check(
    'triage_admin can ALSO claim a lead into Sportsclub',
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
