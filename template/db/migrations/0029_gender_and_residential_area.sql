-- 0029_gender_and_residential_area — two new optional fields (decision #79):
-- gender, captured on the Lead add-form; residential_area, captured at the
-- Inquiry stage. Both editable later from the Details form regardless of
-- where they were first entered, same as every other field on this table.
-- Added while the production table is genuinely empty (post-wipe), so no
-- backfill is needed for either column.

-- migrate:up

alter table students add column gender text check (gender in ('male', 'female'));
alter table students add column residential_area text;

-- migrate:down

alter table students drop column if exists gender;
alter table students drop column if exists residential_area;
