-- 0032_event_short_link_slug — decision #85, pending-feedback.md item #8:
-- a short, memorable public link ("/e/garba-night-2026") instead of the
-- UUID-based /events/[id]/register path. Purely additive per the owner's
-- explicit "let's go with b" call — the new /e/[slug] route just redirects
-- to the existing canonical register page; nothing about the admin routes
-- or the existing public /events/[id]/register path changes.

-- migrate:up

alter table events add column slug text;

-- Backfill existing rows with a slug derived from the name. A short hex
-- suffix from the id guarantees uniqueness here without needing real
-- collision-retry logic in SQL (the app-level generator used for every new
-- event going forward, in events/actions.ts, handles collisions properly
-- with a clean incrementing suffix instead of a hash).
update events
set slug = lower(regexp_replace(regexp_replace(trim(name), '[^a-zA-Z0-9]+', '-', 'g'), '^-+|-+$', '', 'g'))
  || '-' || substr(replace(id::text, '-', ''), 1, 6)
where slug is null;

alter table events alter column slug set not null;
alter table events add constraint events_slug_key unique (slug);

-- migrate:down

alter table events drop constraint if exists events_slug_key;
alter table events drop column if exists slug;
