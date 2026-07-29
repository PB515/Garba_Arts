# Website IDP — Build Charter

*This is the spec Claude Code builds the IDP from. It is the guardrail: build in the slice order below, verify each slice before the next, and **do not build anything in §8 or anything not asked for.** The IDP is built using the toolkit's own method — so it gets its own `CLAUDE.md` and build log, like any project.*

---

## 1. What we're building, and why

A **base starter repo for producing deployable websites via vibe coding** — not arbitrary software, websites. You clone it for each new site; the generic ~80% (scaffold, patterns, tooling, conventions) is already present, and you edit only the per-site ~20% (Brief, brand, tokens, products, business logic).

Scope of "websites": marketing sites, e-commerce, portals, CMS-backed sites, portfolios — the structural types in `site-type-coverage-roadmap.md`.

This is not speculative. It is the distillation of **four real, shipped builds** — Bugadi.co (e-commerce + OMS), the Purven portfolio (personal brand + CMS), the Patel CA site (marketing + client portal), Inspire Academy (marketing + ops + parent portal) — and their four retrospectives. **Every component below traces to a concrete, repeated pain across those builds.** If a proposed addition can't be traced to one, it doesn't go in.

---

## 2. Structure to scaffold

```
website-idp/
├── docs/                         the "brain": SOP + golden paths (IDP-level, shared)
│   ├── playbook.md  ·  sop.md  ·  comprehensive-guide.md  ·  conventions.md
│   ├── doc-gen-master.md         generates per-site docs 01–11 from Brief + research
│   ├── golden-paths/             per-TYPE recipes: ecommerce · portal · portfolio · marketing
│   ├── modules/                  reusable capabilities: billing-gst · pwa · anti-ai-look
│   ├── runbooks/                 deploy · secrets · migrations · platform-constraints
│   └── prompts/                  business-brief · deep-research-business · deep-research-personal-brand · image-gen
│
├── .claude/skills/               frontend-design · taste-skill · motion · INDEX.md
│
├── template/                     the pre-built generic 80% — cloned & customised per site
│   ├── app/                      Next.js App Router scaffold
│   ├── app/globals.css           the TOKEN MECHANISM — required-to-customise, NOT a default
│   ├── lib/
│   │   ├── site.ts               brand/contact constants            ← edited per site
│   │   ├── icons.ts  ·  security.ts
│   │   ├── supabase/             4-client split + generated types
│   │   ├── integrations/         adapter boundary: payments/ shipping/ (stubs)
│   │   └── patterns/             audit-log · two-query-write · view-edit-form · empty-state · has_role()
│   ├── db/migrations/            versioned SQL + applied-state table
│   ├── tests/                    unit tests for risky pure logic (tax · ledger · idempotency)
│   ├── .env.example  ·  .gitattributes
│   └── CLAUDE.md.template         context-anchor + decision-log + build-log shape  ← filled per site
│
├── tooling/                      the new automation (the four retros' #1 ask)
│   ├── migrate                   up / status / down + db:check drift detection
│   ├── verify                    seed / snapshot / teardown harness (non-prod DB)
│   ├── env-validate              boot check: no secret-shaped NEXT_PUBLIC_, key prefixes/lengths
│   ├── deploy-check              validates the deploy-readiness manifest before go-live
│   └── ai-tell-lint              em-dash + AI-phrase linter (pre-commit)
│
├── README.md  ·  CHANGELOG.md     the IDP's own map + version history
└── CLAUDE.md                      the IDP project's OWN context anchor (for building the IDP)
```

**IDP-level vs per-site:** everything in `docs/`, `.claude/skills/`, `tooling/`, and the `template/` *shapes* is IDP-level (shared, ships in the starter). The *filled* per-site artifacts — the 01–11 docs, the build log, the live `CLAUDE.md`, the tokens, `lib/site.ts` values — are generated/edited when you clone for a build, and live in that site's repo. The starter ships the templates; the build fills them.

---

## 3. Principles (the discipline — hold these the whole build)

1. **Build less.** The single loudest lesson across all four retros. A lean IDP with a migration runner and a handful of templates beats a bloated one. When unsure, don't.
2. **Demand-driven only.** Every component traces to a concrete, repeated pain across the four builds. No speculative tooling.
3. **Visual identity is required per site, never a default.** `globals.css` ships as required-to-customise. Keeping the defaults is how you get the "AI-made look." This is the anti-sameness rule — the IDP standardises the *plumbing*, never the *skin*.
4. **Brief + research stay the per-site core.** They're the substance the IDP can't pre-bake. The IDP makes everything *around* them faster.
5. **Documents are the thinking; tooling executes.** The docs encode the method; the runners/checks automate the mechanics.

---

## 4. The proven core to harden into defaults (bake in; don't reinvent)

These are validated across all four builds — they become the conventions and the `template/` defaults:

- **Context anchor** (`CLAUDE.md`: Current Status + "Decisions made — do not revisit" + the build log) — the highest-value artifact in every retro; survived mid-build compactions with near-zero loss.
- **Security-first ordering**: auth → RLS → **prove logged-out / cross-user denial** → then features. Caught real access bugs in two builds before they shipped.
- **Tokens-only, no hardcoded hex.**
- **Phase → green build → commit → push → deploy** as the inner loop; one branch per phase; always shippable.
- **Adapter boundaries** for every external service (payments/shipping/social) — made real pivots trivial.
- **Verify-then-rollback** — place real data, verify end-to-end, script a clean teardown.
- **Bucket → slice decomposition** as the default unit of work.

---

## 5. Build order — slices (Tier-1 first; verify each before the next)

Build these in order. Each slice is self-contained and testable. After each, update the IDP's own `CLAUDE.md` status block + build log, then stop and verify before continuing.

**Slice 0 — Skeleton.** Scaffold the folder structure in §2. Move the existing toolkit docs into `docs/` (see §9). Write `README.md`, the IDP's own `CLAUDE.md` (status block + decisions + build log), and a starter `CHANGELOG.md`. *Verify: the tree matches §2; the docs are in place.*

**Slice 1 — Migration runner (the #1 gap in all four retros).** `tooling/migrate` with `up` / `status` / `down`, a `db_meta` applied-state table, and `db:check` drift detection. Wire `supabase gen types typescript` into a step so row types are generated, not hand-written. *Verify: apply a sample migration, check status, run drift detection, roll it back.*

**Slice 2 — Patterns + day-1 lib.** `template/lib/`: `site.ts` (brand/contact constants), `icons.ts` (re-export), `security.ts` (honeypot + rate-limit), the 4-client Supabase split, and `patterns/` (audit-log, two-query-write, view-edit-form, chip-list-editor, empty-state, `has_role()` SQL). Plus `.env.example` and `.gitattributes` (`* text=auto eol=lf`). *Verify: each pattern compiles and is documented with a one-line "use when."*

**Slice 3 — Deploy / ops / secrets (the costliest detours in the retros).** `tooling/env-validate` (no secret-shaped `NEXT_PUBLIC_`, validate key prefixes/lengths, fail loud on missing required vars), `tooling/deploy-check` (validates a deploy-readiness manifest), and the runbooks: `deploy.md`, `secrets.md` (never paste in chat; rotate on exposure; service-role is server-only crown jewels), `migrations.md`, `platform-constraints.md` (Vercel 4.5 MB body limit → browser→Storage upload; production alias vs deployment-hash URLs; stale-dev-CSS → restart). Add "deploy + smoke test" as a named phase in the SOP. *Verify: env-validate catches a deliberately secret-shaped public var and a truncated key.*

**Slice 4 — Verification / test harness.** `tooling/verify` exposing the service-role client + `seed()` / `snapshot()` / `teardown()` against a **non-prod** DB (local or per-run schema), plus pre-written unit tests in `template/tests/` for the risky pure logic class (tax/place-of-supply, stock ledger, idempotency). *Verify: seed → assert → teardown leaves the DB clean; the unit tests run.*

**Slice 5 — Visual layer.** The `globals.css` token mechanism (shipped required-to-customise), `.claude/skills/` (frontend-design, taste-skill, motion, INDEX.md), the anti-AI-look wiring (token step before UI, distinctive-libraries note), and `tooling/ai-tell-lint` on pre-commit. *Verify: the lint flags an em-dash and an AI-phrase; the token file is clearly marked "replace per site."*

**Then validate the whole thing by using it (§7).**

---

## 6. Tier-2 — golden-path content (separate slices, AFTER the MVP is proven)

Do not start these until Slices 0–5 are built and validated. Each is its own later slice: the **billing-GST + payments** module (`docs/modules/` + `lib/integrations/` stubs), the **PWA** one-command wrapper (`pwa-setup-nextjs.md` made a default), the **golden-paths/** per-type recipes, a **re-plan gate** for scope growth, a **content-model artifact** (static-in-code vs CMS-editable, decided before schema), a **mobile/theme review gate**, and **spacing-scale tokens** (`--space-tight/section/major`).

---

## 7. How to build it, and how to know it's done

- **Process:** spec-first (this charter) → slices in order → verify each → update the IDP's own `CLAUDE.md` + build log every slice → never move ahead of a failing verify. Build the IDP the way the IDP teaches.
- **Validation gate (the real test):** once Slices 0–5 are built, **clone the starter and build one small throwaway website from it, end to end.** If a clean, deployable site comes out — non-default tokens, security-first authed section if any, a migration applied via the runner, env validated — the golden path works and the IDP is real. If it doesn't, fix the starter, not the test site.

---

## 8. Do NOT build (the guardrail — refuse these)

- **More skills** beyond frontend-design / taste-skill / motion. Skills are big; patterns are small. Most gaps want patterns.
- **A custom CSS framework** — Tailwind v4 + tokens is the right level.
- **A migration ORM** (Prisma/Drizzle/Kysely) — SQL files + drift detection is enough.
- **A component library** — shadcn/ui (copy-paste, owned by the project) is the model.
- The rejected-ledger items: a **Strategy Blueprint (doc 00)**, a **CRM / Lead-Handling doc (12)**, a **folder restructure**, a **version rename**, shadow/icon **micro-skills**.
- Anything not asked for in this charter. If it seems useful, log it; don't build it.

---

## 9. Input manifest — the files to give Claude Code

Put these in the folder alongside this charter. Most you already have from the toolkit work; this charter is the only new piece.

**This charter** → the spec. Point Claude Code at it first.

**Into `docs/` (the toolkit brain — you have these):**
- `Vibe-Coding-Playbook-v4.md` → `playbook.md`
- `SOP.md` → `sop.md`
- `Comprehensive-Guide.md` → `comprehensive-guide.md`
- `doc-gen-master.md` → as-is
- (Claude Code writes `conventions.md` by extracting the frozen rules from the Playbook's Safety Rails.)

**Into `docs/prompts/` (you have these):**
- `business-brief.md`, `deep-research-business.md`, `deep-research-personal-brand.md`, the image-gen prompt.

**Into `docs/modules/` + `docs/golden-paths/` (you have these):**
- `billing-and-gst-module.md` → `modules/billing-gst.md`
- `pwa-setup-nextjs.md` → `modules/pwa.md`
- `site-type-coverage-roadmap.md` → seeds `golden-paths/`
- `skills-library-sop.md` → the skill-lifecycle doc
- The **anti-AI-look** content lives in `bugadi-claude-code-kickoff.md` §3 + backlog entry 9 — Claude Code extracts it into `modules/anti-ai-look.md`.

**Into `.claude/skills/` (you have these):**
- `frontend-design/`, `taste-skill/SKILL.md`, `motion/`, `INDEX.md`.

**Reference / evidence (the "why" — you have these):**
- The four retros (Bugadi, Purven, Patel CA, Inspire Academy) → `docs/retros/`, as the source behind every decision.
- `v4-backlog.md` → the running build-list; the source this charter was distilled from.

**Per-site examples (do NOT put in the starter — they're build outputs, kept only as references):**
- `bugadi-business-brief.md`, `bugadi-product-data-template.md`, `bugadi-claude-code-kickoff.md`, `reconciliation-purven-portfolio.md`.

---

*Hand Claude Code this charter + the manifest files, and instruct it: "Build Slice 0, then stop and let me verify. Then Slice 1. Hold to §8. Update your CLAUDE.md and build log each slice." That is the whole engagement.*
