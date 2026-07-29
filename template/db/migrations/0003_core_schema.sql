-- 0003_core_schema — locations, batches, students, payments, audit_log.
-- Per docs/data-model-security.md. Every table has RLS enabled; every policy
-- checks only `to authenticated` (flat permissions, no role tiering) — the
-- `anon` role gets no policy anywhere, so it has zero access. audit_log is
-- append-only: insert + select policies only, no update/delete policy for
-- anyone.
--
-- Table-level GRANTs are explicit (not assumed) — this local instance does
-- NOT auto-grant SELECT/INSERT/UPDATE/DELETE to anon/authenticated/service_role
-- on new tables (confirmed via information_schema.role_table_grants: only
-- REFERENCES/TRIGGER/TRUNCATE showed up by default, even for service_role,
-- which still needs a base table grant despite BYPASSRLS). RLS is the row-level
-- gate; GRANT is the table-level gate underneath it — both are required.
-- verify-denial.ts's very first seed insert (as service_role) failed with
-- "permission denied for table locations" until these were added.

-- migrate:up

create table if not exists locations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  created_at  timestamptz not null default now()
);

alter table locations enable row level security;

create policy "authenticated full access" on locations
  for all
  to authenticated
  using (true)
  with check (true);

create table if not exists batches (
  id           uuid primary key default gen_random_uuid(),
  location_id  uuid not null references locations(id),
  name         text not null,
  created_at   timestamptz not null default now()
);

alter table batches enable row level security;

create policy "authenticated full access" on batches
  for all
  to authenticated
  using (true)
  with check (true);

create table if not exists students (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  phone_number   text not null,
  source         text,
  status         text,
  location_id    uuid references locations(id),
  batch_id       uuid references batches(id),
  starting_date  date,
  fee_total      numeric(10,2),
  remarks        text,
  created_by     uuid not null references auth.users(id),
  created_at     timestamptz not null default now(),
  updated_by     uuid references auth.users(id),
  updated_at     timestamptz,
  deleted_by     uuid references auth.users(id),
  deleted_at     timestamptz
);

alter table students enable row level security;

create policy "authenticated full access" on students
  for all
  to authenticated
  using (true)
  with check (true);

create table if not exists payments (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references students(id),
  amount        numeric(10,2) not null,
  mode          text not null check (mode in ('cash', 'upi')),
  paid_date     date not null,
  remarks       text,
  created_by    uuid not null references auth.users(id),
  created_at    timestamptz not null default now(),
  deleted_by    uuid references auth.users(id),
  deleted_at    timestamptz
);

alter table payments enable row level security;

create policy "authenticated full access" on payments
  for all
  to authenticated
  using (true)
  with check (true);

-- audit_log — the IDP's standard shape (lib/patterns/audit-log.ts). Append-only:
-- no update/delete policy exists for any role, so RLS default-denies both.
create table if not exists audit_log (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references auth.users(id),
  action      text not null,
  entity      text not null,
  entity_id   uuid not null,
  meta        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

alter table audit_log enable row level security;

create policy "authenticated insert" on audit_log
  for insert
  to authenticated
  with check (true);

create policy "authenticated read" on audit_log
  for select
  to authenticated
  using (true);

-- Table-level grants (RLS above is the row-level gate; this is the table-level
-- gate underneath it). `anon` gets nothing anywhere — no grant statement for it
-- at all, matching "anon gets zero access" (docs/data-model-security.md).
grant select, insert, update, delete on locations, batches, students, payments
  to authenticated, service_role;
grant select, insert on audit_log to authenticated, service_role;

-- migrate:down
drop table if exists audit_log;
drop table if exists payments;
drop table if exists students;
drop table if exists batches;
drop table if exists locations;
