-- 0019_triage_admin_claim_write — triage_admin can already SEE unclaimed
-- leads (0017's "location_id is null" branch works for any authenticated
-- staff), but couldn't actually WRITE a claim: staff_location_id() only
-- resolves for role = 'location_admin', so `location_id = staff_location_id()`
-- is never true for a triage_admin, and claiming means setting location_id
-- to a real value (not null), so neither existing `with check` branch fit.
--
-- Deliberately only added to `with check`, not `using` — this must NOT
-- expand what triage_admin can SEE (that stays exactly "unclaimed leads
-- only", per the "access ends at the claim" rule). Since Postgres RLS
-- requires a row to pass `using` to even be selected for UPDATE in the
-- first place, the only rows a triage_admin can ever reach here are the
-- already-null-location ones `using` already permits — this just allows
-- the resulting write (null -> a real location) to pass `with check` too.

-- migrate:up
drop policy if exists "location-scoped access" on students;

create policy "location-scoped access" on students
  for all
  to authenticated
  using (is_super_admin() or location_id = staff_location_id() or location_id is null)
  with check (is_super_admin() or location_id = staff_location_id() or location_id is null or is_triage_admin());

-- migrate:down
drop policy if exists "location-scoped access" on students;

create policy "location-scoped access" on students
  for all
  to authenticated
  using (is_super_admin() or location_id = staff_location_id() or location_id is null)
  with check (is_super_admin() or location_id = staff_location_id() or location_id is null);
