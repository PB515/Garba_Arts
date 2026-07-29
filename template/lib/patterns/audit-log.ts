/**
 * audit-log — use when a consequential write (status change, money, role grant,
 * deletion) must leave a who/what/when trail.
 *
 * Append-only: insert a row describing the action; never update/delete it.
 * Assumes an `audit_log` table (actor_id, action, entity, entity_id, meta jsonb,
 * created_at). Pass any Supabase client — a server client to attribute to the
 * user, or the service-role client for system actions.
 */
import type { SupabaseClient } from '@supabase/supabase-js';

export interface AuditEntry {
  actorId: string | null;
  action: string;          // e.g. 'order.refunded'
  entity: string;          // e.g. 'order'
  entityId: string;
  meta?: Record<string, unknown>;
}

export async function writeAuditLog(
  supabase: SupabaseClient,
  entry: AuditEntry
): Promise<void> {
  const { error } = await supabase.from('audit_log').insert({
    actor_id: entry.actorId,
    action: entry.action,
    entity: entry.entity,
    entity_id: entry.entityId,
    meta: entry.meta ?? {},
  });
  // Auditing must never break the main action — log, don't throw.
  if (error) console.error('[audit-log] failed:', error.message);
}
