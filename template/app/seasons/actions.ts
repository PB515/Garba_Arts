'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireUser, str, num } from '@/lib/form';

/**
 * Creates a new season, its batches (a dynamic number of name/location
 * rows, same "number-driven dynamic rows" pattern as event attendees), and
 * flips which season is current - all as one action, since a season with
 * zero batches being briefly "current" is a state nobody wants to see even
 * transiently. Unsets the old current season before setting the new one
 * (never both at once - the database's own unique index on is_current
 * would reject that anyway). No true multi-statement transaction here
 * (the client library doesn't offer one for this), same tolerance for a
 * partial-failure edge case already accepted elsewhere in this app
 * (permanentlyDeleteStudent's sequential deletes, etc.) - this is a rare,
 * deliberate, super_admin-only action, not a high-frequency path.
 */
export async function startNewSeason(
  _prevState: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const { supabase } = await requireUser();

  const label = str(formData, 'label');
  if (!label) return { error: 'A season label is required.' };

  const start_date = str(formData, 'start_date');
  const end_date = str(formData, 'end_date');

  const batchCount = num(formData, 'batch_count') ?? 0;
  const batchRows: { name: string; location_id: string }[] = [];
  for (let i = 0; i < batchCount; i++) {
    const name = str(formData, `batch_name_${i}`);
    const location_id = str(formData, `batch_location_${i}`);
    if (name && location_id) batchRows.push({ name, location_id });
  }

  const { data: newSeason, error: seasonError } = await supabase
    .from('seasons')
    .insert({ label, start_date, end_date })
    .select('id')
    .single();
  if (seasonError) return { error: `Could not create season: ${seasonError.message}` };

  if (batchRows.length) {
    const { error: batchError } = await supabase
      .from('batches')
      .insert(batchRows.map((b) => ({ name: b.name, location_id: b.location_id, season_id: newSeason.id })));
    if (batchError) return { error: `Season created, but adding its batches failed: ${batchError.message}` };
  }

  const { error: unsetError } = await supabase
    .from('seasons')
    .update({ is_current: false })
    .eq('is_current', true)
    .neq('id', newSeason.id);
  if (unsetError) return { error: `Could not switch the current season: ${unsetError.message}` };

  const { error: setError } = await supabase.from('seasons').update({ is_current: true }).eq('id', newSeason.id);
  if (setError) return { error: `Could not switch the current season: ${setError.message}` };

  revalidatePath('/seasons');
  revalidatePath('/dashboard');
  redirect('/seasons');
}
