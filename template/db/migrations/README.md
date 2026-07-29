# db/migrations

*Versioned SQL migrations, applied by `tooling/migrate` and tracked in the `db_meta` table. SQL files + drift detection — **not** an ORM (charter §8).*

## File format

One file per migration, named `NNNN_name.sql` (zero-padded number → lexical order = apply order):

```sql
-- migrate:up
create table foo ( ... );

-- migrate:down
drop table foo;
```

- `up` runs the **up** section; `down` runs the **down** section (the exact inverse).
- The runner records each applied migration in `db_meta` with a checksum of the up SQL, so editing an already-applied file is detected as drift.

## Commands

```bash
npm run migrate:up        # apply all pending (or: npm run migrate up 1)
npm run migrate:status    # applied vs pending
npm run db:check          # drift detection (CI / pre-deploy gate)
npm run migrate:down      # roll back the last one (or: npm run migrate down 2)
npm run db:types          # regenerate row types from the live schema
```

Connection comes from `DATABASE_URL` (in `.env.local`), defaulting to the local Supabase Postgres. `up` also regenerates `lib/supabase/database.types.ts` so row types are generated, never hand-written.

`0001_example.sql` is a reference — delete it in a real site.
