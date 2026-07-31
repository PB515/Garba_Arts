-- 0012_public_event_registration_nullable_created_by — public registrations
-- (via the service-role client, no session) can't have a real created_by.
-- events.created_by stays not null - only staff create events.

-- migrate:up
alter table event_registrations alter column created_by drop not null;

-- migrate:down
-- Only safe if no public registrations exist yet (dev-only rollback path,
-- not a production guarantee).
alter table event_registrations alter column created_by set not null;
