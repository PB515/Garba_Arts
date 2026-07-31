-- 0011_event_attendees_and_public_registration — owner: "we don't just want
-- number coming with student but also who are coming, number and name" -
-- applies everywhere (both admin-entered and the new public webform), plus
-- an opt-in per-event public registration page.

-- migrate:up

alter table events add column public_registration_enabled boolean not null default false;

create table if not exists event_attendees (
  id               uuid primary key default gen_random_uuid(),
  registration_id  uuid not null references event_registrations(id),
  name             text not null,
  created_at       timestamptz not null default now()
);

alter table event_attendees enable row level security;

create policy "authenticated full access" on event_attendees
  for all
  to authenticated
  using (true)
  with check (true);

grant select, insert, update, delete on event_attendees to authenticated, service_role;

-- friend_count is replaced by counting event_attendees rows - a single
-- source of truth instead of a number that can drift from the actual names.
alter table event_registrations drop column friend_count;

-- migrate:down
alter table event_registrations add column friend_count integer not null default 0 check (friend_count >= 0);
drop table if exists event_attendees;
alter table events drop column public_registration_enabled;
