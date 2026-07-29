# CLAUDE.md — garba-arts-admin

*The context anchor for this site. Filled per build, kept in the repo root, read first every session.*

---

## What this is

An internal admin/CRM tool for **The Garba Arts**, a garba dance class with 2 locations and 6 batches. Replaces an Excel sheet for tracking inquiries/leads (from WhatsApp, Instagram, referrals, or walk-ins), demo attendance, enrollment status, and fee payments (cash/UPI, often partial/split). Used only by the 5–8 person core team — no client, student, or public-facing surface exists anywhere in this build. Full context: [`docs/discovery-brief.md`](docs/discovery-brief.md).

## Current status

- **Phase:** 2 of N — All v1 features built and verified live in the browser. Excel import is the only remaining planned feature, blocked on the owner sharing the file.
- **Last completed:** Full CRUD build: students/leads (add, edit, filter/search, soft-archive, permanent-remove), payments (log, per-student history, derived balance-due), dashboard (real summary cards), CSV export. Every flow tested live end-to-end in the browser, not just typechecked. Found and fixed a real bug during that testing (see Phase 2 build log): permanently deleting a student with payments hit an FK constraint, and the audit-log write was ordered before the delete instead of after (a failed delete would have left a false "deleted" audit trail).
- **Next up:** Nothing blocking — the app is functionally complete for v1. Remaining: (1) seed real location/batch names once provided, (2) create real team accounts once names/emails are provided, (3) build the CSV import once the Excel file is shared, (4) fill `globals.css` tokens with real brand colors before considering this "done" (currently the loud magenta placeholder — low priority for an internal tool per the Essential craft tier, but still required-not-optional per IDP convention), (5) deploy.
- **Last commit:** `2866c5e` — Supabase full-isolation fix (the feature build itself not yet committed as of this edit)
- **Resume note:** Four data-content open items block nothing about the app working, but do block it being fully "real": (1) Excel import file, (2) real names for the 2 locations + 6 batches, (3) the 5–8 team members' actual names/emails for account creation, (4) final confirmation of the starter status-tag list in `data-model-security.md`. Full detail in `docs/app-prd.md`'s and `docs/data-model-security.md`'s "Open items" sections. Local dev: `npm run db:start` then `npm run dev` (app on port 3500; Supabase API/DB on 55321/55322 — all fully isolated from sibling sites, see decision #13). Test account: `owner@thegarbaarts.local` / `TempPass123!` — a throwaway local-only credential, replace with real team accounts via `npm run create-account` once names/emails are provided.

## Stack

Next.js App Router · Tailwind v4 + tokens · Supabase (real per-user auth + RLS) · Vercel. Same as every IDP clone — see the IDP's own `CLAUDE.md` decisions for the shared 80%.

## Conventions

Tokens only — no hardcoded hex · secrets in `.env.local` only · no new/upgraded deps without asking · git per phase, branch per phase · changing a frozen doc is a separate logged step. Full list: `docs/conventions.md`.

## Decisions made (do not revisit)

*The frozen calls from discovery. Re-opening one is a deliberate, logged action.*

1. **Purely an internal admin tool — zero client/student-facing pages, ever.** → `docs/discovery-brief.md`
2. **Craft tier: Essential, across the entire build.** Scored 1/10 on the tier rubric; independently reinforced by two hard overrides (content the user came to *do*, and a tight timeline). No cinematic/motion craft. → `docs/discovery-brief.md`
3. **Status is a flexible field, not an enforced pipeline.** A person can enter the system at any stage (walk-in straight to "joined," no forced Inquiry → Demo → Joined sequence). → `docs/discovery-brief.md`
4. **Fees are one-time per student, custom amount, tracked as payment line items** (date, amount, mode: cash/UPI, can split across modes and installments). Balance due = fee − Σ(payments); no GST/invoicing. → `docs/discovery-brief.md`
5. **Real per-person login for all 5–8 core team members** (not a shared login) — explicit request so activity is attributable via normal session identity. Invite-only, no public sign-up. Follows the IDP's `portal.md` auth pattern (auth → RLS → prove denial → features), scoped to staff-only with zero client accounts. → `docs/golden-paths/portal.md`, `docs/discovery-brief.md`
6. **Each student belongs to exactly one location and one batch**; batches are fixed to a single location (2 locations × up-to-6 batches). → `docs/discovery-brief.md`
7. **CSV export is a first-class feature**, not an afterthought — needed for detailed analysis outside the app. CSV import of the existing Excel sheet is also wanted, but the file hasn't been shared yet — not a launch blocker. → `docs/discovery-brief.md`
8. **This is a new golden-path type for the IDP** (staff-only internal ops/CRM tool, zero external users) — no exact existing recipe. Closest analog is `portal.md`, adapted down. Worth feeding back to the master IDP's `BACKLOG.md` after this ships. → `docs/discovery-brief.md`
9. **Went straight to a focused App PRD + Data Model & Security doc, skipping doc-gen-master's full 11-doc set.** Modest single-app scope + real auth/data wrinkles (per-user RLS, payment line items) was the trigger — user confirmed this judgment call. → `docs/app-prd.md`, `docs/data-model-security.md`
10. **Flat permissions — every core team member can view/add/edit/soft-delete/permanently-remove every record.** No owner/staff split, no `has_role()` tiering for v1. → `docs/app-prd.md`
11. **Delete is two-tier:** default delete = soft-delete/archive (recoverable); a separate, explicit "permanently remove" action does a real `DELETE`, always preceded by an `audit_log` entry (append-only, RLS-enforced no update/delete). → `docs/data-model-security.md`
12. **`anon` gets zero grants on any table** — stricter than the IDP's usual marketing/portal defaults, because this app has no public surface at all. → `docs/data-model-security.md`
13. **This site's local Supabase config is fully isolated from every sibling site — `project_id` AND every port (api 55321 / db 55322 / shadow 55320 / pooler 55329 / studio 55323 / inbucket 55324 / analytics 55327), all shifted +1000 from Supabase's shared defaults.** `project_id` alone (changed from the archive's inherited `"IDP_Web"`) only prevents Docker volume/container-name collisions — it does NOT prevent PORT collisions, since every clone's `config.toml` defaults to the same 54321-54327 ports and only one project can actually bind them at a time. Discovered live: this site's login started authenticating against a *different* site's (Upasthiti's) user table with zero error, because Upasthiti's stack — also still on `project_id = "IDP_Web"` and default ports — had most recently grabbed 54321-54324. `.env.local` (root + `template/`) and `supabase/config.toml`'s `auth.site_url`/`additional_redirect_urls` all updated to match. Every future IDP clone needs BOTH fixes (unique project_id, unique full port block); flag it in a dedicated IDP session — confirmed via grep that jules/upasthiti/mba-execution-os all still carry the shared defaults.
14. **Local dev runs on port 3500**, registered as `garba-arts-admin-dev` in the workspace-root `.claude/launch.json` (shared across all site sessions — each site owns one port to avoid collisions).
15. **`middleware.ts` → `proxy.ts`, mid-build.** Next.js 16 renamed the convention (file name + exported function `middleware` → `proxy`) while this app was being built; not a deviation, just built against a moving target — noted so a future session isn't confused finding `proxy.ts` instead of `middleware.ts`.

## Where things live

- Tokens → `template/app/globals.css` (still the required-to-customize placeholder magenta)
- Brand/contact constants → `template/lib/site.ts`
- Schema + migrations → `template/db/migrations/`
- Auth/route protection → `template/proxy.ts`, `template/app/login/`
- Students/leads + payments CRUD → `template/app/students/` (`page.tsx`, `[id]/page.tsx`, `actions.ts`)
- Dashboard → `template/app/dashboard/page.tsx`
- CSV export → `template/app/api/export/students/route.ts`
- Security gate script → `tooling/verify-denial.ts` (`npm run verify:denial`)
- Account creation (invite-only) → `tooling/create-account.ts` (`npm run create-account -- <email> <password>`)
- Discovery brief (this build's spec source) → `docs/discovery-brief.md`
- App PRD (roles, flows, No-List) → `docs/app-prd.md`
- Data Model & Security (schema + RLS, per table) → `docs/data-model-security.md`

---

## Build log

*Newest last. One entry per phase: what was built, what was verified, any deviation.*

### Phase 0 — Setup
- Cloned from the IDP master via `git archive HEAD | tar -x` (not a raw copy) into this sibling folder.
- Initialised as its own independent repo: `git init -b main`, no remote, not connected to the IDP's git history.
- Ran discovery live in chat using the IDP's `discovery` skill: captured the raw idea verbatim, asked the forced early questions one at a time, built the feature → capability → tier table, scored the craft tier (Essential, 1/10), surfaced open questions, resolved all but three (tracked above and in the brief).
- Wrote `docs/discovery-brief.md` — the full discovery artifact.
- Wrote this `CLAUDE.md` from `template/CLAUDE.md.template`, using only what was actually resolved in discovery.
- Ran `npm run setup` — green (doctor: Node/npm/git/Docker/Supabase CLI all ✓). Noted 5 high-severity npm advisories in the template (brace-expansion, js-yaml, next, postcss, sharp) as an FYI, not acted on — two are a plain `npm audit fix`, three need `--force` and would bump Next out of its pinned range, which is a dependency change requiring explicit go-ahead per convention.
- User confirmed the recommendation: skip doc-gen-master's full set, go straight to App PRD + Data Model & Security given the narrow scope + real auth/data wrinkles.
- Resolved two gaps the PRD needed that discovery hadn't covered: roles (flat/equal for everyone) and delete behavior (soft-delete by default, explicit hard-delete option, audit-logged).
- Wrote `docs/app-prd.md` and `docs/data-model-security.md`, referencing the IDP's existing patterns (`audit-log.ts` for the permanent-delete trail; noted `has_role.sql` is not needed for v1's flat-permission model).

### Phase 1 — Schema + auth
- `template/db/migrations/0003_core_schema.sql` — `locations`, `batches`, `students`, `payments`, `audit_log`, all RLS-enabled with flat `to authenticated` policies (no role tiering); `audit_log` is insert+select only, no update/delete policy for anyone.
- **Found + fixed a real infra bug during first `db:start`:** `supabase/config.toml`'s `project_id` was still `"IDP_Web"` from the archive clone. Supabase CLI names local Docker containers/volumes after `project_id`, so this site's local database was the same shared container as the IDP master's (confirmed by orphaned migrations from an unrelated schema showing up in `migrate:status`). The migration tool's checksum-drift check refused to apply over the foreign history, so nothing was damaged. Changed `project_id` to `"garba_arts_admin"`, stopped the shared stack (non-destructive), started a fresh isolated one, re-verified `migrate:up`/`db:check` clean. Worth raising in a dedicated IDP session — every future clone will hit this until it's fixed at the source.
- Auth: `proxy.ts` (Next.js 16 renamed `middleware.ts` → `proxy.ts` mid-build, discovered via a deprecation warning; migrated: file renamed, exported function renamed `middleware` → `proxy`) protects every route except `/login` by default — this app has no public surface at all. `app/login/page.tsx` + `app/login/actions.ts` (real Supabase auth, rate-limited sign-in attempts via the existing `lib/security.ts` rate limiter). `app/dashboard/page.tsx` is a stub (real build is Task #7) that proves the session (shows the signed-in email + sign-out).
- `tooling/create-account.ts` — invite-only account creation via the service-role admin API (`npm run create-account -- <email> <password>`), since there's no public sign-up page per the App PRD.
- Root `.env.local` + `template/.env.local` created with local dev Supabase keys (the well-known local demo JWTs, gitignored either way).
- Root `.claude/launch.json` (shared across all site sessions in this workspace) gained a `garba-arts-admin-dev` entry on port 3500.
- Fixed the scaffold's default title/homepage: `app/page.tsx` now redirects to `/dashboard`; `app/layout.tsx` reads title/description from `lib/site.ts` and sets `robots: noindex/nofollow` (no public surface); `lib/site.ts`'s `name` set to "The Garba Arts Admin", `legalName` left as an explicit `TBD` (never fabricated). Pages read `site.name` rather than hardcoding it — the pre-commit `ai-tell-lint` hook caught em-dashes in the first draft of this copy (it lints staged application code, not `docs/`/`CLAUDE.md`), fixed by rephrasing and centralizing the name in `site.ts`.
- **Verify — green, tested live in the browser:** unauthenticated `/` and `/dashboard` both redirect to `/login`; sign-in with a real test account redirects to `/dashboard` and shows the session email; sign-out redirects back to `/login`; `tsc --noEmit` clean in `template/`.
- **Found + fixed a second real infra bug, this time in `verify-denial.ts`'s first run:** the service-role client got "permission denied for table locations" even though `service_role` has `rolbypassrls = true`. Checked `information_schema.role_table_grants` directly — this local instance never auto-grants `SELECT`/`INSERT`/`UPDATE`/`DELETE` to `anon`/`authenticated`/`service_role` on new tables (only `REFERENCES`/`TRIGGER`/`TRUNCATE` showed up by default). BYPASSRLS skips row-level filtering but a role still needs the base table-level GRANT to touch a table at all — RLS and GRANT are two separate layers. Rolled `0003_core_schema.sql` back (never deployed anywhere but this local instance), added explicit `grant` statements (matching the convention `0002_keepalive.sql` already used for its function), reapplied — `db:check` clean.
- **`tooling/verify-denial.ts` (new) — the security gate, passing:** seeds one row per table via service-role, then proves the anon (unauthenticated) client is refused both `select` (0 rows, despite the service-role-confirmed row existing) and `insert` on every table, including `audit_log`. Cleans up seeded rows after. `npm run verify:denial` — all 6 checks green.
- **Found + fixed a third real infra bug: local dev login silently authenticated against a different site's user table.** The user tried logging in from their own browser at localhost:3500 and got "Invalid email or password" for the correct test account. Investigation: `docker ps` showed the containers actually bound to ports 54321-54324 were labeled `IDP_Web` with a bind-mount into `upasthiti/supabase/snippets` — the Upasthiti site's stack, still on the inherited default `project_id` AND default ports, had most recently grabbed those ports. This app's `.env.local` still pointed at the default `http://127.0.0.1:54321`, so it was silently talking to Upasthiti's Auth service the whole time — no error, just the wrong project. Confirmed via grep that jules/upasthiti/mba-execution-os all still carry the shared defaults (see decision #13). Fixed by shifting this site's entire Supabase port block +1000 (55321/55322/55320/55329/55323/55324/55327) in `supabase/config.toml`, updating both `.env.local` files and the `auth.site_url`/`additional_redirect_urls`, then `db:start` — confirmed via `docker ps` the new containers are uniquely named `..._garba_arts_admin` on the new ports, coexisting with Upasthiti's stack rather than colliding. The existing schema/migrations/test-account survived (same named Docker volume, only the port binding was ever wrong). Re-verified `db:check` clean, `verify:denial` all 6 green, and login working live in the browser, all against the correctly isolated instance.
- Next: build the students/leads CRUD (Task #5) — the first real feature, now that auth + RLS + the denial gate are all proven, and the local dev environment is genuinely isolated from sibling sites.

### Phase 2 — Full feature build (students/leads, payments, dashboard, CSV export)
- `lib/status.ts` — the starter status-tag list (inquiry/demo_scheduled/demo_done/joined/not_interested/dropped), explicitly not an enforced pipeline; unconfirmed with the owner (open item #4).
- `app/app-shell.tsx` — shared header/nav (Dashboard/Students links, signed-in email, sign out), used by every authenticated page instead of duplicating the header per-route.
- `app/students/actions.ts` — server actions for the full lifecycle: `createStudent`, `updateStudent`, `archiveStudent`/`restoreStudent` (soft-delete), `permanentlyDeleteStudent`, `addPayment`, `archivePayment`/`permanentlyDeletePayment`. All run through the RLS-scoped server client (not service-role) so app code never bypasses the policies it's supposed to prove.
- `app/students/page.tsx` — the fast "add inquiry" form (the single most frequent action per discovery) at the top, then search/filter (name/phone/location/batch/status) over a table showing computed paid/balance per row.
- `app/students/[id]/page.tsx` — full edit form, fee summary (fee/paid/balance), payment-logging form, payment history with per-payment archive/remove, and the student-level archive/restore/permanently-remove actions.
- `app/dashboard/page.tsx` — real summary cards (inquiries this month, demo→joined conversion, total students/leads, total collected) plus headcount-by-location and headcount-by-batch breakdowns, replacing the Phase 1 stub.
- `app/api/export/students/route.ts` — CSV export honoring the same filters as the students list (location/batch/status/search), computing paid/balance per row same as the UI.
- **Found + fixed a real bug during live testing (not caught by typecheck/build):** permanently deleting a student that had payments failed — `payments_student_id_fkey` has no `ON DELETE CASCADE`. Fixed by having `permanentlyDeleteStudent` explicitly delete the student's payments first, capturing their full snapshot in the same audit-log entry (`meta.payments`) so the history survives even after the rows are gone.
- **Found + fixed a second bug from the same test:** the audit-log write was ordered *before* the delete in both `permanentlyDeleteStudent` and `permanentlyDeletePayment`. When the FK-constraint bug above made the delete fail, the audit trail still recorded a false "permanently_deleted" entry — an action that never actually happened. Reordered both functions to write the audit entry only after the delete succeeds. Confirmed via a direct `audit_log` query that the stray false-positive row from the bug is now impossible to reproduce (the corrected flow was re-tested and produces exactly one accurate entry).
- Em-dash placeholders (`'—'` for "no value", used as literal display characters, not prose) tripped `ai-tell-lint` on the new `students`/`dashboard` pages — replaced with plain hyphens across those three files. `tooling/verify-denial.ts` was flagged too, but only because it was linted via an explicit CLI path for this check; `tooling/` is exempt from the pre-commit hook's staged-file lint, so it needed no changes.
- **Verify — green, every flow tested live in the browser end-to-end, not just typechecked:** add inquiry → appears in list with correct fields; edit saves; log payment → paid/balance update correctly on both the detail page and the list; dashboard numbers match (1 inquiry, 1 total, ₹500 collected, no conversion yet); CSV export returns correct headers/rows with the right `Content-Disposition`; archive removes from the default list view and shows the archived banner + restore; permanently-remove works both from an archived record and directly from an active one (with payments), and the audit_log entry correctly captures the full snapshot including payment history. `tsc --noEmit` clean, `next build` clean (all 9 routes), `verify:denial` still 6/6 green after all the new routes.
- Next: nothing blocking. Remaining work is content (real locations/batches/team accounts/Excel import), token customization (still the placeholder magenta palette), and deploy.
