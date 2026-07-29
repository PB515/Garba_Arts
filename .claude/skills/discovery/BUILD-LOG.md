# Build log — `discovery` skill

*Append-only, newest last. One short dated entry per working turn that changes something: what we did, why, what's next. The diary that feeds refinement. Contract lives in `SPEC.md`.*

---

### 2026-06-17 — Kickoff
- Decided to build a single **discovery/ideation skill** as the IDP's missing Step 0 — turns a fuzzy client idea into a buildable, tier-tagged brief. Motivation: market skills were too weak/fragmented; want one owned brain.
- Why this first (vs the full "one comprehensive skill" merge): lowest-risk, fastest path to the real client; consolidating `frontend-design`/`motion`/`taste-skill` into the craft brain is Phase 2 (task #31).
- Set up the streamline: `SPEC.md` (contract), this `BUILD-LOG.md` (diary), session task list #26–#31, `skill-creator` for scaffold + evals. Knowledge stays in the living docs (IDP `docs/` + `craft-lab/`); the skill references, never copies.
- **Next:** user provides the real client website idea → we run the v0 discovery process on it by hand (dogfood, task #28); whatever questions/structure that takes becomes SKILL.md v0.

### 2026-06-17 — Sequencing locked: client first, skill after; git = distribution
- **Decision:** write `SKILL.md` v0 **after the client project ships**, not mid-build — a completed real site is the strongest dogfood source (real features, tier decisions that survived the client, actual perf trade-offs). Build client → distil skill.
- **Decision:** **distribution is git** — push the IDP (craft knowledge in-repo + the skill) to a repo; `git clone` on any PC/account = the working system. Clone-and-run is the portability acceptance test (task #32 + #33).
- **Next:** user gives the client website idea (heavy flagship: 3D + scroll-everything) → we scope it through the discovery process by hand and start the build. Skill extraction comes at the end.

### 2026-06-17 — Capture mechanism live
- Created `worked-examples/_TEMPLATE.md` — the structured capture for each real discovery run (raw input → clarifying Qs → feature/capability/tier table → site map → decisions → perf budget → open Qs → brief, plus a META section for "where the process was thin"). These worked examples are the **raw material the skill is distilled from**, and the template doubles as the skill's draft output format. Fill live, not after. Client #1 → `worked-examples/client-01-<name>.md`.

### 2026-06-20 — Proof bar added + first cross-tier proof run
- Wrote the **proof bar** into `SPEC.md` (the "genuine skill, not a joke" acceptance criteria): generalises across ≥3 cross-tier briefs · round-trips (brief→build→shipped matches) · tier calls survive · triggers reliably · portable (clone-and-run) · the **with/without test** (the decider). Sequencing guard: SKILL.md v0 after Hinglaj, then 2 more cross-tier briefs before `proven`.
- **Committed the whole scaffold to IDP `main`** (was untracked → failed its own portability criterion #5). Now clone-and-run-testable.
- **Ran proof run #2 — `client-02-coaching.md` (Essential tier).** Deliberately the *opposite* end from Hinglaj (Flagship), and a **trap input** (client asks for "edtech animations"). The process reached the **opposite, correct verdict — Essential + one accent — and gave the rationale to refuse the flashy ask** (conversion funnel → speed wins). Ran the **with/without** contrast inline: the with-process output reaches a *materially better decision*, not just more detail → proof #6 demonstrated.
- **What this proved:** #1 cross-tier generalisation (Flagship ✓ + Essential ✓) and #6 with/without. The feature→capability→tier→perf table + the `audience→device→perf` forced question both generalised across opposite tiers (same question, opposite answer) — strong "belongs in the skill core" signal. New guardrail surfaced: "which trust claims are verifiable with consent" (never-fabricate, as a discovery question).
- **Still to prove:** #2/#3 (round-trip — needs a real build), #4 (trigger evals — needs SKILL.md), and a **Signature** third example. 
- **Next:** either (a) a Signature cross-tier run to complete the ≥3, or (b) start distilling SKILL.md v0 from client-01 + client-02 (the shared patterns are already clear: forced audience→perf question, the tier table, restraint-with-rationale, the verifiable-claims guardrail, the hard-override list).

### 2026-06-20 — SKILL.md v0 drafted
- Wrote **`SKILL.md` v0 (draft)** — distilled from client-01 (Flagship) + client-02 (Essential). Name = `discovery` (working). Trigger description targets "fuzzy / over-ambitious / asks-for-flashiness" client ideas at Step 0.
- **9-step process** (capture → forced early Qs → research-for-specialized → the feature→capability→tier→perf table → scorecard+overrides → tiered site map → perf budget → client questions → tightened brief). **Tier rubric + scorecard + hard-overrides embedded** so the skill is self-contained and **portable from a clone** (doesn't depend on `craft-lab` on disk — resolves the SPEC "bring craft brain in-repo" concern for v0). References only in-repo paths (`docs/…`, `elements/…`).
- **Open-question resolved (for v0):** name = `discovery`; output format = the worked-example shape.
- **Proof status:** #1 (cross-tier ✓✓), #6 (with/without ✓). Still open: a **Signature** run *through v0* (advances #1 3rd tier + #4 trigger/usage at once), and a **real build round-trip** (#2/#3).
- **Next:** run a Signature brief through v0 as a *test of the skill* (not a hand-run), then the first real build to round-trip it.

### 2026-06-20 — Round-trip vs a REAL build (Inspire Academy) + the two-axis refinement
- User offered `Desktop/aa` (= **Inspire Academy**, a foundational IDP build) as a "Signature" example. Ran discovery on it honestly → `worked-examples/client-03-inspire-academy.md`.
- **Honest verdict: capability = HIGH (marketing + parent portal + full ops/CMS) · craft tier = ESSENTIAL** (docs specify restrained reveal/pop-in motion, calm/credible brand; no GSAP/Three/Lenis). The shipped site **matches discovery's predicted verdict on every row** → first real **round-trip** (proof-bar #2/#3) on a foundational build, not a constructed brief.
- **Biggest refinement so far → folded into SKILL.md:** capability and craft tier are **two independent axes**. "Signature" was used in the *polish/feature* (capability) sense, not the *craft-tier* sense. The skill now reports both axes separately and disambiguates the word "Signature."
- **Did NOT rubber-stamp "Signature"** — that honesty is the point (a joke skill would have). Inspire Academy made the *correct* Essential-craft call; capturing that is what proves the rubric.
- **Proof status now:** #1 cross-tier 3 cases (Flagship · Essential · capability-heavy/craft-Essential) but still no true **Signature-CRAFT** example; #2/#3 round-trip ✓ (Inspire); #5 portable ✓; #6 with/without ✓; #4 partial (loads).
- **Next:** capture the **`bugadi-showpage` Signature tier** (real GSAP scroll-story + micro-interactions) as `client-04` to fill the genuine Signature-craft slot → then #1 is complete across all three craft tiers.

### 2026-06-22 — Round-trip #2 (Purven portfolio) + the "identity" refinement
- Ran discovery on `Desktop/Portfolio-site` (Purven, foundational build) → `worked-examples/client-04-purven-portfolio.md`. (Note: this took the `client-04` slot; the bugadi-showpage Signature capture moves to `client-05`.)
- **Verdict: capability moderate (portfolio CMS) · craft ESSENTIAL** — restrained by design (docs/04: "calm, understated, motion confirms structure never decorates"; no GSAP/Three). Shipped build matches → **second real round-trip** (#2/#3).
- **The refinement (folded into SKILL.md + the scorecard):** the "brand sells on **identity**" signal splits into **expressive** identity (spectacle → craft up, scores 2) vs **credible** identity (builder/engineer/consultant — substance/trust → restraint, scores 1; brand *voice* is a hard down-tier). So **"portfolio" is NOT auto-Signature** — Purven correctly lands Essential. Read the voice, not the category.
- **Pattern across the real cases:** coaching (Essential) · Inspire (capability-heavy/Essential) · Purven (portfolio/Essential) — the user's real client work is **credibility/conversion-led → Essential**. Rubric is strongly validated at Essential + Flagship (Hinglaj); the only gap is a **shipped Signature**, not the method. The genuine Signature example remains the `bugadi-showpage` lab tier (→ client-05).
- **Proof status:** #1 four cases (all Essential-ish + Flagship); #2/#3 round-trip ✓✓ (two real builds); #5 portable ✓; #6 with/without ✓; #4 loads ✓. Open: a shipped-Signature round-trip; trigger evals.

### 2026-06-22 — Signature example (Bugadi showpage) — proof #1 COMPLETE across all 3 craft tiers
- Captured `worked-examples/client-05-bugadi-showpage-signature.md` — round-trip vs the real `Desktop/bugadi-showpage` (craft-lab demo). Confirmed the Signature stack is actually built (`gsap`/@gsap/react + `lenis` + `MagneticButton` + the pinned "Wearable Heritage" GSAP scroll-story); `?tier=` routing + a `/tiers` page. Discovery's **Signature (score 7)** verdict matches the built Signature tier.
- **Proof #1 is now complete:** Essential (coaching/Inspire/Purven) · **Signature (Bugadi showpage)** · Flagship (Hinglaj) — a real example at every craft tier.
- **The two-axis bookend:** Inspire = high capability / Essential craft; Bugadi showpage = ~zero capability / Signature craft → opposite corners, strongest proof the two axes are independent. And the identity refinement holds both ways: expressive identity (jewellery) scores 2; credible identity (builder) scores 1.
- **Confirmed on a real artifact:** same brand → per-surface tiers (showpage Signature vs the separate store Essential). Mixed-tier output is right.
- **Remaining for `proven`:** (a) live **trigger evals** (#4 — actually invoke the skill, not hand-run), (b) a **forward round-trip** on a new build (the Hinglaj client: discovery brief → build → shipped matches). Everything else on the proof bar is green.

### 2026-06-22 — Live eval (#4 execution half) — invoked the skill, it tiered UP correctly
- **Invoked `discovery` via the Skill tool** (not a hand-run) on an unseen **expressive luxury** brief (a Jaipur attar house) → `worked-examples/client-06-attar-house.md`. Deliberately the **up-tier** direction no prior example tested.
- **Result: correct + sophisticated.** Scored 10 → it tiered **UP** (Flagship/Signature), and crucially read "**wow = 2**" here vs "**wow = 0**" for coaching (desire-sells-luxury vs funnel-needs-speed — same question, opposite correct answer). Applied the **per-surface override** (Flagship-accent home + Signature story/catalogue + **Essential checkout**) and surfaced the asset-pipeline long-pole — all **from the written skill, not from me**.
- **Proves #4's execution half:** invoked fresh, the skill produces the right output, including the up-tier case the worked examples never had. The client-04 per-surface refinement is load-bearing (it fired here unprompted).
- **Still open for fully `proven`:** the *description-triggering* half of #4 (skill-creator evals — does it auto-fire on the right phrasing) + a **forward** round-trip (Hinglaj: brief → build → shipped). This run was an explicit invocation (execution proven), not an auto-trigger test.
- **Tally:** 6 worked examples now span Essential ×3 · Signature (Bugadi) · Flagship (Hinglaj) · **up-tier luxury (attar, live eval)**. The rubric is validated across the full spectrum, both directions.

### 2026-06-21 — Signature example + proof #1 COMPLETE (client-04)
- Captured `worked-examples/client-04-bugadi-showpage.md` — the real `Desktop/bugadi-showpage` (GSAP pinned `HeritageStory` + `MagneticButton` + a R3F 3D **accent** + `StaticHeritage` fallback + `/tiers`). Verdict: **Signature + Flagship accent**, brand/lookbook surface.
- **Second round-trip:** discovery's Signature+accent prediction matches the shipped craft on every row.
- **Proof-bar #1 now COMPLETE** across all three craft tiers + the capability axis: Flagship (Hinglaj) · Essential (coaching) · capability-heavy/craft-Essential (Inspire) · Signature (Bugadi-showpage). **Two real round-trips** (Inspire, Bugadi-showpage).
- **Refinement → folded into SKILL.md:** **tier is per SURFACE, not per brand** (same brand: Essential store + Signature lookbook; overrides apply per route). And **a Flagship *accent*** is an explicit option (one 3D/shader moment), always paired with its degraded path.
- **Proof status:** #1 ✓ (all tiers + capability) · #2/#3 ✓ (two round-trips) · #5 ✓ portable · #6 ✓ with/without · #4 ◐ (loads; needs forward-eval). **Only gap to `proven`: a forward round-trip** — run v0 on a NEW brief, then build it, and confirm the shipped site matches (vs the two *backward* round-trips done so far).
- **Next:** a forward round-trip on a real upcoming client (the Hinglaj build is the natural one), then flip SKILL.md v0 → `proven`.
