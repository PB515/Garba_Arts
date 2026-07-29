# SPEC — `discovery` skill (working name; rename anytime)

*The contract. Changes rarely. Source of truth for "what is this agent." The dated diary lives in `BUILD-LOG.md`; live progress in the session task list.*

## One-line job
Turn a fuzzy client website idea into a **structured, buildable brief** the rest of the IDP pipeline can consume.

## Where it sits in the IDP pipeline
**Discovery (this, NEW Step 0) → business brief + deep research → `doc-gen-master` (docs 01–11) → set tokens + craft tiers → build (IDP 80% + craft 15%) → verification matrix → deploy.**

It is the missing front door: today the IDP starts at "brief + research" but nothing helps decide *what the site should be* and *how much craft each part earns*.

## Input → Output contract
- **Input:** a raw client conversation / idea (any fidelity — a sentence or a transcript).
- **Output:** a single structured artifact —
  1. **Feature list**, each feature mapped to → (a) an **IDP capability** [ecommerce / portal / payments / auth / CMS / marketing … from `docs/golden-paths/`], (b) a **craft tier** [Essential / Signature / Flagship, from craft-lab `WHEN-TO-USE.md`], (c) a **rough perf/effort implication**.
  2. **Site map / section list** with the tier per section.
  3. **Open questions** to put back to the client.
  4. A **brief** sharp enough to feed `doc-gen-master`.

## HARD CONSTRAINT — portability (must run on any PC + any Claude Code account)
The portable unit is the **IDP repo** (clones per-site, already cross-platform, no hardcoded paths). Therefore:
- The skill + every doc it needs at runtime **ship INSIDE the IDP repo** and are referenced by **RELATIVE paths only** (e.g. `../../docs/...`). NO absolute machine paths (`C:/Users/...`).
- NO dependency on anything outside the cloned repo + standard Claude Code (file read/write + bash). NO exotic MCP, no `craft-lab/` on disk.
- Test of done: `git clone` the IDP onto a clean machine / different account → the skill loads, triggers, and runs with zero edits.

## Knowledge the skill uses — in-repo, referenced relatively (NOT machine paths)
- **Already in-repo:** IDP capability catalog → `../../docs/golden-paths/*`, `../../docs/modules/*`.
- **Must be brought in-repo:** the craft brain the skill needs at discovery time — the **tiering rubric** (Essential/Signature/Flagship) + a **technique/capability index** + the **robustness gates** (capability tiers, cold-load, verification matrix). These currently live in the separate `craft-lab/` LAB → distil + copy into the IDP (e.g. `docs/craft/`) and version with the repo.
- **Reconciles "don't duplicate" with "must be portable":** `craft-lab/` stays the **upstream R&D lab**; the IDP holds the **one shipping copy**. One production source, in the portable unit; the lab is upstream. (Full execution recipes land in-repo during Phase-2 consolidation, task #31.)

## Non-goals
- NOT a builder — it decides *what* + *what tier*, not *how* (that's the craft execution layer, Phase 2).
- NOT a copy of the IDP/craft knowledge — it's a lens + a process over the living docs.
- NOT an end-user feature on the deployed site — it's a tool for the builder during discovery.

## Proof bar — what makes this a genuine skill (not a joke)
*A SKILL.md that restates the obvious and triggers unreliably is a joke. This skill is `proven` only when ALL of the below hold. Until then SKILL.md is `v0 (draft)`.*

**Already proven (the foundation it stands on):**
- The elements library — 12 bricks, dogfooded, live on Hingulapuran.
- The tier rubric (Essential / Signature / Flagship + scorecard) — applied to Bugadi.

**What THIS skill must still prove:**
1. **Generalizes across tiers** — dogfooded by hand on **≥3 deliberately different briefs** spanning the spectrum (e.g. an Essential utility site · a Signature brand site · the Hinglaj Flagship). One example = it memorized one client.
2. **Round-trips** — a discovery brief → an actual build → the shipped site **matches** the scoped features + tiers. The brief must be load-bearing, not decorative.
3. **Tier calls survive the build** — the Essential/Signature/Flagship tags it assigned are not overturned mid-build.
4. **Triggers reliably** — fires on a fuzzy client idea, doesn't misfire (skill-creator evals).
5. **Portable** — `git clone` on a clean machine/account → it loads + runs with zero edits (this SPEC's HARD CONSTRAINT). Requires: committed to the IDP repo + the craft knowledge it needs brought in-repo, relative paths only.
6. **The with/without test (the decider)** — the same fuzzy brief run WITH the skill vs WITHOUT must be **visibly, repeatably** sharper (tier-tagged, capability-mapped, sharper client questions). If it isn't measurably better than free-handing it, it isn't a skill.

**Sequencing guard (don't freeze on one example):**
- Write SKILL.md **v0 after the first dogfood (Hinglaj), marked draft.**
- Run v0 by hand on **2 more cross-tier briefs** before flipping it to `proven`.
- Three cross-tier worked examples is the line between a genuine skill and a Hinglaj autobiography.

## Settled decisions
- **Scope:** ideation/discovery first; consolidate the 3 IDP frontend skills into the craft brain in Phase 2 (recommended default; revisit if the client work demands the full merge sooner).
- **Lives in:** `IDP_Web/.claude/skills/discovery/` so every cloned site inherits it.
- **Built by dogfooding the COMPLETED real client project** (decided 2026-06-17): build the client site first using the IDP + craft; write `SKILL.md` v0 *after* it ships, using the whole worked example as source. Stronger than mid-build guessing.
- **Distribution = git.** The IDP repo (with craft knowledge in-repo + the skill) is pushed to git; `git clone` on any PC / any Claude Code account = the system, ready to use. That clone-and-run is the portability acceptance test.

## Open questions
- Final skill name.
- Exact output template shape (locks after the first dogfood pass).
- Whether discovery + build stay one skill or split (decide after Phase 1).
