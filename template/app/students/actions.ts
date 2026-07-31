'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { writeAuditLog } from '@/lib/patterns/audit-log';
import { requireUser, str, num } from '@/lib/form';

export async function createStudent(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();

  const name = str(formData, 'name');
  const phone_number = str(formData, 'phone_number');
  if (!name || !phone_number) throw new Error('Name and phone number are required.');

  const fee_total = num(formData, 'fee_total');
  const demo_fee_amount = num(formData, 'demo_fee_amount');
  const demo_fee_paid = num(formData, 'demo_fee_paid') ?? 0;
  if ((fee_total !== null && fee_total < 0) || (demo_fee_amount !== null && demo_fee_amount < 0) || demo_fee_paid < 0) {
    throw new Error('Fee amounts cannot be negative.');
  }

  const { data, error } = await supabase
    .from('students')
    .insert({
      name,
      phone_number,
      whatsapp_number: str(formData, 'whatsapp_number'),
      source: str(formData, 'source'),
      source_detail: str(formData, 'source_detail'),
      status: str(formData, 'status') ?? 'follow_up',
      location_id: str(formData, 'location_id'),
      batch_id: str(formData, 'batch_id'),
      inquiry_date: str(formData, 'inquiry_date'),
      fee_total,
      demo_fee_amount,
      demo_fee_paid,
      remarks: str(formData, 'remarks'),
      created_by: user.id,
    })
    .select('id')
    .single();

  if (error) throw new Error(`Could not add: ${error.message}`);

  revalidatePath('/students');
  redirect(`/students/${data.id}`);
}

export async function updateStudent(studentId: string, formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();

  const name = str(formData, 'name');
  const phone_number = str(formData, 'phone_number');
  if (!name || !phone_number) throw new Error('Name and phone number are required.');

  const fee_total = num(formData, 'fee_total');
  const demo_fee_amount = num(formData, 'demo_fee_amount');
  const demo_fee_paid = num(formData, 'demo_fee_paid') ?? 0;
  if ((fee_total !== null && fee_total < 0) || (demo_fee_amount !== null && demo_fee_amount < 0) || demo_fee_paid < 0) {
    throw new Error('Fee amounts cannot be negative.');
  }

  const { error } = await supabase
    .from('students')
    .update({
      name,
      phone_number,
      whatsapp_number: str(formData, 'whatsapp_number'),
      source: str(formData, 'source'),
      source_detail: str(formData, 'source_detail'),
      status: str(formData, 'status'),
      location_id: str(formData, 'location_id'),
      batch_id: str(formData, 'batch_id'),
      inquiry_date: str(formData, 'inquiry_date'),
      fee_total,
      demo_fee_amount,
      demo_fee_paid,
      remarks: str(formData, 'remarks'),
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', studentId);

  if (error) throw new Error(`Could not save: ${error.message}`);

  revalidatePath('/students');
  revalidatePath(`/students/${studentId}`);
}

/** Fast one-click status change from the Inquiry list — no need to open the detail page just to reclassify. */
export async function setStudentStatus(studentId: string, status: string): Promise<void> {
  const { supabase, user } = await requireUser();

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

export async function addPayment(studentId: string, formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();

  const mode = str(formData, 'mode');
  const paid_date = str(formData, 'paid_date');
  if (!mode || !paid_date) throw new Error('Mode and date are required.');

  // Cash + UPI (split) stores the two real amounts, not just a combined
  // figure, so the Fees tab can reconcile Total Cash / Total UPI against
  // the grand total. Plain cash/upi keeps the single "amount" field.
  let amount: number | null;
  let cash_amount: number | null = null;
  let upi_amount: number | null = null;
  if (mode === 'cash_upi') {
    cash_amount = num(formData, 'cash_amount');
    upi_amount = num(formData, 'upi_amount');
    if (!cash_amount || cash_amount <= 0 || !upi_amount || upi_amount <= 0) {
      throw new Error('Both cash amount and UPI amount are required for a split payment.');
    }
    amount = cash_amount + upi_amount;
  } else {
    amount = num(formData, 'amount');
    if (!amount || amount <= 0) throw new Error('Amount is required.');
  }

  const { error } = await supabase.from('payments').insert({
    student_id: studentId,
    amount,
    mode,
    cash_amount,
    upi_amount,
    paid_date,
    remarks: str(formData, 'remarks'),
    created_by: user.id,
  });
  if (error) throw new Error(`Could not log payment: ${error.message}`);

  revalidatePath(`/students/${studentId}`);
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
