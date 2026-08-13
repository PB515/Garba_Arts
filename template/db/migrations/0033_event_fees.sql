-- 0033_event_fees — decision #86, pending-feedback.md item #12 (Phase B of
-- the event-poster/WhatsApp/fees roadmap). Two things: (1) events.fee_per_person
-- so a group registration's total auto-computes from headcount instead of
-- staff doing the 5x200=1000 math by hand; (2) a real payment LOG
-- (event_payments), matching the same "similar treatment as students"
-- request — event_registrations.amount_paid was a single flat number with
-- no history, unlike students where payments are a real line-item table.
-- No payment gateway anywhere here (owner explicit: "no razorpay, manual
-- staff confirm") — this is just the same manual logging pattern already
-- used for student fees, applied to event registrations.

-- migrate:up

alter table events add column fee_per_person numeric;

create table if not exists event_payments (
  id                  uuid primary key default gen_random_uuid(),
  registration_id     uuid not null references event_registrations(id),
  amount              numeric(10,2) not null,
  mode                text not null check (mode in ('cash', 'upi', 'cash_upi')),
  cash_amount         numeric,
  upi_amount          numeric,
  upi_transaction_id  text,
  paid_date           date not null,
  remarks             text,
  created_by          uuid not null references auth.users(id),
  created_at          timestamptz not null default now(),
  deleted_by          uuid references auth.users(id),
  deleted_at          timestamptz,
  constraint event_payments_cash_upi_split_check check (
    (mode = 'cash_upi' and cash_amount is not null and upi_amount is not null and cash_amount + upi_amount = amount)
    or (mode <> 'cash_upi' and cash_amount is null and upi_amount is null)
  )
);

alter table event_payments enable row level security;

-- Same inherited-scoping pattern as event_attendees (0015): a location_admin
-- may only see/log payments for registrations in their own location;
-- super_admin sees all. This is what makes "individual fees open to every
-- admin, combined Fees tab super_admin-only" true without any extra
-- app-level gating on the per-registration side — it falls straight out of
-- the same RLS event_registrations already has.
create policy "location-scoped access" on event_payments
  for all
  to authenticated
  using (
    is_super_admin()
    or exists (
      select 1 from event_registrations r
      where r.id = event_payments.registration_id
        and r.location_id = staff_location_id()
    )
  )
  with check (
    is_super_admin()
    or exists (
      select 1 from event_registrations r
      where r.id = event_payments.registration_id
        and r.location_id = staff_location_id()
    )
  );

grant select, insert, update, delete on event_payments to authenticated, service_role;

-- Backfill: preserve any already-logged amount_paid as one real payment row
-- (mode assumed 'cash' — the original split, if any, was never recorded) so
-- no money silently disappears when the column is dropped below. Falls back
-- to the earliest real account for created_by on the rare row where it's
-- null (a public self-registration's amount_paid is always 0 in practice,
-- since the public form never exposes that field, but this stays correct
-- either way).
insert into event_payments (registration_id, amount, mode, paid_date, created_by, created_at)
select
  id,
  amount_paid,
  'cash',
  coalesce(created_at::date, current_date),
  coalesce(created_by, (select id from auth.users order by created_at limit 1)),
  coalesce(created_at, now())
from event_registrations
where amount_paid > 0;

alter table event_registrations drop column amount_paid;

-- migrate:down

alter table event_registrations add column amount_paid numeric(10,2) not null default 0;

update event_registrations r
set amount_paid = coalesce((select sum(p.amount) from event_payments p where p.registration_id = r.id and p.deleted_at is null), 0);

drop policy if exists "location-scoped access" on event_payments;
drop table if exists event_payments;
alter table events drop column if exists fee_per_person;
