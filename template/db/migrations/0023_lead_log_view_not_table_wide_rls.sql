-- 0023_lead_log_view_not_table_wide_rls — 0022's `or is_lead = true` branch
-- on the students/payments table-level RLS policy was too broad: it made a
-- Lead-origin record visible everywhere that reads from `students`, not
-- just the Lead tab - confirmed live, an Aalay admin could see a Sportsclub-
-- claimed Lead's full Inquiry record (batch/fee/"Complete details" and
-- all), not just its Lead-tab summary row. The owner confirmed directly:
-- the shared visibility should be Lead-tab-only, Inquiry/Joined must stay
-- properly location-scoped, same as everywhere else.
--
-- Same lesson as 0019 -> 0020: don't widen the general table-level RLS
-- policy for a narrow, cross-cutting need - use a SECURITY DEFINER function
-- with its own explicit scope instead. `lead_log()` returns the Lead tab's
-- exact fields for every `is_lead = true` row to any signed-in staff
-- member, bypassing RLS only through this one narrow read path. The base
-- `students`/`payments` policies revert to exactly their pre-0022 shape.
--
-- `is_lead` itself and 0022's open-claim change to claim_lead() are
-- unaffected - the owner only walked back the visibility scope, not the
-- permanent-log concept or the open-claim rule.

-- migrate:up

drop policy if exists "location-scoped access" on students;
create policy "location-scoped access" on students
  for all
  to authenticated
  using (is_super_admin() or location_id = staff_location_id() or location_id is null)
  with check (is_super_admin() or location_id = staff_location_id() or location_id is null);

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

create or replace function public.lead_log()
returns table (
  id uuid,
  name text,
  phone_number text,
  status text,
  source text,
  remarks text,
  location_id uuid
)
language sql
security definer
set search_path = public
stable
as $$
  select s.id, s.name, s.phone_number, s.status, s.source, s.remarks, s.location_id
  from students s
  where s.is_lead = true
    and s.deleted_at is null
    and exists (select 1 from staff_roles r where r.user_id = auth.uid())
  order by s.created_at desc;
$$;

revoke all on function public.lead_log() from public;
grant execute on function public.lead_log() to authenticated;

-- migrate:down

drop function if exists public.lead_log();

drop policy if exists "location-scoped access" on students;
create policy "location-scoped access" on students
  for all
  to authenticated
  using (is_super_admin() or location_id = staff_location_id() or location_id is null or is_lead = true)
  with check (is_super_admin() or location_id = staff_location_id() or location_id is null or is_lead = true);

drop policy if exists "location-scoped access" on payments;
create policy "location-scoped access" on payments
  for all
  to authenticated
  using (
    is_super_admin()
    or exists (
      select 1 from students s
      where s.id = payments.student_id
        and (s.location_id = staff_location_id() or s.location_id is null or s.is_lead = true)
    )
  )
  with check (
    is_super_admin()
    or exists (
      select 1 from students s
      where s.id = payments.student_id
        and (s.location_id = staff_location_id() or s.location_id is null or s.is_lead = true)
    )
  );
