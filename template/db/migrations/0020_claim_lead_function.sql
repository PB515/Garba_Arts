-- 0020_claim_lead_function — 0019's approach (add `or is_triage_admin()` to
-- students' `with check`) doesn't actually work: empirically proven that for
-- this `for all` policy, Postgres also requires the PROPOSED NEW ROW to
-- satisfy `using`, not just `with check`. A location_admin's own claim
-- happened to work by coincidence (`location_id = staff_location_id()`
-- matches on the new row too, since they only ever claim into their own
-- location) — but triage_admin claiming into an arbitrary location never
-- matches any `using` branch for the new row, since their own
-- staff_location_id() is null. Broadening `using` itself isn't safe either:
-- that would grant triage_admin general SELECT visibility into any already-
-- claimed row, breaking "access ends at the claim".
--
-- Fix: route the claim through a SECURITY DEFINER function with explicit
-- authorization logic in the body, instead of leaning on the table-level
-- RLS policy for this one specific write. Same "server action + elevated
-- privileges, not a raw RLS grant" pattern already used for /navratri and
-- event registration writes in this codebase.

-- migrate:up

drop policy if exists "location-scoped access" on students;
create policy "location-scoped access" on students
  for all
  to authenticated
  using (is_super_admin() or location_id = staff_location_id() or location_id is null)
  with check (is_super_admin() or location_id = staff_location_id() or location_id is null);

create or replace function public.claim_lead(p_student_id uuid, p_location_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_location uuid;
begin
  if not (
    is_super_admin()
    or is_triage_admin()
    or (staff_location_id() is not null and staff_location_id() = p_location_id)
  ) then
    raise exception 'not authorized to claim a lead into this location';
  end if;

  select location_id into v_current_location from students where id = p_student_id;
  if v_current_location is not null then
    raise exception 'this lead has already been claimed';
  end if;

  update students
  set location_id = p_location_id, updated_at = now()
  where id = p_student_id;
end;
$$;

revoke all on function public.claim_lead(uuid, uuid) from public;
grant execute on function public.claim_lead(uuid, uuid) to authenticated;

-- migrate:down

drop function if exists public.claim_lead(uuid, uuid);

drop policy if exists "location-scoped access" on students;
create policy "location-scoped access" on students
  for all
  to authenticated
  using (is_super_admin() or location_id = staff_location_id() or location_id is null)
  with check (is_super_admin() or location_id = staff_location_id() or location_id is null or is_triage_admin());
