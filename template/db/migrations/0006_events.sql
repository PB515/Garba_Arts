-- 0006_events — event registration (admin-entered, not public-facing: a
-- student tells staff "this many people are coming" and staff logs it).
-- Same flat-permission, deny-by-default posture as every other table here.

-- migrate:up

create table if not exists events (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  event_date   date,
  description  text,
  created_by   uuid not null references auth.users(id),
  created_at   timestamptz not null default now()
);

alter table events enable row level security;

create policy "authenticated full access" on events
  for all
  to authenticated
  using (true)
  with check (true);

create table if not exists event_registrations (
  id               uuid primary key default gen_random_uuid(),
  event_id         uuid not null references events(id),
  registrant_name  text not null,
  registrant_phone text,
  friend_count     integer not null default 0 check (friend_count >= 0),
  fee_amount       numeric(10,2),
  amount_paid      numeric(10,2) not null default 0,
  remarks          text,
  created_by       uuid not null references auth.users(id),
  created_at       timestamptz not null default now(),
  updated_by       uuid references auth.users(id),
  updated_at       timestamptz,
  deleted_by       uuid references auth.users(id),
  deleted_at       timestamptz
);

alter table event_registrations enable row level security;

create policy "authenticated full access" on event_registrations
  for all
  to authenticated
  using (true)
  with check (true);

grant select, insert, update, delete on events, event_registrations to authenticated, service_role;

-- migrate:down
drop table if exists event_registrations;
drop table if exists events;
