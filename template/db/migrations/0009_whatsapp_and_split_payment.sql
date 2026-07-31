-- 0009_whatsapp_and_split_payment — owner feedback after using the app live:
-- (1) some people call on one number but WhatsApp on another, (2) a single
-- payment can be split cash+UPI in one sitting — log it as one entry with a
-- combined mode, not two separate rows.

-- migrate:up
alter table students add column whatsapp_number text;

alter table payments drop constraint payments_mode_check;
alter table payments add constraint payments_mode_check
  check (mode in ('cash', 'upi', 'cash_upi'));

-- migrate:down
alter table payments drop constraint payments_mode_check;
alter table payments add constraint payments_mode_check
  check (mode in ('cash', 'upi'));

alter table students drop column whatsapp_number;
