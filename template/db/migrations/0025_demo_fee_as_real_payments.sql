-- 0025_demo_fee_as_real_payments — the demo fee's "paid" amount was a bare
-- typed-in number (students.demo_fee_paid), completely disconnected from
-- the real payments table - it never counted toward the Fees tab's actual
-- Cash/UPI reconciliation, found live by the owner ("fees paid is not
-- coming in final payment amount of cash and upi"). Demo fee payments now
-- go through the same Cash/UPI(-split) logging as the main fee, just
-- tagged separately so the two stay distinguishable and neither balance
-- gets confused with the other's.

-- migrate:up

alter table payments add column payment_type text not null default 'main';
alter table payments add constraint payments_payment_type_check check (payment_type in ('main', 'demo'));

-- demo_fee_paid is now derived from summing payments where
-- payment_type = 'demo' (same pattern the main fee's "Paid" already used) -
-- the stored column is genuinely obsolete, not just unused.
alter table students drop column demo_fee_paid;

-- migrate:down

alter table students add column demo_fee_paid numeric not null default 0;

alter table payments drop constraint if exists payments_payment_type_check;
alter table payments drop column payment_type;
