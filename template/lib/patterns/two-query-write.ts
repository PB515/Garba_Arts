/**
 * two-query-write — use when a write must return shaped/joined data, or must be
 * idempotent, and a single insert can't guarantee it.
 *
 * Two recurring cases from the builds:
 *  1. INSERT then SELECT — write returns only the base row, but the UI needs the
 *     row with its relations. Insert, then re-select by id with the joins.
 *  2. CHECK then INSERT — avoid duplicates on a natural key when there's no DB
 *     unique constraint to lean on (prefer a constraint when you can add one).
 *
 * Both wrap the round-trip so callers don't re-handle the error each time. Pass
 * any Supabase client.
 */
import type { SupabaseClient } from '@supabase/supabase-js';

/** Insert a row, then re-fetch it by id with the given select (relations). */
export async function insertThenFetch<Row>(
  supabase: SupabaseClient,
  table: string,
  values: Record<string, unknown>,
  select: string
): Promise<Row> {
  const { data: inserted, error: insErr } = await supabase
    .from(table)
    .insert(values)
    .select('id')
    .single();
  if (insErr) throw new Error(`${table} insert failed: ${insErr.message}`);

  const { data, error } = await supabase
    .from(table)
    .select(select)
    .eq('id', (inserted as { id: string }).id)
    .single();
  if (error) throw new Error(`${table} refetch failed: ${error.message}`);
  return data as Row;
}

/** Insert only if no row matches `match`; returns the existing or new row. */
export async function insertIfAbsent<Row>(
  supabase: SupabaseClient,
  table: string,
  match: Record<string, unknown>,
  values: Record<string, unknown>,
  select = '*'
): Promise<{ row: Row; created: boolean }> {
  const existing = await supabase.from(table).select(select).match(match).maybeSingle();
  if (existing.error) throw new Error(`${table} lookup failed: ${existing.error.message}`);
  if (existing.data) return { row: existing.data as Row, created: false };

  const { data, error } = await supabase
    .from(table)
    .insert({ ...match, ...values })
    .select(select)
    .single();
  if (error) throw new Error(`${table} insert failed: ${error.message}`);
  return { row: data as Row, created: true };
}
