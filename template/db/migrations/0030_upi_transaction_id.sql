-- 0030_upi_transaction_id — a UPI payment's transaction ID, for tracing it
-- back to the actual bank/UPI record later (decision #82). Optional (the
-- owner's explicit call): staff may not always have it on hand when logging
-- the payment, and should still be able to log it now and add the ID later.

-- migrate:up

alter table payments add column upi_transaction_id text;

-- migrate:down

alter table payments drop column if exists upi_transaction_id;
