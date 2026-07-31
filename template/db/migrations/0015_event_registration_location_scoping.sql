-- 0015_event_registration_location_scoping — registrations (not events) get
-- a location; the event's own venue is irrelevant to scoping (owner: "event
-- can occur at a party plot or some other place... how much student has
-- registered from aliya and from sportsclub matters"). Nullable: a public
-- self-registration has no known location and stays unattributed, counted
-- in the combined total only, never in a location_admin's own view. Admin-
-- entered registrations are required to set one at the app level.

-- migrate:up
alter table event_registrations add column location_id uuid references locations(id);

drop policy if exists "authenticated full access" on event_registrations;

create policy "location-scoped access" on event_registrations
  for all
  to authenticated
  using (is_super_admin() or location_id = staff_location_id())
  with check (is_super_admin() or location_id = staff_location_id());

-- event_attendees scopes through its parent registration, same pattern as
-- payments scoping through students (0008_roles_and_location_scoping.sql).
drop policy if exists "authenticated full access" on event_attendees;

create policy "location-scoped access" on event_attendees
  for all
  to authenticated
  using (
    is_super_admin()
    or exists (
      select 1 from event_registrations r
      where r.id = event_attendees.registration_id
        and r.location_id = staff_location_id()
    )
  )
  with check (
    is_super_admin()
    or exists (
      select 1 from event_registrations r
      where r.id = event_attendees.registration_id
        and r.location_id = staff_location_id()
    )
  );

-- migrate:down
drop policy if exists "location-scoped access" on event_attendees;
create policy "authenticated full access" on event_attendees
  for all to authenticated using (true) with check (true);

drop policy if exists "location-scoped access" on event_registrations;
create policy "authenticated full access" on event_registrations
  for all to authenticated using (true) with check (true);

alter table event_registrations drop column location_id;
