'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { writeAuditLog } from '@/lib/patterns/audit-log';
import { requireUser, str, num } from '@/lib/form';
import { getCurrentSeason } from '@/lib/seasons';
import type { createClient } from '@/lib/supabase/server';

/**
 * Nothing stopped the same phone number being entered twice through the two
 * separate add-forms (Inquiry's own form, Lead's own form) - found live: a
 * "Shaival" claimed into Sportsclub AND a second, still-unclaimed "Shaival"
 * existed at once, same phone number, genuinely two rows. Checked on both
 * create paths; editing an existing record is unaffected.
 */
async function findDuplicatePhone(
  supabase: Awaited<ReturnType<typeof createClient>>,
  phone: string,
): Promise<{ name: string; location_id: string | null } | null> {
  const { data } = await supabase
    .from('students')
    .select('name, location_id')
    .eq('phone_number', phone)
    .is('deleted_at', null)
    .limit(1)
    .maybeSingle();
  return data;
}

function duplicateMessage(existing: { name: string; location_id: string | null }): string {
  const where = existing.location_id ? 'already in Inquiry/Joined' : 'still in the Lead pool';
  return `A record for this phone number already exists: "${existing.name}" (${where}). Check there before adding again.`;
}

/**
 * Both add-forms use useActionState (not a plain <form action={fn}>), so a
 * recoverable problem - missing fields, a duplicate phone, a negative fee -
 * can be returned as {error} and shown inline. Found live: with a plain
 * thrown Error and no error.tsx boundary anywhere in this app, ANY
 * validation failure crashed the whole page to Next's generic "This page
 * couldn't load" screen - including the duplicate-phone check just added,
 * which defeats the point of a friendly warning. Only genuinely unexpected
 * failures (a real DB error) still throw.
 */
export async function createStudent(
  _prevState: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const { supabase, user } = await requireUser();

  const name = str(formData, 'name');
  const phone_number = str(formData, 'phone_number');
  if (!name || !phone_number) return { error: 'Name and phone number are required.' };

  const duplicate = await findDuplicatePhone(supabase, phone_number);
  if (duplicate) return { error: duplicateMessage(duplicate) };

  const fee_total = num(formData, 'fee_total');
  const demo_fee_amount = num(formData, 'demo_fee_amount');
  if ((fee_total !== null && fee_total < 0) || (demo_fee_amount !== null && demo_fee_amount < 0)) {
    return { error: 'Fee amounts cannot be negative.' };
  }
  if (
    (fee_total !== null && !Number.isInteger(fee_total)) ||
    (demo_fee_amount !== null && !Number.isInteger(demo_fee_amount))
  ) {
    return { error: 'Fee amounts must be whole numbers.' };
  }

  const season = await getCurrentSeason(supabase);
  if (!season) return { error: 'No current season is set - contact the owner before adding anyone.' };

  const { data, error } = await supabase
    .from('students')
    .insert({
      name,
      phone_number,
      whatsapp_number: str(formData, 'whatsapp_number'),
      source: str(formData, 'source'),
      source_detail: str(formData, 'source_detail'),
      residential_area: str(formData, 'residential_area'),
      status: str(formData, 'status') ?? 'follow_up',
      location_id: str(formData, 'location_id'),
      batch_id: str(formData, 'batch_id'),
      inquiry_date: str(formData, 'inquiry_date'),
      fee_total,
      demo_fee_amount,
      remarks: str(formData, 'remarks'),
      created_by: user.id,
      season_id: season.id,
    })
    .select('id')
    .single();

  if (error) return { error: `Could not add: ${error.message}` };

  revalidatePath('/students');
  redirect(`/students/${data.id}`);
}

/**
 * Lead-only add: intentionally no location/batch/fee fields (a Lead is by
 * definition undecided) and, unlike createStudent, no redirect - staying on
 * /students/leads is the whole point for rapid back-to-back phone intake.
 * The form itself is keyed on the current lead count so it remounts (and
 * its uncontrolled fields + any lingering error message clear) after each
 * successful add.
 */
export async function createLead(
  _prevState: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const { supabase, user } = await requireUser();

  const name = str(formData, 'name');
  const phone_number = str(formData, 'phone_number');
  if (!name || !phone_number) return { error: 'Name and phone number are required.' };

  const duplicate = await findDuplicatePhone(supabase, phone_number);
  if (duplicate) return { error: duplicateMessage(duplicate) };

  const season = await getCurrentSeason(supabase);
  if (!season) return { error: 'No current season is set - contact the owner before adding anyone.' };

  const { error } = await supabase.from('students').insert({
    name,
    phone_number,
    whatsapp_number: str(formData, 'whatsapp_number'),
    source: str(formData, 'source'),
    gender: str(formData, 'gender'),
    status: 'follow_up',
    remarks: str(formData, 'remarks'),
    created_by: user.id,
    is_lead: true,
    season_id: season.id,
  });

  if (error) return { error: `Could not add: ${error.message}` };

  revalidatePath('/students/leads');
  return null;
}

/**
 * The detail page's full edit - useActionState so a recoverable problem
 * shows inline instead of crashing (same reasoning as createStudent/
 * createLead). Fee total and Demo fee amount live in their own boxes now
 * (updateFeeTotal/updateDemoFeeAmount below) - moved out of this form entirely, since seeing
 * the number and setting it in two different places was confusing (the
 * owner's direct ask). Which means this form's own submission no longer
 * carries fee_total, so the "can't mark Joined without a batch and a fee"
 * lock has to read the currently-stored fee_total from the database instead
 * of the form - still the real, server-side guard; the client-side check in
 * student-edit-form.tsx is convenience only.
 */
export async function updateStudent(
  studentId: string,
  _prevState: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const { supabase, user } = await requireUser();

  const name = str(formData, 'name');
  const phone_number = str(formData, 'phone_number');
  if (!name || !phone_number) return { error: 'Name and phone number are required.' };

  const status = str(formData, 'status');
  const batch_id = str(formData, 'batch_id');
  if (status === 'joined') {
    const { data: current } = await supabase.from('students').select('fee_total').eq('id', studentId).single();
    if (!batch_id || current?.fee_total === null || current?.fee_total === undefined) {
      return { error: 'Add a batch and a fee amount before marking as Joined.' };
    }
  }

  const { error } = await supabase
    .from('students')
    .update({
      name,
      phone_number,
      whatsapp_number: str(formData, 'whatsapp_number'),
      source: str(formData, 'source'),
      source_detail: str(formData, 'source_detail'),
      gender: str(formData, 'gender'),
      residential_area: str(formData, 'residential_area'),
      status,
      location_id: str(formData, 'location_id'),
      batch_id,
      inquiry_date: str(formData, 'inquiry_date'),
      remarks: str(formData, 'remarks'),
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', studentId);

  if (error) return { error: `Could not save: ${error.message}` };

  revalidatePath('/students');
  revalidatePath(`/students/${studentId}`);
  return null;
}

/**
 * Sets how much someone owes for the real course - lives in the Fees box
 * now, not the Details form (decision #67): the owner's direct complaint
 * was that seeing the total in one box but setting it in a different one
 * was confusing. Each box owns its own amount + its own save, rather than
 * one form spanning two visually separate sections.
 */
export async function updateFeeTotal(
  studentId: string,
  _prevState: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const { supabase, user } = await requireUser();

  const fee_total = num(formData, 'fee_total');
  if (fee_total !== null && fee_total < 0) return { error: 'Fee total cannot be negative.' };
  if (fee_total !== null && !Number.isInteger(fee_total)) return { error: 'Fee total must be a whole number.' };

  const { error } = await supabase
    .from('students')
    .update({ fee_total, updated_by: user.id, updated_at: new Date().toISOString() })
    .eq('id', studentId);

  if (error) return { error: `Could not save: ${error.message}` };

  revalidatePath('/students');
  revalidatePath(`/students/${studentId}`);
  return null;
}

/** Same as updateFeeTotal, for the Demo fee box's own amount. */
export async function updateDemoFeeAmount(
  studentId: string,
  _prevState: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const { supabase, user } = await requireUser();

  const demo_fee_amount = num(formData, 'demo_fee_amount');
  if (demo_fee_amount !== null && demo_fee_amount < 0) return { error: 'Demo fee amount cannot be negative.' };
  if (demo_fee_amount !== null && !Number.isInteger(demo_fee_amount)) {
    return { error: 'Demo fee amount must be a whole number.' };
  }

  const { error } = await supabase
    .from('students')
    .update({ demo_fee_amount, updated_by: user.id, updated_at: new Date().toISOString() })
    .eq('id', studentId);

  if (error) return { error: `Could not save: ${error.message}` };

  revalidatePath('/students');
  revalidatePath(`/students/${studentId}`);
  return null;
}

/**
 * Claims an unclaimed Lead (location_id null) into a specific location — one
 * click from the Lead list, no need to open the full edit page. Batch is
 * deliberately left unset here; the record shows up on Inquiry afterward
 * with the same "Complete details" nudge already used for anyone missing
 * batch/fee, rather than forcing a batch pick inline on the claim button.
 *
 * Routed through the claim_lead() SECURITY DEFINER function (0020) rather
 * than a raw update — a plain RLS `with check` branch turned out not to work
 * here (Postgres also requires the proposed new row to satisfy `using` for
 * this policy shape, which a location_admin's own-location claim happens to
 * pass by coincidence but triage_admin's arbitrary-location claim never
 * does). The function does its own explicit authorization check, so the UI
 * only offering a location_admin their own location's button is still just
 * a convenience, not the real guard.
 */
export async function claimLead(studentId: string, locationId: string): Promise<void> {
  const { supabase } = await requireUser();

  const { error } = await supabase.rpc('claim_lead', { p_student_id: studentId, p_location_id: locationId });
  if (error) throw new Error(`Could not claim: ${error.message}`);

  revalidatePath('/students/leads');
  revalidatePath('/students');
}

/**
 * Undoes a mistaken claim (0028) - e.g. an Aalay admin meant to claim for
 * Aalay but hit "Claim for Sportsclub". Symmetric with claimLead: any real
 * staff member may revert any claim, not just their own location's, same as
 * claiming itself is already open to everyone. Routed through
 * revert_lead_claim() rather than a raw update for the same reason claimLead
 * is - the base students RLS policy can't safely express "any staff may
 * clear any location" without also granting broader access than intended.
 */
export async function revertLeadClaim(studentId: string): Promise<void> {
  const { supabase } = await requireUser();

  const { error } = await supabase.rpc('revert_lead_claim', { p_student_id: studentId });
  if (error) throw new Error(`Could not revert: ${error.message}`);

  revalidatePath('/students/leads');
  revalidatePath('/students');
}

/**
 * Fast one-click status change from the Inquiry list — no need to open the
 * detail page just to reclassify. Marking someone "joined" is hard-blocked
 * without a batch and a fee already set — the owner's stated assumption is
 * "if joined, it's already complete," and Joined itself no longer checks
 * this at all, so this is the one real enforcement point. The UI's own
 * block (status-quick-set.tsx) is convenience; this is the actual guard.
 */
export async function setStudentStatus(studentId: string, status: string): Promise<void> {
  const { supabase, user } = await requireUser();

  if (status === 'joined') {
    const { data: current } = await supabase
      .from('students')
      .select('batch_id, fee_total')
      .eq('id', studentId)
      .single();
    if (!current?.batch_id || current.fee_total === null) {
      throw new Error('Add a batch and a fee amount before marking as Joined.');
    }
  }

  const { error } = await supabase
    .from('students')
    .update({ status, updated_by: user.id, updated_at: new Date().toISOString() })
    .eq('id', studentId);
  if (error) throw new Error(`Could not update status: ${error.message}`);

  revalidatePath('/students');
  revalidatePath('/students/joined');
}

export async function archiveStudent(studentId: string): Promise<void> {
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from('students')
    .update({ deleted_by: user.id, deleted_at: new Date().toISOString() })
    .eq('id', studentId);
  if (error) throw new Error(`Could not archive: ${error.message}`);

  revalidatePath('/students');
  redirect('/students');
}

export async function restoreStudent(studentId: string): Promise<void> {
  const { supabase } = await requireUser();

  const { error } = await supabase
    .from('students')
    .update({ deleted_by: null, deleted_at: null })
    .eq('id', studentId);
  if (error) throw new Error(`Could not restore: ${error.message}`);

  revalidatePath('/students');
  revalidatePath(`/students/${studentId}`);
}

export async function permanentlyDeleteStudent(studentId: string): Promise<void> {
  const { supabase, user } = await requireUser();

  const { data: existing } = await supabase.from('students').select('*').eq('id', studentId).single();
  // Payments reference this student via a foreign key with no cascade, so they
  // must go first — captured in the same audit entry rather than a DB-level
  // CASCADE, so the full picture (including its payment history) survives in
  // one durable record even after the rows themselves are gone.
  const { data: payments } = await supabase.from('payments').select('*').eq('student_id', studentId);

  // Audit log is written AFTER the deletes succeed, not before — writing it
  // first would leave a false "deleted" trail if the delete then failed (the
  // FK-constraint bug this endpoint originally hit, caught during testing).
  const { error: paymentsError } = await supabase.from('payments').delete().eq('student_id', studentId);
  if (paymentsError) throw new Error(`Could not remove payments: ${paymentsError.message}`);

  const { error } = await supabase.from('students').delete().eq('id', studentId);
  if (error) throw new Error(`Could not permanently remove: ${error.message}`);

  await writeAuditLog(supabase, {
    actorId: user.id,
    action: 'student.permanently_deleted',
    entity: 'student',
    entityId: studentId,
    meta: { snapshot: existing ?? null, payments: payments ?? [] },
  });

  revalidatePath('/students');
  redirect('/students');
}

/**
 * Logs a real payment - toward the main fee by default, or the demo fee
 * when the Demo fee box's form submits payment_type=demo (decision #67:
 * demo payments used to be a bare typed-in number, never actually logged,
 * so they never counted toward the Fees tab's real Cash/UPI totals; now
 * they're a real row here, just tagged, so both stay distinguishable but
 * both count as real money collected). useActionState, same reasoning as
 * every other action in this file: this form is used more now (both main
 * and demo payments go through it), so the crash-on-throw gap was worth
 * closing here too rather than leaving it for a "later pass."
 */
export async function addPayment(
  studentId: string,
  _prevState: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const { supabase, user } = await requireUser();

  const mode = str(formData, 'mode');
  const paid_date = str(formData, 'paid_date');
  if (!mode || !paid_date) return { error: 'Mode and date are required.' };
  const payment_type = str(formData, 'payment_type') === 'demo' ? 'demo' : 'main';

  // A payment can't be logged toward a total that hasn't been set yet
  // (decision #82) - the owner's direct ask, since a payment with nothing to
  // reconcile against was easy to log by mistake before this existed.
  const { data: student } = await supabase
    .from('students')
    .select('fee_total, demo_fee_amount')
    .eq('id', studentId)
    .single();
  const relevantTotal = payment_type === 'demo' ? student?.demo_fee_amount : student?.fee_total;
  if (relevantTotal === null || relevantTotal === undefined) {
    return {
      error:
        payment_type === 'demo'
          ? 'Set the Demo fee amount before logging a payment.'
          : 'Set the Fee total before logging a payment.',
    };
  }

  // Cash + UPI (split) stores the two real amounts, not just a combined
  // figure, so the Fees tab can reconcile Total Cash / Total UPI against
  // the grand total. Plain cash/upi keeps the single "amount" field.
  // Amounts are whole rupees only (decision #82 - "we deal in 100s not in
  // paisa"), enforced server-side too, not just the input's step attribute.
  let amount: number | null;
  let cash_amount: number | null = null;
  let upi_amount: number | null = null;
  if (mode === 'cash_upi') {
    cash_amount = num(formData, 'cash_amount');
    upi_amount = num(formData, 'upi_amount');
    if (!cash_amount || cash_amount <= 0 || !upi_amount || upi_amount <= 0) {
      return { error: 'Both cash amount and UPI amount are required for a split payment.' };
    }
    if (!Number.isInteger(cash_amount) || !Number.isInteger(upi_amount)) {
      return { error: 'Amounts must be whole numbers.' };
    }
    amount = cash_amount + upi_amount;
  } else {
    amount = num(formData, 'amount');
    if (!amount || amount <= 0) return { error: 'Amount is required.' };
    if (!Number.isInteger(amount)) return { error: 'Amount must be a whole number.' };
  }

  // Optional (the owner's explicit call) - staff may not have the UPI
  // transaction ID on hand yet and should still be able to log the payment
  // now, adding it later. Only relevant when UPI is part of the payment.
  const upi_transaction_id = mode === 'cash' ? null : str(formData, 'upi_transaction_id');

  const { error } = await supabase.from('payments').insert({
    student_id: studentId,
    amount,
    mode,
    cash_amount,
    upi_amount,
    upi_transaction_id,
    paid_date,
    payment_type,
    remarks: str(formData, 'remarks'),
    created_by: user.id,
  });
  if (error) return { error: `Could not log payment: ${error.message}` };

  revalidatePath(`/students/${studentId}`);
  return null;
}

export async function archivePayment(paymentId: string, studentId: string): Promise<void> {
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from('payments')
    .update({ deleted_by: user.id, deleted_at: new Date().toISOString() })
    .eq('id', paymentId);
  if (error) throw new Error(`Could not archive payment: ${error.message}`);

  revalidatePath(`/students/${studentId}`);
}

export async function permanentlyDeletePayment(paymentId: string, studentId: string): Promise<void> {
  const { supabase, user } = await requireUser();

  const { data: existing } = await supabase.from('payments').select('*').eq('id', paymentId).single();

  const { error } = await supabase.from('payments').delete().eq('id', paymentId);
  if (error) throw new Error(`Could not permanently remove payment: ${error.message}`);

  await writeAuditLog(supabase, {
    actorId: user.id,
    action: 'payment.permanently_deleted',
    entity: 'payment',
    entityId: paymentId,
    meta: { snapshot: existing ?? null },
  });

  revalidatePath(`/students/${studentId}`);
}
