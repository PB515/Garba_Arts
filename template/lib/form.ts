/**
 * form.ts — small helpers shared by every server action that reads a plain
 * <form> submission: get the authenticated user (or throw), and pull
 * trimmed string / parsed number fields out of FormData.
 */
import { createClient } from '@/lib/supabase/server';

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return { supabase, user };
}

export function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  const s = typeof v === 'string' ? v.trim() : '';
  return s.length ? s : null;
}

export function num(formData: FormData, key: string): number | null {
  const s = str(formData, key);
  if (s === null) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** Parses a textarea of one-name-per-line into trimmed, non-empty names. Used for event attendee lists. */
export function parseNameList(formData: FormData, key: string): string[] {
  const raw = formData.get(key);
  if (typeof raw !== 'string') return [];
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}
