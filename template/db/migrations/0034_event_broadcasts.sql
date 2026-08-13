-- 0034_event_broadcasts — decision #87, pending-feedback.md item #11 (Phase C
-- of the roadmap). Manual wa.me sending, same as Lead/Inquiry (decisions
-- #75-76) - the app has no way to know a message was actually sent, so
-- tracking is deliberately self-reported by staff, not automatic. events
-- gets a venue field so a generic broadcast template can auto-fill
-- {event_name}/{event_date}/{venue} without retyping. A "broadcast" is a
-- named update for one event (generic/templated or ad hoc); a "send" row
-- only exists once staff manually confirms they sent it - no row means not
-- sent yet, so a newly-added registrant automatically shows up as pending
-- for every existing broadcast without any backfill needed.

-- migrate:up

alter table events add column venue text;

create table if not exists event_broadcasts (
  id           uuid primary key default gen_random_uuid(),
  event_id     uuid not null references events(id),
  label        text not null,
  message      text not null,
  created_by   uuid not null references auth.users(id),
  created_at   timestamptz not null default now()
);

alter table event_broadcasts enable row level security;

-- Flat, same as events itself - a broadcast (its label/message) isn't
-- location-specific, unlike the per-registrant send-tracking below.
create policy "authenticated full access" on event_broadcasts
  for all
  to authenticated
  using (true)
  with check (true);

create table if not exists event_broadcast_sends (
  id               uuid primary key default gen_random_uuid(),
  broadcast_id     uuid not null references event_broadcasts(id),
  registration_id  uuid not null references event_registrations(id),
  sent_at          timestamptz not null default now(),
  sent_by          uuid not null references auth.users(id),
  unique (broadcast_id, registration_id)
);

alter table event_broadcast_sends enable row level security;

-- Same inherited-scoping pattern as event_attendees/event_payments - a
-- location_admin only marks/sees "sent" status for their own location's
-- registrants.
create policy "location-scoped access" on event_broadcast_sends
  for all
  to authenticated
  using (
    is_super_admin()
    or exists (
      select 1 from event_registrations r
      where r.id = event_broadcast_sends.registration_id
        and r.location_id = staff_location_id()
    )
  )
  with check (
    is_super_admin()
    or exists (
      select 1 from event_registrations r
      where r.id = event_broadcast_sends.registration_id
        and r.location_id = staff_location_id()
    )
  );

grant select, insert, update, delete on event_broadcasts, event_broadcast_sends to authenticated, service_role;

-- migrate:down

drop policy if exists "location-scoped access" on event_broadcast_sends;
drop table if exists event_broadcast_sends;
drop policy if exists "authenticated full access" on event_broadcasts;
drop table if exists event_broadcasts;
alter table events drop column if exists venue;
