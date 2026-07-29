# CLAUDE.md — garba-arts-admin

*The context anchor for this site. Filled per build, kept in the repo root, read first every session.*

---

## What this is

An internal admin/CRM tool for **The Garba Arts**, a garba dance class with 2 locations and 6 batches. Replaces an Excel sheet for tracking inquiries/leads (from WhatsApp, Instagram, referrals, or walk-ins), demo attendance, enrollment status, and fee payments (cash/UPI, often partial/split). Used only by the 5–8 person core team — no client, student, or public-facing surface exists anywhere in this build. Full context: [`docs/discovery-brief.md`](docs/discovery-brief.md).

## Current status

- **Phase:** 1 of N — Schema + auth done, verified live; features not yet built
- **Last completed:** Core schema migration (locations/batches/students/payments/audit_log, all RLS) applied and verified on a freshly-isolated local Supabase instance. Real auth wired end-to-end (login/session/logout) and tested live in the browser. Fixed a real infra bug along the way — this site's local Supabase `project_id` was still the IDP's own, causing a shared-database collision (see build log).
- **Next up:** Task #4 — prove cross-user denial (the security gate; must pass before any CRUD feature is built), then students/leads CRUD → payments → dashboard → CSV export → CSV import (once the Excel file lands).
- **Last commit:** `303ca54` — core schema migration + project_id fix (auth work not yet committed as of this edit)
- **Resume note:** Four open items block nothing about continuing the build, but do block finishing certain features — don't invent values for them: (1) Excel import file, (2) real names for the 2 locations + 6 batches, (3) the 5–8 team members' actual names/emails for account creation, (4) final confirmation of the starter status-tag list in `data-model-security.md`. Full detail in `docs/app-prd.md`'s and `docs/data-model-security.md`'s "Open items" sections. Local dev: `npm run db:start` then `npm run dev` (port 3400, also registered in the workspace-root `.claude/launch.json` as `garba-arts-admin-dev`). Test account: `owner@thegarbaarts.local` / `TempPass123!` — a throwaway local-only credential, replace with real team accounts via `npm run create-account` once names/emails are provided.

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
13. **This site's local Supabase `project_id` is `garba_arts_admin`**, changed from the archive's inherited `"IDP_Web"`. Do not revert — that caused a real shared-database collision with the IDP's own local dev stack (see Phase 1 build log). Every future IDP clone needs the same fix; flag it in a dedicated IDP session.
14. **Local dev runs on port 3400**, registered as `garba-arts-admin-dev` in the workspace-root `.claude/launch.json` (shared across all site sessions — each site owns one port to avoid collisions).
15. **`middleware.ts` → `proxy.ts`, mid-build.** Next.js 16 renamed the convention (file name + exported function `middleware` → `proxy`) while this app was being built; not a deviation, just built against a moving target — noted so a future session isn't confused finding `proxy.ts` instead of `middleware.ts`.

## Where things live

- Tokens → `template/app/globals.css`
- Brand/contact constants → `template/lib/site.ts`
- Schema + migrations → `template/db/migrations/`
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
- Root `.claude/launch.json` (shared across all site sessions in this workspace) gained a `garba-arts-admin-dev` entry on port 3400.
- Fixed the scaffold's default title/homepage: `app/page.tsx` now redirects to `/dashboard`; `app/layout.tsx` reads title/description from `lib/site.ts` and sets `robots: noindex/nofollow` (no public surface); `lib/site.ts`'s `name` set to "The Garba Arts — Admin", `legalName` left as an explicit `TBD` (never fabricated).
- **Verify — green, tested live in the browser:** unauthenticated `/` and `/dashboard` both redirect to `/login`; sign-in with a real test account redirects to `/dashboard` and shows the session email; sign-out redirects back to `/login`; `tsc --noEmit` clean in `template/`.
- Next: prove cross-user denial (Task #4) before building any CRUD feature.
