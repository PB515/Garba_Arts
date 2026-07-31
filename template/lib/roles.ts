/**
 * roles.ts — read the current user's staff role (0008_roles_and_location_
 * scoping.sql). RLS already enforces the actual access boundary; this is
 * for UI decisions (show/hide the Fees nav link, lock the Location field
 * for a location_admin's add-form so they can't submit a value RLS would
 * reject anyway).
 */
import { createClient } from '@/lib/supabase/server';

export type StaffRole = 'super_admin' | 'location_admin';

export interface StaffRoleInfo {
  role: StaffRole;
  locationId: string | null;
}

/** Null if the signed-in user has no role row yet (shouldn't happen for a real account, but don't assume). */
export async function getStaffRole(): Promise<StaffRoleInfo | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('staff_roles')
    .select('role, location_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!data) return null;
  return { role: data.role as StaffRole, locationId: data.location_id };
}

export function isSuperAdmin(info: StaffRoleInfo | null): boolean {
  return info?.role === 'super_admin';
}
