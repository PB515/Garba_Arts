'use server';

import { revalidatePath } from 'next/cache';
import { writeAuditLog } from '@/lib/patterns/audit-log';
import { requireUser, num } from '@/lib/form';

export async function updateAmountPaid(registrationId: string, formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();

  const amount_paid = num(formData, 'amount_paid') ?? 0;

  const { error } = await supabase
    .from('navratri_registrations')
    .update({ amount_paid, updated_by: user.id, updated_at: new Date().toISOString() })
    .eq('id', registrationId);

  if (error) throw new Error(`Could not save: ${error.message}`);

  revalidatePath('/navratri-admin');
}

export async function archiveRegistration(registrationId: string): Promise<void> {
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from('navratri_registrations')
    .update({ deleted_by: user.id, deleted_at: new Date().toISOString() })
    .eq('id', registrationId);
  if (error) throw new Error(`Could not archive: ${error.message}`);

  revalidatePath('/navratri-admin');
}

export async function permanentlyDeleteRegistration(registrationId: string): Promise<void> {
  const { supabase, user } = await requireUser();

  const { data: existing } = await supabase
    .from('navratri_registrations')
    .select('*')
    .eq('id', registrationId)
    .single();

  const { error } = await supabase.from('navratri_registrations').delete().eq('id', registrationId);
  if (error) throw new Error(`Could not permanently remove: ${error.message}`);

  await writeAuditLog(supabase, {
    actorId: user.id,
    action: 'navratri_registration.permanently_deleted',
    entity: 'navratri_registration',
    entityId: registrationId,
    meta: { snapshot: existing ?? null },
  });

  revalidatePath('/navratri-admin');
}
