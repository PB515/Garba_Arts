-- 0026_seasons — the classes run ~3 months a year, every year: new leads,
-- fresh batches, same organization reused season over season. Nothing in
-- the schema knew a "year" existed - a location_admin adding a batch today
-- would sit forever alongside every future year's batches with no way to
-- tell them apart. The owner confirmed directly: history stays visible,
-- batches are recreated from scratch each season (no carryover headcount),
-- and a lead never rolls forward into a new season on its own.
--
-- `seasons` is a real table (label, dates, exactly one `is_current`), not
-- just a label column - it needs its own identity so "start a new season"
-- is a real, auditable action, and so a Lead (which may have no batch yet)
-- can still be tagged to a year. `batches.season_id` and `students.season_id`
-- are both required (not nullable) - every batch and every student/lead
-- belongs to exactly one season, no ambiguous "which year is this" case.
--
-- This is deliberately an app-level filter, not an RLS boundary: unlike
-- location (a real "you may not see this" security rule), season is "which
-- year is relevant to show by default" - a usability default, not a
-- security restriction, so every list just filters on season_id = current
-- the same way it already filters on status/search/etc.
--
-- Season creation/switching is restricted to super_admin at the database
-- level (unlike batches' existing flat policy) because flipping
-- `is_current` affects every admin's view of the entire app at once - a
-- much bigger blast radius than one location_admin adding a stray batch.
--
-- Existing data is real production data now (not the test-data era this
-- app started in), but there's no way to know what year it actually
-- belongs to other than "whatever's live right now" - backfilled to the
-- new current season (TGA-2026) as the only honest option.

-- migrate:up

create table seasons (
  id uuid primary key default gen_random_uuid(),
  label text not null unique,
  start_date date,
  end_date date,
  is_current boolean not null default false,
  created_at timestamptz not null default now()
);

-- At most one season may be current at a time.
create unique index seasons_one_current_idx on seasons (is_current) where is_current;

alter table seasons enable row level security;

create policy "seasons select" on seasons
  for select
  to authenticated
  using (true);

create policy "seasons insert" on seasons
  for insert
  to authenticated
  with check (is_super_admin());

create policy "seasons update" on seasons
  for update
  to authenticated
  using (is_super_admin())
  with check (is_super_admin());

grant select, insert, update on seasons to authenticated, service_role;

insert into seasons (label, is_current) values ('TGA-2026', true);

alter table batches add column season_id uuid references seasons(id);
alter table students add column season_id uuid references seasons(id);

update batches set season_id = (select id from seasons where label = 'TGA-2026');
update students set season_id = (select id from seasons where label = 'TGA-2026');

alter table batches alter column season_id set not null;
alter table students alter column season_id set not null;

-- Both gain an optional season filter (defaulting to the current season)
-- so the Seasons tab's history view can call them for a past year without
-- needing a second copy of either function. Postgres treats `foo()` and
-- `foo(uuid default null)` as genuinely different overloaded signatures
-- (overload resolution is by declared parameter types, not defaults) -
-- `create or replace` would silently leave the OLD zero-arg version in
-- place and add a second, unreachable-by-existing-callers one alongside
-- it, not actually replace it. Drop the old signature explicitly first.
drop function if exists public.lead_log();
create function public.lead_log(p_season_id uuid default null)
returns table (
  id uuid,
  name text,
  phone_number text,
  whatsapp_number text,
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
  select s.id, s.name, s.phone_number, s.whatsapp_number, s.status, s.source, s.remarks, s.location_id
  from students s
  where s.is_lead = true
    and s.deleted_at is null
    and s.season_id = coalesce(p_season_id, (select id from seasons where is_current))
    and exists (select 1 from staff_roles r where r.user_id = auth.uid())
  order by s.created_at desc;
$$;

revoke all on function public.lead_log(uuid) from public;
grant execute on function public.lead_log(uuid) to authenticated;

drop function if exists public.joined_headcount_by_batch();
create function public.joined_headcount_by_batch(p_season_id uuid default null)
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
    and s.season_id = coalesce(p_season_id, (select id from seasons where is_current))
    and (is_super_admin() or is_triage_admin())
  group by s.location_id, s.batch_id;
$$;

revoke all on function public.joined_headcount_by_batch(uuid) from public;
grant execute on function public.joined_headcount_by_batch(uuid) to authenticated;

-- migrate:down

drop function if exists public.joined_headcount_by_batch(uuid);
create function public.joined_headcount_by_batch()
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

drop function if exists public.lead_log(uuid);
create function public.lead_log()
returns table (
  id uuid,
  name text,
  phone_number text,
  whatsapp_number text,
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
  select s.id, s.name, s.phone_number, s.whatsapp_number, s.status, s.source, s.remarks, s.location_id
  from students s
  where s.is_lead = true
    and s.deleted_at is null
    and exists (select 1 from staff_roles r where r.user_id = auth.uid())
  order by s.created_at desc;
$$;
revoke all on function public.lead_log() from public;
grant execute on function public.lead_log() to authenticated;

alter table students drop column season_id;
alter table batches drop column season_id;
drop table seasons;
