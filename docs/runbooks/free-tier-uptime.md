# Runbook — Free-tier uptime (don't let Supabase pause)

*A **free** Supabase project **pauses after 7 days of inactivity** — and a paused project means the site's DB calls **fail until someone manually restores it** from the dashboard. For a low-traffic site that's a silent outage. This runbook ships the keep-alive fix and lists the better options.*

## What ships in the template (Option A — keep-alive) ✅
Every cloned site already has the keep-alive built in:

- **`db/migrations/0002_keepalive.sql`** — a trivial `keepalive()` SQL function (`select now()`), granted to `anon`.
- **`app/api/health/route.ts`** — calls `rpc('keepalive')`; returns 200 when the DB answers. A real DB round-trip = activity.
- **`.github/workflows/keepalive.yml`** — a daily cron that curls `<SITE_URL>/api/health`.

**To enable per site:**
1. `npm run migrate:up` (applies the keepalive function).
2. Deploy; confirm `https://<site>/api/health` returns `{ "ok": true }`.
3. In the repo, add a secret **`SITE_URL`** = the deployed origin. The workflow runs daily.

**Two caveats (read these):**
- The keep-alive must be **external** to Supabase — `pg_cron` won't help, because if the project pauses, pg_cron pauses with it. The GitHub Action is external. ✓
- **GitHub disables scheduled workflows after ~60 days of no repo commits** — exactly when an idle site needs it most. For a truly idle site, point **cron-job.org** (free, dedicated) at `<SITE_URL>/api/health` instead of/as well as the Action.
- It's an **unofficial workaround** — it resets the timer today; Supabase could change detection. It does **not** change other free limits (500 MB, etc.). Real visitor traffic already counts as activity.

## The better options (when "free + a hack" isn't enough)
For a client site you actually care about, don't trust keep-alive as a guarantee:

| Option | When | Trade-off |
|---|---|---|
| **A — keep-alive (shipped)** | test/personal/demo, low-stakes | free; fragile (see caveats) |
| **B — Neon (free Postgres)** | site is Postgres-only (your own auth, no Supabase Storage/Realtime) | free; **auto-resumes on query** (no pause-outage); lose Supabase Auth/Storage |
| **C — Supabase Pro (~$25/mo)** | client uses Supabase features + must stay up | paid; no pause; keeps everything |
| **D — $5 VPS / Railway Postgres** | want always-on + full control | paid; you manage it |

**Rule of thumb:** test/personal → **A**. Client → **C** (or **B** if Postgres-only). Pass the cost through — a client site is a paid deliverable; don't run production on a keep-alive hack.

See also `hosting-and-data.md` for the full layer→option matrix (Railway is the *worker* host, not a Supabase replacement).
