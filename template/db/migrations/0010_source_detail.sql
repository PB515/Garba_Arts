-- 0010_source_detail — generalizes referred_by (Referral-only) into a
-- source_detail field that captures extra context for ANY source, not just
-- who referred someone. Owner: "I want same for others as we can also know
-- source of others" (e.g. which Instagram post, which WhatsApp group, who
-- at a walk-in spoke to them).

-- migrate:up
alter table students rename column referred_by to source_detail;

-- migrate:down
alter table students rename column source_detail to referred_by;
