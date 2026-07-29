# v5 Backlog — the IDP version

*The consolidated backlog for v5, which **is** the IDP. Distilled from four shipped builds — Bugadi.co, the Purven portfolio, the Patel CA site, Inspire Academy — and their retrospectives, plus the v4→v5 seeds. Organised by the IDP triage: build now (Tier 1), later (Tier 2), bake-in (proven core), rejected. Same admission filter as always — concrete failure / demand-driven, never tidy structure; **build less.** Pairs with `idp-build-charter.md` (the charter is the build plan and slice order; this is the item ledger you track over time). `v4-backlog.md` remains the historical v4 record.*

*Source tags: **B** = Bugadi · **P** = Purven portfolio · **C** = Patel CA · **A** = Inspire Academy · **(all 4)** = surfaced in every build.*

---

## Tier 1 — the IDP MVP (build now; the convergent inner-loop)

These are the gaps all four builds hit. They are the reason the IDP exists.

1. **Migration runner + drift detection + generated types.** Versioned `db/migrations/NNNN`, a `db_meta` applied-state table, `db:check`, and `supabase gen types` wired in. *(all 4) — the #1 recurring pain; caused silent production failures (C, B).*
2. **Project-init + patterns + day-1 lib.** `lib/site.ts` (brand/contact constants from day 0), `icons.ts`, `security.ts`, the 4-client Supabase split, `has_role()` SQL, and `patterns/` (audit-log, two-query-write, view-edit-form, chip-list, empty-state). Plus `.env.example`, `.gitattributes`. *(all 4) — every build reinvented these; the brand-constant gap forced a multi-file rebrand (B).*
3. **Verification / test harness.** `seed/snapshot/teardown` against a non-prod DB + pre-written unit tests for the risky pure logic (tax/place-of-supply, stock ledger, idempotency). *(all 4) — verification was all manual + throwaway scripts; the risky logic is unguarded.*
4. **Deploy / ops / secrets, first-class.** `env-validate` (no secret-shaped `NEXT_PUBLIC_`, key prefix/length), `deploy-check`, the deploy/secrets/migrations/platform-constraints runbooks, and "deploy + smoke test" as a named phase. Folds in the reopened **secrets-hardening** and **share-the-production-alias-not-the-deployment-URL**. *(all 4) — the costliest detours; real secret-exposure incidents (B, P, A).*
5. **Local-dev robustness.** Guard build-vs-dev `.next` corruption; `.gitattributes` for CRLF. *B (build-vs-dev corruption), C/A (CRLF noise).*
6. **Visual layer.** The `globals.css` token mechanism shipped *required-to-customise*, the skills (frontend-design / taste-skill / motion / INDEX), the anti-AI-look wiring (tokens before UI), and the AI-tell linter on pre-commit. Folds in the **AA separate-CTA-shade** rule. *(all 4) — "looks AI-made" feedback; AA-fail on one accent (P); manual AI-tell hygiene (C).*

## Tier 2 — golden-path content — ALL DONE ✅

*Tier-1 MVP complete; Tier-2 fully built (concept already proven on other sites).*

7. ✅ **Billing-GST + payments module** — GST logic (`lib/logic/tax.ts`) + invoice logic with GST snapshot + credit-note reversal (`lib/logic/invoice.ts`, tested) + payments adapter (`razorpay.ts`, real signature verify) + `docs/modules/billing-gst.md`.
8. ✅ **PWA** — `app/manifest.ts` + `public/sw.js` + `lib/pwa/register-sw.tsx` + `docs/modules/pwa.md`.
9. ✅ **Golden-paths per type** — `docs/golden-paths/{ecommerce,portal,portfolio,marketing}.md`.
10. ✅ **Coverage-roadmap + skills-SOP** — `docs/golden-paths/README.md` (index) + `docs/skills-sop.md` (skill lifecycle).
11. ✅ **Adapter-boundary principle** — `docs/modules/adapter-boundary.md` + `lib/integrations/payments` & `shipping`.
12. ✅ **Re-plan gate** — `docs/gates.md`.
13. ✅ **Content-model artifact** — `docs/modules/content-model.md`.
14. ✅ **Mobile / theme review gate** — `docs/gates.md`.
15. ✅ **Spacing-scale tokens** — `globals.css` (Slice 5).
16. ✅ **Split the No-List** — `docs/gates.md`.

## Bake in — the proven core (harden into defaults; not "build")

Validated across all four builds; these become the conventions + `template/` defaults:

- **Context anchor** (`CLAUDE.md`: Current Status + "Decisions made — do not revisit" + the build log) — the single highest-value artifact in every retro; survived mid-build compactions.
- **Security-first ordering** (auth → RLS → prove denial → features) — caught real access bugs (C, A).
- **Tokens-only, no hardcoded hex.**
- **Phase → green build → commit → push → deploy** loop.
- **Adapter boundaries** for every external service.
- **Verify-then-rollback.**
- **Bucket → slice** as the unit of work.

## Rejected / do-not-build (kept logged so they don't creep back)

- ~~**More skills** beyond frontend-design / taste-skill / motion~~ — **reversed 2026-07.** 12 skills added in one pass (power-design, shadcn, style-directions, ui-ux-pro-max, GSAP ×8) after a direct SOP-filter review in chat, at the user's explicit direction ("executive permission"). The original "build less" reasoning (four retros, avoid maintenance surface unproven by real use) still applies going forward as the *filter* for the next addition — it just isn't a hard 3-skill cap anymore. See `docs/skills-sop.md` for the current member list and the filter. None of the 12 are validated on a real IDP build yet (tracked in `CLAUDE.md`'s Known gaps).
- ~~**a component library** (shadcn is the model)~~ — **reversed 2026-07.** shadcn was explicitly named as the example of what not to build, for real reasons: it homogenizes UI across sites (cuts against the IDP's stated anti-sameness positioning), and its registry/preset/upstream-update workflow is a genuinely new maintenance surface nothing else in the IDP has. Brought in anyway at the user's explicit direction, after that tension was surfaced and acknowledged, not silently. Worth re-litigating for real if a site build shows the homogenization risk was overstated, or confirms it wasn't.
- **a custom CSS framework**; **a migration ORM** (SQL files + drift detection is enough). *Still holds — all four retros' explicit "build less."*
- From the v4 ledger: **Strategy Blueprint (doc 00)**, **CRM / Lead-Handling (doc 12)**, **folder restructure**, **version rename**, **shadow/icon micro-skills**.
- **SEO keyword plan (doc 06c)** — *deferred*; revisit only if a real-traffic site shows the lack hurts ranking.

## Closed

- **doc-gen-master's first real run** — the one open question; it ran across all four builds and worked. Closed.
- **`template/.env.example` missing from the repo** — `.gitignore`'s `.env*` rule had silently excluded it since Slice 2; fixed with a `!.env.example` exception + the file recreated from `env-validate.ts`'s schema. Found by the §7 validation build.
- **Finish §7 validation (DB half)** — Docker Desktop installed (2026-07-09); ran `db:start` → `migrate:up` → `migrate:status` → `db:check` → `verify:selftest` against a real local Postgres. All green: both migrations applied + types regenerated, no drift, seed→assert→teardown left the DB clean. The whole system (not just individual slices) is now proven end to end.

---

*Maintenance: when a new build surfaces a gap, add it here with its source tag and run it through the filter before it earns a tier. The charter turns Tier 1 into the build order; this ledger is where status lives over time.*
