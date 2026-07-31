-- 0014_payments_cash_upi_split_check — closes a latent gap found in a full
-- audit: a cash_upi payment with a null cash_amount/upi_amount would
-- silently under-count in the Fees tab's Total Cash/Total UPI reconciliation.
-- Unreachable through the app today (addPayment() already validates this),
-- but a future Excel import or manual DB fix wouldn't be protected without
-- a real database-level guarantee.

-- migrate:up
alter table payments add constraint payments_cash_upi_split_check
  check (
    (mode = 'cash_upi' and cash_amount is not null and upi_amount is not null and cash_amount + upi_amount = amount)
    or (mode <> 'cash_upi' and cash_amount is null and upi_amount is null)
  );

-- migrate:down
alter table payments drop constraint payments_cash_upi_split_check;
