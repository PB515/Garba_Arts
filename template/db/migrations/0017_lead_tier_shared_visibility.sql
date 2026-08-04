-- 0017_lead_tier_shared_visibility — a new "Lead" stage ahead of Inquiry, for
-- a caller who hasn't decided Aliya vs. Sportsclub yet. Nobody owns a Lead,
-- so both location_admins (and the future PWA triage role) need to see and
-- claim it, not just super_admin. location_id/batch_id were already nullable
-- at the schema level (decision #6 was only ever app-enforced) — this
-- migration only changes who can see a null-location row.
--
-- The moment a Lead's location_id is set (claimed), it becomes a normal
-- location-scoped row exactly as before — this migration doesn't touch that
-- half of the policy, only adds a third "or it's unclaimed" branch.

-- migrate:up
drop policy if exists "location-scoped access" on students;

create policy "location-scoped access" on students
  for all
  to authenticated
  using (is_super_admin() or location_id = staff_location_id() or location_id is null)
  with check (is_super_admin() or location_id = staff_location_id() or location_id is null);

-- Payments scope through their parent student's location; a Lead realistically
-- has no payments yet, but keep the same shared-visibility rule for consistency
-- rather than leaving an inexplicable gap.
drop policy if exists "location-scoped access" on payments;

create policy "location-scoped access" on payments
  for all
  to authenticated
  using (
    is_super_admin()
    or exists (
      select 1 from students s
      where s.id = payments.student_id
        and (s.location_id = staff_location_id() or s.location_id is null)
    )
  )
  with check (
    is_super_admin()
    or exists (
      select 1 from students s
      where s.id = payments.student_id
        and (s.location_id = staff_location_id() or s.location_id is null)
    )
  );

-- migrate:down
drop policy if exists "location-scoped access" on students;

create policy "location-scoped access" on students
  for all
  to authenticated
  using (is_super_admin() or location_id = staff_location_id())
  with check (is_super_admin() or location_id = staff_location_id());

drop policy if exists "location-scoped access" on payments;

create policy "location-scoped access" on payments
  for all
  to authenticated
  using (
    is_super_admin()
    or exists (
      select 1 from students s
      where s.id = payments.student_id
        and s.location_id = staff_location_id()
    )
  )
  with check (
    is_super_admin()
    or exists (
      select 1 from students s
      where s.id = payments.student_id
        and s.location_id = staff_location_id()
    )
  );
