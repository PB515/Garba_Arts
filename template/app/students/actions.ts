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

  const { data, error } = await supabase
    .from('students')
    .insert({
      name,
      phone_number,
      source: str(formData, 'source'),
      referred_by: str(formData, 'referred_by'),
      status: str(formData, 'status') ?? 'follow_up',
      location_id: str(formData, 'location_id'),
      batch_id: str(formData, 'batch_id'),
      inquiry_date: str(formData, 'inquiry_date'),
      fee_total: num(formData, 'fee_total'),
      demo_fee_amount: num(formData, 'demo_fee_amount'),
      demo_fee_paid: num(formData, 'demo_fee_paid') ?? 0,
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

  const { error } = await supabase
    .from('students')
    .update({
      name,
      phone_number,
      source: str(formData, 'source'),
      referred_by: str(formData, 'referred_by'),
      status: str(formData, 'status'),
      location_id: str(formData, 'location_id'),
      batch_id: str(formData, 'batch_id'),
      inquiry_date: str(formData, 'inquiry_date'),
      fee_total: num(formData, 'fee_total'),
      demo_fee_amount: num(formData, 'demo_fee_amount'),
      demo_fee_paid: num(formData, 'demo_fee_paid') ?? 0,
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

  const amount = num(formData, 'amount');
  const mode = str(formData, 'mode');
  const paid_date = str(formData, 'paid_date');
  if (!amount || amount <= 0 || !mode || !paid_date) {
    throw new Error('Amount, mode, and date are required.');
  }

  const { error } = await supabase.from('payments').insert({
    student_id: studentId,
    amount,
    mode,
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
