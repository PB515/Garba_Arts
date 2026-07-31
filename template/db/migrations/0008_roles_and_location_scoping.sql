-- 0008_roles_and_location_scoping — the first real role split in this app.
-- Reverses the flat-permission model (decision #10 in CLAUDE.md) for
-- `students`/`payments` only. Owner + family = super_admin (see everything,
-- merged across locations). Everyone else = location_admin, tied to exactly
-- one location, full CRUD within it, zero access — not even read — to any
-- other location's students/payments. `locations`/`batches` stay flat
-- (low-sensitivity reference data every admin needs for dropdowns).
--
-- A student with no location_id yet is visible only to super_admin — a
-- location_admin's access is literally "location_id = mine", so there's
-- nothing to match against until a location is assigned.

-- migrate:up

create table if not exists staff_roles (
  user_id      uuid primary key references auth.users(id),
  role         text not null check (role in ('super_admin', 'location_admin')),
  location_id  uuid references locations(id),
  created_at   timestamptz not null default now(),
  constraint location_admin_needs_location
    check (role = 'super_admin' or location_id is not null)
);

alter table staff_roles enable row level security;

-- Every authenticated user can read the role table (needed so the app can
-- look up "what am I allowed to see" client-side too) but never write to it
-- directly — role assignment happens via tooling/create-account.ts with the
-- service-role client, not through the app.
create policy "authenticated read" on staff_roles
  for select
  to authenticated
  using (true);

grant select on staff_roles to authenticated, service_role;
grant insert, update, delete on staff_roles to service_role;

-- SECURITY DEFINER + locked search_path, same pattern as the IDP's
-- has_role.sql pattern, adapted for location scoping specifically.
create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from staff_roles sr
    where sr.user_id = auth.uid() and sr.role = 'super_admin'
  );
$$;

create or replace function public.staff_location_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select location_id from staff_roles sr
  where sr.user_id = auth.uid() and sr.role = 'location_admin';
$$;

revoke all on function public.is_super_admin() from public;
revoke all on function public.staff_location_id() from public;
grant execute on function public.is_super_admin() to authenticated;
grant execute on function public.staff_location_id() to authenticated;

-- Replace the flat students policy with location-scoped access.
drop policy if exists "authenticated full access" on students;

create policy "location-scoped access" on students
  for all
  to authenticated
  using (is_super_admin() or location_id = staff_location_id())
  with check (is_super_admin() or location_id = staff_location_id());

-- Payments scope through their parent student's location.
drop policy if exists "authenticated full access" on payments;

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

-- Small demo-lecture fee, independent of the main course fee_total. "very
-- less" per the owner - a nominal charge for attending the trial class,
-- collected regardless of whether the lead ends up joining or not.
alter table students add column demo_fee_amount numeric(10,2);
alter table students add column demo_fee_paid numeric(10,2) not null default 0;

-- Status collapses from 6 values to 3 (follow_up / dropped / joined) - the
-- 3-color simplification. Still free text, not a CHECK constraint (decision
-- #3: status stays a flexible field, not an enforced pipeline). Remap any
-- existing rows (including the demo-seed data) so nothing is left on the
-- old scheme.
update students set status = 'follow_up' where status in ('inquiry', 'demo_scheduled', 'demo_done');
update students set status = 'dropped' where status in ('not_interested', 'dropped');
-- 'joined' rows need no change.

-- migrate:down
-- NOTE: the status remap below is lossy, not a true inverse - the original
-- distinction between inquiry/demo_scheduled/demo_done can't be recovered
-- once collapsed to follow_up. Documented rather than silently pretended
-- otherwise; acceptable because this is a same-day dev-only rollback path,
-- not a production data-recovery mechanism.
update students set status = 'inquiry' where status = 'follow_up';
alter table students drop column demo_fee_paid;
alter table students drop column demo_fee_amount;

drop policy if exists "location-scoped access" on payments;
create policy "authenticated full access" on payments
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "location-scoped access" on students;
create policy "authenticated full access" on students
  for all
  to authenticated
  using (true)
  with check (true);

drop function if exists public.staff_location_id();
drop function if exists public.is_super_admin();
drop table if exists staff_roles;
