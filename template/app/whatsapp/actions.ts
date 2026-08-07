'use server';

import { revalidatePath } from 'next/cache';
import { requireUser, str } from '@/lib/form';

/**
 * Open to every role, view and edit both (0027) - a deliberate, temporary
 * call: the owner hasn't decided who should be allowed to manage these yet,
 * so this starts flat (same shape as batches' own policy) rather than
 * guessing at a restriction nobody's asked for. Plain hard delete, no
 * archive/soft-delete step - these are message templates, not business
 * records that need a recovery path or an audit trail.
 */
export async function createTemplate(
  _prevState: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const { supabase, user } = await requireUser();

  const label = str(formData, 'label');
  const body = str(formData, 'body');
  if (!label || !body) return { error: 'Both a name and a message are required.' };

  const { error } = await supabase.from('message_templates').insert({ label, body, created_by: user.id });
  if (error) return { error: `Could not add: ${error.message}` };

  revalidatePath('/whatsapp');
  return null;
}

export async function updateTemplate(
  templateId: string,
  _prevState: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const { supabase } = await requireUser();

  const label = str(formData, 'label');
  const body = str(formData, 'body');
  if (!label || !body) return { error: 'Both a name and a message are required.' };

  const { error } = await supabase.from('message_templates').update({ label, body }).eq('id', templateId);
  if (error) return { error: `Could not save: ${error.message}` };

  revalidatePath('/whatsapp');
  return null;
}

export async function deleteTemplate(templateId: string): Promise<void> {
  const { supabase } = await requireUser();

  const { error } = await supabase.from('message_templates').delete().eq('id', templateId);
  if (error) throw new Error(`Could not remove: ${error.message}`);

  revalidatePath('/whatsapp');
}
