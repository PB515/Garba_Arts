/**
 * seasons.ts — the current season is looked up constantly (every add-form,
 * every list's default filter), so this is the one place that does it.
 * Season scoping is deliberately app-level, not RLS (see 0026's comment) -
 * it's a usability default ("which year"), not a security boundary.
 */
import { createClient } from '@/lib/supabase/server';

export interface Season {
  id: string;
  label: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
}

export async function getCurrentSeason(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<Season | null> {
  const { data } = await supabase.from('seasons').select('*').eq('is_current', true).maybeSingle();
  return data;
}
