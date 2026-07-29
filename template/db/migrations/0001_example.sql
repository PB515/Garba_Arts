-- 0001_example — reference migration showing the format.
-- SAFE TO DELETE in a real site. It exists so the runner has something to
-- apply on first verify, and so the file format is self-documenting.
--
-- Format: each migration is one .sql file named NNNN_name.sql with an
-- `-- migrate:up` section (applied by `up`) and an `-- migrate:down` section
-- (applied by `down`). Keep down as the exact inverse of up.

-- migrate:up
create table if not exists example_widget (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz not null default now()
);

-- migrate:down
drop table if exists example_widget;
