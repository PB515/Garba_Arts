# Changelog — Website IDP

*Version history for the IDP itself. The IDP is v5 of the toolkit lineage (v4 was the last document-only toolkit; v5 **is** the IDP). Each slice that lands is recorded here. The per-slice working detail lives in `CLAUDE.md`'s build log; this is the released-summary view.*

---

## Unreleased (in progress)

### Slice 0 — Skeleton ✅
- Scaffolded the full directory structure (charter §2).
- Moved the v4 toolkit docs into `docs/` (playbook, sop, comprehensive-guide, doc-gen-master, prompts, billing-gst module, v4-backlog, the build charter) and the two available retros into `docs/retros/`.
- Placed the `frontend-design` and `taste-skill` skills under `.claude/skills/`.
- Authored the IDP's own `README.md`, `CLAUDE.md`, this `CHANGELOG.md`, the `BACKLOG.md` (v5 ledger), `docs/conventions.md` (from the Playbook Safety Rails), and `template/CLAUDE.md.template`.

### Slice 1 — Migration runner ✅ (verified)
- Made the IDP a Node/TypeScript project (`package.json`, `tsconfig.json`; dev-deps `pg` · `tsx` · `supabase`, no global installs).
- `tooling/migrate.ts` — `up` / `down` / `status` / `check` / `types`, a `db_meta` applied-state table with checksums, transactional apply/rollback, and drift detection (pending / modified / orphan).
- Plain-SQL migration format (`-- migrate:up` / `-- migrate:down`) + a reference `0001_example.sql`; `supabase gen types` wired into `up`.
- Verified end-to-end against a local Supabase Postgres (apply → status → drift → rollback → drift-failure path → types), typecheck clean.

### Slice 2 — Patterns + day-1 lib ✅ (verified)
- Landed the Next.js scaffold in `template/` (Next 16.2.9 · React 19.2.4 · Tailwind v4 · App Router · TS).
- Built `lib/`: `site.ts`, `icons.ts`, `security.ts`, the 4-client Supabase split (browser / server / middleware / service-role), and `patterns/` (empty-state, chip-list-editor, view-edit-form, audit-log, two-query-write, has_role.sql) — each with a "use when".
- Added `.env.example` and `.gitattributes`.
- Verified: `tsc --noEmit` clean and `next build` green.

### Slice 3 — Deploy / ops / secrets ✅ (verified)
- `tooling/env-validate` — flags secret-shaped `NEXT_PUBLIC_` vars (incl. service_role JWTs), wrong/truncated keys, and missing required vars.
- `tooling/deploy-check` — validates `deploy-readiness.json`: required env + per-site placeholders replaced + the manual smoke-test list.
- Runbooks: `deploy.md`, `secrets.md`, `migrations.md`, `platform-constraints.md`; pre-flight wired into SOP Step 7.
- Verified: catches a service_role JWT in a public var and a truncated key (exit 1); good env passes; deploy-check flags placeholders.

### Slice 4 — Verification / test harness ✅ (verified)
- `tooling/verify` — service-role client + `seed`/`snapshot`/`teardown` against a non-prod DB (with a guard against remote URLs); `selftest` proves seed → assert → teardown leaves the DB clean.
- `template/lib/logic/` — tested reference implementations of the risky pure logic: tax/place-of-supply (GST), stock ledger (oversell guard), idempotency (run-once-by-key).
- `template/tests/` — 15 Vitest unit tests across the three. Bumped Vitest to 4 to clear a dev-only critical advisory.
- Verified: harness self-test clean, `db:check` clean, 15/15 tests pass.

### Slice 5 — Visual layer ✅ (verified) — **Tier-1 MVP complete**
- `globals.css` token mechanism — Tailwind v4 tokens shipped *required-to-customise* (loud placeholder palette, AA accent pair, named spacing scale).
- `tooling/ai-tell-lint` (+ pre-commit hook) — flags em-dashes and AI-tell phrases in copy.
- `docs/modules/anti-ai-look.md` — tokens-before-UI, the tells, the AA-contrast CTA rule.
- `.claude/skills/motion` — authored from the backlog spec; skills `INDEX.md` finalized.
- Verified: lint flags an em-dash and AI-phrases, clean copy passes, token file clearly marked, template still builds green.

---

### Portability ✅ (verified)
- Cross-platform: runs on Windows / macOS / Linux. No hardcoded machine paths (verified).
- `tooling/doctor` (`npm run doctor`) checks Node / npm / git / Docker / supabase CLI; `SETUP.md` first-run + move-machine guide; root `.gitattributes` (LF), `.nvmrc`, `setup`/`doctor` scripts.

### Tier-2 batch 1 ✅ (verified)
- **#11 Adapter boundary** — `lib/integrations/payments` & `shipping` (interface + env-driven factory + server-only provider stubs; Razorpay signature verify is real) + `docs/modules/adapter-boundary.md`.
- **#13 Content-model** doc · **#12/#14/#16 process gates** (`docs/gates.md`) · **#15 spacing tokens** (confirmed).
- **#7 Billing-GST** integration layer (payments stub + GST logic); full module deferred.
- Template still typechecks + builds green.

### Tier-2 batch 2 ✅ (verified) — all Tier-2 complete
- **#7 Billing** — `lib/logic/invoice.ts` (GST snapshot per line + credit-note reversal), tested.
- **#8 PWA** — `app/manifest.ts` + `public/sw.js` + `lib/pwa/register-sw.tsx` + doc.
- **#9 Golden-paths** — ecommerce · portal · portfolio · marketing recipes.
- **#10 Coverage index + skills-SOP**.
- 19 tests pass; build green.

### Repo
- `git init` on `main`; baseline commit + Tier-2 commit. Add a remote to push.

### Hardening pass + full §7 validation ✅
- CI (`.github/workflows/ci.yml`), auto-installed pre-commit hook, motion-skill gap formally closed, `template/.env.example` bug found and fixed (silently gitignored since Slice 2), Docker installed and the DB-dependent half of §7 run clean. Full detail in `CLAUDE.md`'s build log.

### Skills-library expansion — 12 skills added ✅ (unvalidated)
- Added `power-design`, `shadcn`, `style-directions` (66 aesthetic presets), `ui-ux-pro-max`, and GSAP as 8 skills (`gsap-core`/`-timeline`/`-scrolltrigger`/`-react`/`-frameworks`/`-plugins`/`-performance`/`-utils`, a second sanctioned animation library alongside Motion). Updated `frontend-design` to a more developed version.
- Reverses two prior rejected-ledger entries ("more skills," "a component library") — logged explicitly in `BACKLOG.md`, not silently overwritten.
- Extended `docs/modules/adapter-boundary.md` with a general polyglot-boundary principle. Retired the stale "3-skill cap" in `docs/skills-sop.md` / `INDEX.md`.
- Not yet validated on a real build — tracked in `CLAUDE.md`'s Known gaps.

## Status

**Feature-complete per the charter + v5 backlog: Tier-1 MVP + portability + all Tier-2 + hardening + full §7 validation + skills-library expansion.** Pushed to `github.com/PB515/IDP`. Next: validate the new skills on a real site build; the two overlap questions flagged in `CLAUDE.md`'s Known gaps.
- Slice 4 — Verification / test harness.
- Slice 5 — Visual layer (tokens + skills + ai-tell-lint).

---

## Lineage (for context)

- **v5 — the IDP (this repo).** Turns the document toolkit into a clonable starter: a migration runner, day-1 patterns, deploy/ops tooling, a verify harness, and the visual layer — distilled from four shipped builds.
- **v4** — last document-only toolkit: runtime-dependency fallback, analytics-as-a-choice, Step 9 maintenance, the authenticated-app extension, `doc-gen-master`, the two research paths, the skills library. History in `docs/v4-backlog.md`.
