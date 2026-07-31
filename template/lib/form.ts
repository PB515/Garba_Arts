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

/**
 * Builds a safe `ilike` value for PostgREST's `.or()` filter string. A raw
 * search term containing a comma or parenthesis (e.g. "Patel, R") breaks the
 * filter's own syntax - found live when a comma in the Inquiry search box
 * crashed the whole page with a raw "failed to parse logic tree" error.
 * PostgREST's escape hatch: wrap the value in double quotes when it contains
 * a reserved character, backslash-escaping any literal backslash/quote.
 */
export function orIlikeValue(term: string): string {
  const value = `%${term}%`;
  if (/[,.():"]/.test(value)) {
    return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return value;
}

/** Builds a `?a=1&b=2` query string, skipping empty/undefined values - used to carry a page's current filters into its CSV export link. */
export function buildQueryString(params: Record<string, string | undefined>): string {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) usp.set(key, value);
  }
  const s = usp.toString();
  return s ? `?${s}` : '';
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
