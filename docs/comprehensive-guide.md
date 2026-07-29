# The Comprehensive Guide

*The "why and how" behind every step. Read this to understand the process; use SOP.md to follow it while building.*

*Companion to SOP.md (the checklist) and the current Vibe-Coding-Playbook version (the method). This is the manual.*

---

## How the three documents relate (so you open the right one)

- **README.md** — the map. *"What's in this toolkit and where do I go?"* 30 seconds.
- **SOP.md** — the checklist. *"I'm building. What's my next step and gate?"* Follow it live.
- **This guide** — the manual. *"Why does this step exist and what does good look like?"* Read to understand.

Each answers a different question. None repeats another. If you want to *do*, use the SOP. If you want to *understand*, you're in the right place.

---

## The shape of the whole thing

```
Research (outward) + Business Brief (inward)
        → generate docs (the real source code)
        → produce images (before coding)
        → vibe code (phase loop with QA + commit gates)
        → launch
        → retro (improve the toolkit)
```

The single deepest idea: **your documents are the real source code; the AI just renders them into files.** Every step before "vibe code" is you writing better source code. Every step during it is protecting that source from drift and breakage. Hold that and the rest follows.

---

## What v3 adds, and why (read this if you knew v2)

Five things the real CA build (and two filtered external reviews) taught — each fixes a concrete failure, not a tidy idea:

**1. Doc 03b — Site Map & Page Layouts, with an approval gate.** In v2, the agent silently decided each page's section order during the build, and there was no single list of what pages even existed. 03b makes *you* declare the site structure (multi/single/hybrid), enumerate every page, mark which nav links navigate vs scroll, and set section order — and you approve it *before* images and code. Why it matters: layout regret becomes a one-line edit instead of a code refactor, and it fixes the image-undercount at the source (see #2).

**2. Instance-level image counting.** v2's image plan counted *categories* ("service hero ×1") when a site has *instances* (7 service pages = 7 heroes). It undercounted, and you discovered the gap mid-build. v3 generates the image plan *from 03b's page list*, expanding every repeated page into real files — so the count is honest, and each page gets a deliberate image-depth decision (unique/shared/icon/none) rather than an agent guess.

**3. Conversion Strategy in the PRD.** v2 said *what* the site does (features) but never *what you want a visitor to do and believe*. A site can be structurally complete and still convert nothing. v3 folds a short conversion block into the PRD: primary CTA, secondary CTA, the one belief, top objections + answers. (Folded in, not a new step — the value without the process weight.)

**4. Form spam & security as a build requirement.** v2's forms captured data and stopped there — assuming good-faith input. A public form without protection becomes a spam funnel within weeks. v3 makes honeypot + server-side validation + rate limiting a Component-Inventory requirement and a launch gate. (Validated live on the CA build, whose forms were unprotected until patched.)

**5. A hardened Launch & Deploy phase.** This was the build's *biggest* revealed gap — v2 treated launch as a light checklist, but going live is where the most friction lived. v3 adds: run the **production build locally before every push** (the dev build hides type errors that fail in prod — bit the build twice); a real **deploy-mechanics** checklist; a **live-URL smoke test** as a formal gate (because "works locally" ≠ "works live", proven three times); and the **soft-launch vs full-launch** distinction so a test deploy isn't mistaken for done.

Plus four one-line safety additions: **no dependency upgrades** without asking (not just no new ones), **modularity guidance** (split components doing two jobs — no rigid line limit), **log frozen-doc changes separately** (update doc → commit → then build), and a **human "resume note"** in the Build Log at phase transitions (so *you* can pick the project back up after weeks, the way CLAUDE.md lets the agent).

What v3 deliberately *rejected* (so you don't re-add them): Lite/Standard/Full modes (bloat — just skip docs that don't apply); a separate "conversion step" (folded into PRD instead); a hard 150-line file limit (principle kept, rigid number dropped); a heavy multi-step "Architecture Phase" for spec changes (the simple "commit separately" kernel kept instead).

---

## What v4 adds, and why (read this if you knew v3)

Five more things — from the CA firm's launch, its client portal, and its live Compliance Hub — each fixing a concrete failure, not a tidy idea:

**1. A runtime-dependency fallback.** v3's pages were mostly static — they can't fail for a visitor, because nothing is fetched. But the Compliance Hub fetches a live feed and the portal fetches login-gated data, and anything fetched *at the moment of use* can be down, slow, or changed. With JS disabled, the Hub showed a permanent "Loading…" — exactly what a real visitor sees the day the source has an outage. So for any feature with a runtime dependency you now decide its fallback *when you spec it*: loading-with-timeout, empty, and failed (cached or a calm message) — never an endless spinner, and the accuracy-critical part renders even if a secondary part fails.

**2. Analytics as a deliberate choice.** v3 defaulted to one privacy-friendly tool. But the real decision is cookieless (clean DPDP, shallow) vs GA4 (deep funnels and channels, but cookies + consent + cross-border) vs both — and it depends on the site. v4 makes it an explicit choice in doc 11, with two hard rules if GA4 is in play: it fires only after consent, and the privacy policy must match what's actually deployed. Plus the principle the CA build surfaced: instrument *before* launch — you can't measure a launch retroactively, and on a delivered site you won't be back to add it.

**3. A post-launch maintenance phase.** v3 ended at launch + retro. But a delivered site isn't a project you babysit — it comes back only for updates and fixes, and without a light rhythm it quietly rots (a dead form, undelivered email, stale deps). v4 adds a short weekly/monthly/after-edit checklist so the site survives without you — the "real deliverable, not a project" bar made practical.

**4. An authenticated-app extension.** v3 was built for marketing/content sites. The client portal was a different species — logins, roles, private per-user data — and the failure there isn't a cosmetic bug, it's one user seeing another's data. v4 adds an extension (Playbook PART 7) used only for app projects: extra planning docs (app PRD, data-model & security, app roadmap), a security-first build order (auth → access rules → *prove* cross-user denial → then features), deny-by-default, and a non-negotiable cross-user denial gate.

**5. A skills library + a motion layer.** v3's output could read as generically "AI-made." v4 gives the build real craft: a `skills/` folder copied into every project so the agent self-activates the right skill — `frontend-design` (distinctive type, colour, composition, steered to the brand, contrast verified) and a motion layer (a few named entrance pieces, reduced-motion honored). Both validated on the CA site.

Two cautions carried in `v4-backlog.md`: the auth-app extension and the runtime-dependency fallback are written from ONE build — strong drafts until website #2 confirms them; and `frontend-design` reaches for boldness by default and can drop contrast below WCAG, so it's brand-steered and contrast-checked, never trusted blind.

---

# PART A — The Planning Steps (where the real leverage is)

## Step 0 — Prerequisites

**What:** the one-time machine setup — Node.js, git, GitHub, an AI coding agent + paid plan, an editor/markdown viewer, and (on Windows) setting PowerShell's execution policy so npm runs.

**Why it exists:** in the first build, setup problems — not coding problems — caused the worst interruptions: the PowerShell execution-policy error, the dev server fighting the agent for a port, a renamed database key. None were "the build was hard"; all were "the environment wasn't ready." Front-loading setup means the build runs uninterrupted.

**What good looks like:** you can open a terminal, run the agent, and the dev server starts in its own window without errors — *before* you write a line of project code.

**The lesson baked in:** run the dev server in its **own terminal**, separate from the agent. They fight over the port otherwise.

---

## Step 1 — Select the niche / business

**What:** decide what you're building and for whom, in one sentence.

**Why it exists:** everything downstream inherits from this. It's short, but it's the seed.

**What good looks like:** you can say "a [type] website for [audience] that helps them [do what]" without hand-waving.

---

## Step 2a — Deep Research Report (outward-looking)

**Two paths, picked by how the site wins.** A business/product/service site wins by beating a market, so it gets competitor research (`prompts/deep-research-business.md`). A personal-brand/portfolio/founder site wins by being authentically *this person* — there's no market gap to find — so it gets *inspiration* research (`prompts/deep-research-personal-brand.md`), which studies strong brands, design, and writing and ends with a positioning differentiator instead of a feature gap. Tie-breaker: better-than-competitors → business; hire-me-for-who-I-am → personal brand.

**What (business path):** a structured audit of the top ~20–30 competitors — scored on conversion potential, ranked, with patterns to copy, patterns to avoid, the gap they all share, and a phased feature recommendation.

**Why it exists:** it answers *"how does this site stand out?"* Most people skip research and build on vibes. This is your evidence base — and critically, it ends by naming the differentiator: for a business, the **gap all competitors share** (where the killer feature lives — on the CA build, "no competitor has a self-serve tool" → the Compliance Health Check); for a personal brand, the **defensible positioning space** only this person can own.

**What good looks like:** specific, critical, current observations — not "have a clear CTA." It names a *real* differentiator (sharp, not a generic "bridges X and Y") and ends with an MVP/Phase 2/Phase 3 list. That phased list is literally the input the PRD consumes.

**The gate:** if the report is generic or doesn't name a real gap, *stop and redo it.* A weak research report poisons every doc downstream — this is the most expensive place to be lazy.

**Common failure:** the AI gives flattering, vague output. Push back: "be more critical, name the gap explicitly, one specific paragraph per competitor."

---

## Step 2b — Business Brief (inward-looking)

**What:** a document describing *this specific business* — real services (and what it does NOT offer), real team and credentials, voice and tone, trust assets, and content seeds (real FAQs, real facts/deadlines). Produced with `prompts/business-brief.md`.

**Why it exists — and why it's the most important addition to the whole system:** the research report tells the AI what competitors do; it tells the AI *nothing about who you are.* Without the Brief, the AI fills the gap with generic professional filler — which is exactly why the first CA build shipped with placeholder copy, invented testimonials, and a tone the AI guessed at. The Brief is the source of the site's actual substance and voice. Two firms in the same niche share a research report but have completely different Briefs.

**What good looks like:** the "what we do NOT offer" list is filled (stops the AI inventing services), the voice is specific (not just "professional"), and the content seeds include the real facts only the business knows — especially anything the site will compute or advise on.

**The gate:** if you're leaving big blanks, the site will be placeholder-filled. Fill the load-bearing sections (offerings, voice, trust, content seeds) before generating docs.

**Priority note:** for the *substance* docs (flow map, page content, design vibe), the Brief **leads**; the research report shapes strategy on top. A site optimized against competitors that doesn't sound like the actual business has failed.

---

## Step 3 — Generate all docs (incl. 03b)

**What:** feed **three inputs** to the AI — the **Playbook** (the how) + the **Research Report** (what-wins) + the **Business Brief** (who-we-are) — and generate the planning docs (01–06) and control docs (07–11), via `prompts/doc-gen-master.md` (which holds the generation rules and reconciles the inputs before writing).

**Why it exists:** this is where intent becomes specification. These docs *are* the source code; the better they are, the better everything renders. The three-input structure is deliberate — the Playbook gives method, research gives strategy, the Brief gives substance. Miss one and you get, respectively, chaos / a generic site / a placeholder site.

**What good looks like — and the gate:** the 12 docs are **internally consistent.** Spot-check the seams: does the DB schema (06) have a home for every field the flow map (01) writes? Does the killer feature (02) appear in at least one flow? Do the components (03) cover every screen in the flows? If the docs contradict each other, the code inherits the contradiction. Freeze docs 01–06 once this passes.

**The frozen/living split:** docs 01–06 are *planning* — frozen after this step, revisited only by deliberate, logged decision. Docs 07–11 are *control* — touched every session. This split is the single biggest reason the build doesn't drift. (The one allowed exception: reconciling a frozen doc to *reality* when a tool differs from what the doc assumed — that's updating the doc to truth, not changing the plan.)

---

## Step 4 — Produce images (before coding, not at launch)

**What:** take the **Image & Asset Plan (06b)** + the **Design System (04)**, run `prompts/image-prompt-gen.md` to get an aspect-locked prompt per slot, then generate (AI) or shoot (real) each image in one house style.

**Why it exists — and why it's before coding:** most "AI website" guides treat images as launch decoration. They're not — on a real site, images are **trust infrastructure.** And doing them *before* the build means you code with real, unique, soft-launch-quality images in hand instead of placeholders. The image plan is itself an output of the planning docs (it's doc 06b), so the decision of what image goes where is *derived from the flow map and PRD*, not guessed.

**What good looks like:** real photos for trust slots (team, premises), icons for categories, illustrations for concepts, diagrams (coded) for labelled data, and *nothing* where text already works. One coherent visual family. Aspect ratios locked — generating the wrong ratio and cropping destroys composition.

**The hard lines:** real beats stock on trust slots (fake reads as untrustworthy); never AI-generate fake team members or testimonial faces (it edges into deception on a trust-led site); the logo is vector/commissioned, not AI raster; never use random web images (copyright is real liability).

---

## Step 5 — Organise assets + final environment setup

**What:** compress and place images in `/public`, create the external accounts (database, email, host) in the right region, and put the keys in `.env.local` yourself.

**Why it exists:** this is the *other* setup that interrupts builds — the account/keys/region work. Doing it here, before the data-wiring phase, means the build doesn't stall mid-flow waiting for a Supabase project or an email key.

**The gate + the hard rule:** keys go in `.env.local` in a text editor — **never pasted into a chat, never hardcoded, never screenshotted** (a key shown even in a screenshot is exposed — rotate it immediately). The agent reads them from disk and refers to them only by name. `.env` stays gitignored. Region matches your compliance (e.g. India's DPDP → Mumbai region).

---

# PART B — The Build (Step 6, the vibe-coding loop in detail)

This is the part you asked to see fully — QA, commit, phases — explained, not just listed.

## The phase structure

Build in phases, ordered so each stands on solid ground:

```
Phase 0: Scaffold     — repo, stack, design tokens, empty routes, deploys blank
Phase 1: Homepage     — static, the main shape
Phase 2: Secondary    — remaining pages static; global states (404/empty/error)
Phase 3: Killer feature — build the differentiator as a front-end first
Phase 4: Data wiring  — make the flows real: database + email/notifications
Phase 5: Polish       — responsive, real states, SEO, accessibility, performance, analytics
```

**Why this order:** get the *shape* right with cheap static pages first, then wire data into one proven flow before doing them all. Doing data last-and-all-at-once is where most builds collapse. (This held exactly true on the CA build — the static-first ordering meant every later phase built on something that already worked.)

## The eight-step loop, run for every phase

Each phase is the same ritual. The discipline is the point.

**1. OPEN** — Start a fresh session. The Context Anchor (`CLAUDE.md`) auto-loads, so the agent knows the project, stack, conventions, and what's done. *Why fresh: a clean context window prevents the drift that builds up over long sessions.*

**2. AIM** — State the phase goal + acceptance criteria; reference the docs. **Get a plan first — no code yet.** *Why: an agent that plans before coding catches its own misunderstandings before they become files.*

**3. BUILD** — Generate in small chunks, not one giant prompt. *Why: small chunks are reviewable; a giant one-shot is a black box you can't QA.*

**4. REVIEW** — Make the agent self-review against the PRD and Design System: *"List every deviation and missing state. Don't fix — just list."* *Why: it catches its own drift surprisingly well, and turns your review into confirming a list instead of hunting from scratch.*

**5. QA** — Run the checklist gate (below) yourself. *Why: phases compound — a broken foundation rots everything above it.*

**6. SAVE** — Commit on the phase branch. *Why: this is your rollback point. Branch per phase, merge when green.*

**7. RECORD** — Update the Build Log (what was done / what broke) and the Context Anchor's "current status." *Why: the Build Log ends debugging-archaeology; the status line keeps the next session oriented.*

**8. CLOSE** — Stop. Don't drift tired into the next phase. *Why: quality degrades over long continuous sessions — for the agent and for you.*

## The QA checklist (the gate between phases)

Run this before entering the next phase. Never pass it on a "looks about right":

```
[ ] Renders on real mobile width (360px), not just narrow desktop
[ ] All links/buttons in this phase actually work
[ ] Matches the Design System (colours are tokens, spacing on scale, no hardcoded hex)
[ ] Matches the PRD scope for this phase — nothing extra crept in
[ ] Empty / loading / error states exist where relevant
[ ] No console errors
[ ] Committed to git on the phase branch
[ ] Build Log + Context Anchor updated
```

**Why these specific items:** mobile and the empty/loading/error states are exactly what AI silently skips — a site missing them feels broken even when the happy path works. "Nothing extra crept in" is your scope-creep gate. "Colours are tokens" is your style-drift gate.

## Commit discipline — why it's non-negotiable

**Branch per phase, commit at every QA gate, merge to main when green.** Vibe coding without version control is building on a cliff edge. This isn't bureaucracy — it's the thing that lets you recover when the agent confidently breaks something, and it *will*. Main stays your always-working copy; each phase is a side branch you only merge once it passes.

## The Stuck-State Protocol — three strikes, then revert

AI agents have a specific failure mode: they "fix" a bug, break something adjacent, fix *that*, re-break the first thing, and spiral — worse with each attempt. The rule:

> **If a bug isn't fixed in ~3 tries, STOP. `git checkout` to the last good commit, and re-approach with a fresh session and a re-thought prompt.**

**Why it works:** each failed fix pollutes the context with wrong assumptions. A fresh session often solves in one shot what a poisoned one couldn't in five. Your per-phase commits are what make this safe — you always have a clean point to fall back to. Log the spiral so you don't repeat the prompt that caused it.

---

# PART C — After the build

## Step 7 — Launch

**What:** deploy, verify the email sending domain, replace all placeholders with real content + the Step-4 images, confirm compliance (region, privacy policy, consent), have the domain expert review any consequential logic, and run a final QA on the *live* site on a real phone.

**Why it exists:** building ends at Phase 5; going live is real-world steps, not code. The email-domain verification matters specifically — until it's done, transactional email only reaches your own inbox, not real users. And the expert-review-of-logic step is non-negotiable if the site computes or advises anything (health, legal, financial): the AI wrote its best guess; the expert confirms it's right and keeps the output framed as indicative, not definitive.

## Step 8 — Retro (the step that keeps the toolkit alive)

**What:** after the project, 10 minutes — what broke that the playbook didn't cover, what you relearned the hard way, what should change in the playbook / the prompts / the SOP. Fold it back in.

**Why it exists:** this is the *only* step that improves the toolkit itself. Skip it and the SOP freezes at its current version forever. Do it and every project makes the next one sharper. The toolkit is validated on one real build so far — the retro is how it earns higher confidence over real use.

## Step 9 — Maintain & Improve (after launch)

**What:** a light operating rhythm once the site is live — *weekly*, a glance that the forms still submit, email still arrives, analytics looks sane, no broken links; *monthly*, update dependencies manually then run the production build, run Lighthouse, review top pages / drop-offs / leads, back up the data; and *after any major edit*, treat it like a mini-phase — build, mobile check, smoke test.

**Why it exists:** a site you deliver has to run *without* you. After handoff it comes back only for maintenance, and with no rhythm it rots silently — a form breaks, email stops, dependencies drift. This closes the lifecycle the build-and-launch steps leave open. Keep it a checklist, not a job.

---

## The eight safety rails (the hard-won, non-negotiable ones)

1. **Git, per phase.** Your rollback. No exceptions.
2. **Never let the AI hold secrets.** Keys in `.env.local` you fill yourself; a key shown anywhere (even a screenshot) is exposed — rotate it.
3. **Dev server in its own terminal**, separate from the agent.
4. **Verify current tool facts; don't trust the AI's memory.** Key formats, install commands, framework versions, region names change. Check official docs for anything version-sensitive.
5. **One dependency rule.** The agent can't add packages without asking.
6. **The domain expert reviews domain logic** before launch; keep its output framed as indicative.
7. **Polish (Phase 5) is explicit** because the AI skips it by default: responsive, real states, SEO, accessibility, performance, analytics + privacy.
8. **Features with a runtime dependency get a planned fallback *(v4)*.** Anything fetched live (DB, API, feed, auth) can be down or slow — decide its loading-timeout / empty / failed behaviour when you spec it; never an endless spinner, and content stays visible if JS is slow or blocked.

---

## The one-paragraph version (if you read nothing else)

Your documents are the real source code; the AI renders them. So invest upstream: an *outward* research report (what wins) and an *inward* business brief (who you are) feed a consistent set of frozen planning docs and living control docs. Produce real images before coding. Then build in phases, each on its own git branch, each passing a QA gate before the next — and when a bug spirals past three tries, revert rather than coax. Launch is its own checklist; the retro is what makes the next build better. Maintain the live site so it survives you; and for an app with logins, prove no user can reach another's data before the feature ships. Keep the toolkit a single clean source of truth, and it serves you for any website, any niche.
