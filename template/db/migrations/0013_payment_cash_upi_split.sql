-- 0013_payment_cash_upi_split — owner wants a Cash+UPI (split) payment to
-- record the actual split, not just a combined total, so the Fees tab can
-- show true Total Cash / Total UPI figures that reconcile against the
-- overall Total collected. Both columns stay null for plain cash/upi rows.

-- migrate:up
alter table payments add column cash_amount numeric;
alter table payments add column upi_amount numeric;

-- migrate:down
alter table payments drop column cash_amount;
alter table payments drop column upi_amount;
