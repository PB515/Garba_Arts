-- 0035_event_gallery_opt_out — decision #90, pending-feedback.md item #6
-- (gallery half only - the promo-content half stays explicitly blocked on
-- the owner's own answer for what "promotional content" means). The
-- thank-you page's past-events gallery auto-pulls by default (per-event
-- date + has a banner), but the owner also asked for admin control over
-- which past events show - a simple per-event opt-out toggle satisfies both
-- without needing a heavier manual multi-select curation system.

-- migrate:up

alter table events add column show_in_gallery boolean not null default true;

-- migrate:down

alter table events drop column if exists show_in_gallery;
