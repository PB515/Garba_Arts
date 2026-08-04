-- 0018_triage_admin_role — a third staff role: triage_admin. Sees only the
-- shared, unclaimed Lead pool (already covered by 0017's "or location_id is
-- null" RLS branch — no location_id of their own, same shape as
-- super_admin) and can claim a Lead into either location. Everything else
-- (Inquiry/Joined/Fees/Events/Navratri) stays invisible to them, for free,
-- via the existing "location_id = staff_location_id()" branch simply never
-- matching a real location against their null one.
--
-- The one thing that genuinely needs new plumbing: this role (and
-- super_admin) need cross-location JOINED headcounts to steer a caller
-- toward whichever batch is actually empty — but giving row-level access to
-- other locations' students would defeat the whole point of the role being
-- narrow. joined_headcount_by_batch() is a SECURITY DEFINER function
-- returning aggregate counts only (location_id/batch_id/count, no names, no
-- phone numbers) rather than relaxing RLS further.

-- migrate:up

alter table staff_roles drop constraint if exists staff_roles_role_check;
alter table staff_roles add constraint staff_roles_role_check
  check (role in ('super_admin', 'location_admin', 'triage_admin'));

alter table staff_roles drop constraint if exists location_admin_needs_location;
alter table staff_roles add constraint location_admin_needs_location
  check (role in ('super_admin', 'triage_admin') or location_id is not null);

create or replace function public.is_triage_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from staff_roles sr
    where sr.user_id = auth.uid() and sr.role = 'triage_admin'
  );
$$;

revoke all on function public.is_triage_admin() from public;
grant execute on function public.is_triage_admin() to authenticated;

-- Aggregate-only, gated inside the function itself (not by a grant, since
-- any authenticated caller may execute it — an unauthorized caller just
-- gets 0 rows back, same "invisible not denied" shape as every RLS read in
-- this app, rather than an error that would leak "this exists but you can't
-- see it").
create or replace function public.joined_headcount_by_batch()
returns table(location_id uuid, batch_id uuid, headcount bigint)
language sql
stable
security definer
set search_path = public
as $$
  select s.location_id, s.batch_id, count(*)::bigint
  from students s
  where s.status = 'joined'
    and s.deleted_at is null
    and (is_super_admin() or is_triage_admin())
  group by s.location_id, s.batch_id;
$$;

revoke all on function public.joined_headcount_by_batch() from public;
grant execute on function public.joined_headcount_by_batch() to authenticated;

-- migrate:down

drop function if exists public.joined_headcount_by_batch();
drop function if exists public.is_triage_admin();

alter table staff_roles drop constraint if exists location_admin_needs_location;
alter table staff_roles add constraint location_admin_needs_location
  check (role = 'super_admin' or location_id is not null);

alter table staff_roles drop constraint if exists staff_roles_role_check;
alter table staff_roles add constraint staff_roles_role_check
  check (role in ('super_admin', 'location_admin'));
