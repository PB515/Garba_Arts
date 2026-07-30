-- 0007_navratri_registrations — proof-of-concept public pass registration.
-- Unlike every other table here, this one is reachable by strangers with no
-- login — but NOT via a direct anon RLS grant. `anon` gets zero grants here
-- too, same as everywhere else (decision #12 stays intact). The public
-- /navratri page writes through a server action using the service-role
-- client, which computes the price itself from server-side config — a
-- client can never submit its own price. RLS below only ever needs to
-- cover the authenticated admin view.

-- migrate:up

create table if not exists navratri_registrations (
  id                    uuid primary key default gen_random_uuid(),
  representative_name   text not null,
  representative_phone  text not null,
  pass_count            integer not null check (pass_count >= 1),
  price_per_pass         numeric(10,2) not null,
  total_amount          numeric(10,2) not null,
  amount_paid           numeric(10,2) not null default 0,
  remarks               text,
  created_at            timestamptz not null default now(),
  updated_by            uuid references auth.users(id),
  updated_at            timestamptz,
  deleted_by            uuid references auth.users(id),
  deleted_at            timestamptz
);

alter table navratri_registrations enable row level security;

create policy "authenticated full access" on navratri_registrations
  for all
  to authenticated
  using (true)
  with check (true);

grant select, insert, update, delete on navratri_registrations to authenticated, service_role;

-- migrate:down
drop table if exists navratri_registrations;
