# CLAUDE.md — garba-arts-admin

*The context anchor for this site. Filled per build, kept in the repo root, read first every session.*

---

## What this is

An internal admin/CRM tool for **The Garba Arts**, a garba dance class with 2 locations and 6 batches. Replaces an Excel sheet for tracking inquiries/leads (from WhatsApp, Instagram, referrals, or walk-ins), demo attendance, enrollment status, and fee payments (cash/UPI, often partial/split). Used only by the 5–8 person core team — no client, student, or public-facing surface exists anywhere in this build. Full context: [`docs/discovery-brief.md`](docs/discovery-brief.md).

## Current status

- **Phase:** 0 of N — Setup (freshly cloned from the IDP, discovery brief written, no application code yet)
- **Last completed:** Discovery run live in chat; sibling repo created via `git archive` from the IDP; independent git history initialised (no remote).
- **Next up:** `npm run setup`, confirm green, then decide doc-gen-master's full doc set vs. a focused App PRD + Data Model & Security doc (this build's data/auth model has real wrinkles — see Decisions below — so the focused-doc path is likely, pending user confirmation).
- **Last commit:** none yet (working tree only)
- **Resume note:** Discovery is fully resolved except three explicitly-open items tracked in `docs/discovery-brief.md`'s final section (Excel import file pending, batch/location real names pending, team member list for accounts pending). Do not invent placeholder values for these — ask.

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

## Where things live

- Tokens → `template/app/globals.css`
- Brand/contact constants → `template/lib/site.ts`
- Schema + migrations → `template/db/migrations/`
- Discovery brief (this build's spec source) → `docs/discovery-brief.md`
- Project docs (once generated) → `docs/01…11`

---

## Build log

*Newest last. One entry per phase: what was built, what was verified, any deviation.*

### Phase 0 — Setup
- Cloned from the IDP master via `git archive HEAD | tar -x` (not a raw copy) into this sibling folder.
- Initialised as its own independent repo: `git init -b main`, no remote, not connected to the IDP's git history.
- Ran discovery live in chat using the IDP's `discovery` skill: captured the raw idea verbatim, asked the forced early questions one at a time, built the feature → capability → tier table, scored the craft tier (Essential, 1/10), surfaced open questions, resolved all but three (tracked above and in the brief).
- Wrote `docs/discovery-brief.md` — the full discovery artifact.
- Wrote this `CLAUDE.md` from `template/CLAUDE.md.template`, using only what was actually resolved in discovery.
- Next: `npm run setup`.
