-- 0005_referred_by_and_inquiry_date — owner feedback after the first live
-- pass: (1) capture who referred a lead when source = referral, and
-- (2) starting_date was ambiguous (read as "class start date" when it's
-- meant to be "the date this lead/inquiry came in") — renamed for clarity.

-- migrate:up
alter table students rename column starting_date to inquiry_date;
alter table students add column referred_by text;

-- migrate:down
alter table students drop column referred_by;
alter table students rename column inquiry_date to starting_date;
