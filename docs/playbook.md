# The Vibe Coding Playbook — v4 (Universal)

A repeatable system for building *any* website with an AI coding agent — CA firm, healthcare, portfolio, blog, SaaS landing page, e-commerce front — and actually deploying it, without the drift, scope creep, and compounding errors that usually break it halfway through.

> **What changed in v3.** v2 was proven by fully building *and deploying* a real CA firm site. v3 folds in everything that build taught — plus the survivors of two external reviews, filtered hard for genuine gaps over tidy-sounding bloat. The headline additions: a **Site Map & Page Layouts doc (03b)** with an approval gate before images and code; **instance-level image counting** (a "service hero" is 7 images, not 1); **conversion strategy** folded into the PRD; **form spam/security** as a build requirement; a **hardened launch & deploy** phase (the build's biggest revealed gap); and several one-line safety rules (dependency-upgrade lock, modularity guidance, log-spec-changes-separately, a human "resume" summary). Everything here was either demonstrated on the CA build or is a filtered, concrete fix — nothing speculative.
>
> **What v4 adds.** Building on v3, from the CA firm's launch, its client portal, and its live Compliance Hub: a **runtime-dependency pattern** (plan the fallback for anything fetched live, so a feature never hangs on "Loading…"); **analytics as a deliberate choice** (cookieless / GA4 / both, consent-gated, instrumented before launch); a **post-launch maintenance** phase (a delivered site has to run without you); two new **QA / launch gates** (the rendered page title; the privacy policy matching the analytics actually deployed); and an **authenticated-app extension** (the reusable pattern for logins, roles, and private per-user data). v4 also brings the build real design polish: a **skills library** (a reusable shelf of AI skills copied into each project — `frontend-design` and a **motion layer** its first members), validated on the CA site.
>
> **Status:** v4 — the method content is complete (all v4 additions are folded in below). The companion files (SOP, Guide, README) are being brought into line with it, with `prompts/doc-gen-master.md` added — see `CHANGELOG.md` and `v4-backlog.md`. Validated on one real deployed build (a CA firm); the newer *structural* patterns — the authenticated-app extension and the runtime-dependency fallback — still want a second build in a different niche to confirm. Treat the method as a strong, evidence-based draft, not gospel.

---

## The one idea everything rests on

When you vibe code, **your documents are the real source code.** The AI is just a renderer that turns your specifications into files. Your leverage lives *upstream* of every prompt: the quality ceiling of the site is set by the quality of your specs and the tightness of your feedback loops — not by how clever any single prompt is.

You are a **specification compiler**:

```
intent → planning docs → prompts → code → deploy
```

Errors leak in at every arrow. Every arrow needs a checkpoint. That's what this playbook is.

---

## Why most vibe-coded sites fall apart

Name the enemy before you fight it. Every artifact exists to kill one specific failure mode:

| Failure mode | What it looks like | Killed by |
|---|---|---|
| **Session amnesia** | Phase 3 doesn't know what Phase 1 decided | Context Anchor (CLAUDE.md) |
| **Style drift** | Three different button styles by phase 4 | Component Inventory + Design System |
| **Scope creep** | "While we're at it…" → never ships | PRD No-List |
| **Compounding bugs** | A bad foundation rots everything above it | QA Checkpoints + Git per phase |
| **Debugging archaeology** | Something broke, no idea when or why | Build Log |
| **Looks good, doesn't work** | Beautiful pages, broken journeys | User Flow Map |
| **Fix-loop spiral** | AI "fixes" a bug 5 times, breaks more each time | Stuck-State Protocol |
| **Decorative bloat** | Pretty images that slow the site and build no trust | Image & Asset Plan |
| **Invisible funnel** | No idea how many people finish your key flow | Analytics & Events doc |
| **Layout regret** *(v3)* | Agent silently chose the page structure; you dislike it after it's coded | Site Map & Page Layouts (03b) + gate |
| **Image undercount** *(v3)* | "Service hero ×1" when you have 7 service pages | Instance-level 06b from 03b's page list |
| **Aimless pages** *(v3)* | Site "works" but doesn't convert — no clear CTA or trust spine | Conversion Strategy in the PRD |
| **Spam magnet** *(v3)* | Public form fills your inbox/DB with bot junk | Form Spam & Security requirement |
| **Launch chaos** *(v3)* | Deploy fails, env missing, "works locally" ≠ live | Hardened Launch & Deploy phase |
| **Dead dynamic feature** *(v4)* | A live feed or portal hangs on "Loading…" forever when its source is down | Runtime-dependency fallback plan |
| **Cross-user data leak** *(v4)* | One logged-in user can reach another user's private data | Auth-app extension (deny-by-default + cross-user denial gate) |
| **Rot after handoff** *(v4)* | A delivered site quietly breaks — dead form, undelivered email, stale deps — with nobody watching | Post-launch maintenance checklist |
| **Generic AI look** *(v4)* | Pages read as default-template / unfinished next to competitors | frontend-design skill (brand-steered) + the motion layer |

---

## The split that fixes everything: Frozen vs Living

This is the structural backbone. Sort every artifact into two buckets and most drift solves itself.

**Planning artifacts (Frozen)** — write before you code, then freeze. You only revisit them on purpose, and changing one is a deliberate, logged decision. These are the stable source of truth the AI relies on.

**Control artifacts (Living)** — touched in *every* session. These are the steering wheel and the AI's scratchpad for "where are we right now."

```
PLANNING (write once, freeze)            CONTROL (touch every session)
01. User Flow Map                        07. Context Anchor (CLAUDE.md)
02. PRD + No-List + Killer + Conversion  08. Build Roadmap (phases)
03. Component Inventory                  09. Build Log (changelog + resume notes)
03b. Site Map & Page Layouts  (v3)       10. QA Checkpoint Protocol
04. Design System & Vibe                 11. Analytics & Events
05. Tech Stack + Architecture
06. Database Schema
06b. Image & Asset Plan (instance-level, from 03b)
```

Build them roughly in order. The planning docs are scaffolding; the control docs are how you drive. **New in v3:** doc **03b (Site Map & Page Layouts)** sits between Component Inventory and Design System — it declares the site's structure and every page, and it's the source the image plan (06b) counts from. It carries an **approval gate**: you sign off 03b before any images or code.

---

# PART 1 — Planning Artifacts (Frozen)

## 01. User Flow Map *(always first, before anything visual)*

The skeleton the whole site hangs on. Map the 3–5 core journeys a real user takes. Every page, component, table, and image falls out of these.

The journeys differ by site type, but the *shape* is identical:

| Site type | A core flow |
|---|---|
| CA / professional services | Visitor → service page → contact form → consultation |
| Healthcare | Patient → condition page → book appointment → confirmation |
| Portfolio | Recruiter → work → case study → "hire me" / contact |
| Blog / content | Reader → post → related posts → newsletter signup |
| E-commerce | Shopper → category → product → cart → checkout |

**Template**
```
FLOW: [name]
Trigger:   What makes them start (ad, search, referral)
Steps:     1 → 2 → 3 → 4 → 5  (each = a screen or action)
Success:   The exact moment the goal is met
Drop-off:  Where they're most likely to quit, and your fix
Data:      What gets read or written at each step
```

**Universal pattern that proved its worth:** if your site serves multiple audiences with no single primary one, don't water the homepage down to please all — make a **segment router** the homepage's main job (let visitors self-select), so each audience gets a tailored path in one click. (On the CA build this turned "we serve everyone" — usually a weakness — into a strength, and the router doubled as the entry to the killer feature.)

**Done when:** every page and feature you're about to build appears in at least one flow. If it's in no flow, question whether you need it.

---

## 02. PRD — with the three upgrades

Keep a competitor-research table (study the top ~20 sites in your niche before writing a single prompt — most people skip this entirely). Then add the three things that turn a feature list into a *strategy*:

**The No-List.** Explicitly write what you are NOT building in v1. The single best defense against scope creep — "no" decided calmly upfront is 10× cheaper than "no" mid-build when you're attached to an idea.

**The Killer Feature.** One thing your site does that none of the competitors do — your north star, served by every later decision. (On the CA build this was an interactive Compliance Health Check; not one of 30 competitors had a self-serve tool. The lesson generalizes: the gap your competitors *all* share is usually where your killer feature lives.)

**The Conversion Strategy *(new in v3)*.** A short block naming *what you want a visitor to do and why they'd do it* — not the features, the intent. Without it, the AI builds pages that are structurally complete but persuasively aimless: everything's listed, but there's no clear primary action or trust spine. (On the CA build this existed only implicitly, scattered across the killer feature and CTA choices — writing it down makes it deliberate and repeatable.)

**For a personal-brand / portfolio site *(v4)*:** this section flips. There's no competitor market, so the competitor-research table becomes an **inspirations** table and the Killer Feature becomes the **positioning differentiator** — the specific, defensible space only this person can own (from `deep-research-personal-brand.md`; see the Step 2a research split in the SOP). The No-List and Conversion Strategy still apply: a portfolio still has to decide what it won't build, and what it wants a visitor to do and believe.

**Template**
```
GOAL:           One sentence. What does this site exist to do?
KILLER FEATURE: The one thing nobody else does
COMPETITORS:    [your top-~20 table: feature comparison + UX notes]

CONVERSION STRATEGY
  Primary CTA:    the single most important action (e.g. "Run the Health Check")
  Secondary CTA:  the fallback for the not-yet-ready (e.g. WhatsApp)
  The one belief:  what must a visitor feel is TRUE before they act?
  Top 2-3 objections + how the page answers each

V1 FEATURES (phased)
  MVP / Phase 1 / Phase 2 / Phase 3 ...

NO-LIST (explicitly not in v1)
  - [the tempting things you are deferring]

FORM SECURITY (v3 — applies to every lead form)
  honeypot + server-side validation + rate limiting (see Component Inventory & Safety Rails)

SUCCESS METRIC: A real number you'll measure v1 against
```

**Done when:** you can point at any proposed feature and instantly say "MVP," "Phase 2," or "No-List" — *and* you can state the primary CTA and the one belief in a sentence each.

---

## 03. Component Inventory *(the layer most people skip)*

Your design system covers *style*; this covers *the actual building blocks and their states*. List every component before prompting so the AI never invents three inconsistent "cards" across three sessions.

```
COMPONENT      STATES NEEDED
Button         default / hover / focus / disabled / loading
Input field    empty / focused / filled / error
Card           default / hover
Nav            desktop / mobile (hamburger) / scrolled
Form           idle / submitting / success / error
Page-level     loading / empty / error / 404
Toast/alert    success / warning / error
```

The **states column is where consistency lives.** Empty, loading, and error states are exactly what AI silently forgets — and a site missing them feels broken even when the happy path works. (On the CA build, listing these up front is the reason the forms had real error/success states instead of just a happy path.)

**Form security is a component requirement, not an afterthought *(v3)*.** Any form that captures data must be specified here with: a **honeypot** field (hidden from humans, filled by bots → silently rejected), **server-side validation** (re-check every field on the server; bots skip the browser entirely), and **rate limiting**. A form without these looks like it works but becomes a spam funnel within weeks of going public — lead capture is usually the site's whole point, so this is non-negotiable. (Validated on the CA build, where the live forms were unprotected until this was added.)

**Done when:** every screen in your User Flow Map can be assembled from this list, with no surprises — and every form lists its honeypot + validation + rate-limit requirement.

---

## 03b. Site Map & Page Layouts *(new in v3 — the skeleton you approve before building)*

The doc that stops the agent from silently deciding your site's structure, and the master list of pages the method never had. It does three jobs, and you **approve it before any images or code** (the new gate).

**Job 1 — Site Structure.** Declare one, with a one-line *why*:
- **Multi-page** — separate routes; navbar navigates between them. *(Default for most business sites — each page can target its own search terms.)*
- **Single-page** — everything on one page; navbar scrolls to sections. *(Only for minimal landing pages or simple portfolios.)*
- **Hybrid** — multi-page, but a few navbar links scroll to a section on the current page. *(Common — the practical middle.)*

This choice is *asked in the Business Brief* (it's a business/structure question), and recorded here. It's cheap to state and expensive to discover wrong — an agent that guesses multi-page on a site you wanted single-page builds the wrong routing and splits your SEO.

**Job 2 — Page/route list + nav behaviour.** The flat master list of every page the site will have — *enumerated*, not implied (this is the list the image plan counts from). Plus a per-nav-item table marking how each link behaves:
```
SITE STRUCTURE: Multi-page (hybrid for one item)
PAGES:
  /                     home
  /services             index
  /services/gst         + tax, audit, roc, company-setup, nri, vcfo   (7 pages)
  /about · /resources · /resources/[slug] · /contact · /privacy
NAV ITEMS:
  Services → /services      (navigates)
  About    → /about         (navigates)
  Why Us   → /#why-us        (scrolls to section on current page)   ← the hybrid bit
```

**Job 3 — Section order per page.** The actual wireframe, as plain text — top-to-bottom sections per page. Use **detail (name + one-line purpose) for unique pages and each template**; **names-only for pages that just reuse a template** (describe the template once):
```
HOMEPAGE
  1. Hero          — headline + segment router + primary CTA
  2. Trust strip   — years, clients, credentials
  3. Services grid — the services as cards (icons), linking to each page
  4. Testimonials  — quotes with attribution
  5. CTA band      — primary CTA
  6. Footer
SERVICE PAGE (template — all 7)
  1. Service hero  2. What's included  3. How we work  4. FAQ  5. Related  6. Contact CTA
```

**Kept distinct from the User Flow Map (01):** 01 *predicts movement* (the journeys you assume visitors take); 03b *declares structure* (the pages that actually exist). A little overlap is fine; 03b's page list is the **authoritative** one. They must not drift into duplicating each other.

**Why this is the gate:** approving the skeleton as a cheap text list means layout regret is a one-line edit, not a code refactor — and because the section orders are locked first, you know exactly which image slots exist (and at what size/ratio) *before* you generate images. This single doc fixes layout-regret and image-timing together.

**Done when:** site structure is declared with a reason · every page is in the list · every nav item is marked navigate-or-scroll · every page has its section order · **and you've signed off on it before moving to images.**

---

## 04. Design System & Vibe

Lead with the vibe in plain words, then lock it into hard tokens the AI can't misread.

```
VIBE (one line):  e.g. "Warm, trustworthy, human — approachable but credible"
REFERENCES:       2–3 sites whose feel you want (link them)

COLOR    Primary (CTAs/links) · Accent (sparingly) · Neutrals · Success/Warning/Error
TYPE     Headings [font] + sizes · Body [font] + size/line-height
SPACING  A scale only: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96
RADIUS   one set: sm / md / lg
SHADOWS  1–2 defined, used consistently
ASSETS   logo files, brand images (with paths) — see the Image Plan in doc 06
MOTION   the motion vibe in a line (e.g. "calm, understated — nothing flashy")
         + which named pieces this site uses + where (e.g. hero headline pops in;
         sections reveal on scroll; hero image bounces once — nothing else)
```

**The pro move that proved essential:** have the AI generate these as real CSS variables / framework config on day one (Phase 0), then **forbid hardcoded colors** for the rest of the build. Tokens enforce consistency mechanically instead of by hope. (On the CA build this single rule is why every phase stayed on-brand.)

**Reconciliation rule (new, learned the hard way):** when the tool's reality differs from your doc — e.g. the framework's current version stores tokens differently than your doc assumed — **update the doc to match reality, don't fight reality.** A frozen doc that lies is worse than no doc. Log the change.

**Motion & interaction *(v4 — validated on the CA build)*.** Motion is part of the design spec, not an afterthought, and it follows the *same* rule as colour: set the tone here, apply it through a few named, reusable pieces — **pop-in** (a hero headline or primary CTA lands into place), **reveal** (sections and cards fade/slide up on scroll — the calm workhorse), **bounce** (a hero image or key icon, once or twice a page at most). The *amount* of motion follows the Brief's Voice & Tone — a calm, credible brand gets calm motion; never reach for motion as decoration. Hard rules that separate polished from amateur: animate **transform/opacity only** (never width/height/margin — they jank and shift layout); entrances **fire once** (re-animating on scroll-back is nauseating); and **honor `prefers-reduced-motion`** — with it on, the page is fully static and readable (a real accessibility requirement). The design is executed by the **frontend-design skill** from the toolkit's skills library (see Safety Rails), steered by this doc + the Brief tone toward the restrained end — never its bold default — with contrast verified at launch. *(On the CA build, motion shipped with the Framer/Motion library; because that's JS-driven, the no-JS content-visibility check in the QA gate matters — content must render even if the script is slow or blocked.)*

**Done when:** a stranger could read the vibe line and describe how the site feels.

---

## 05. Tech Stack + Architecture *(two layers)*

**(a) Decisions with reasons.** Not just "Next.js" but *why* — the reasoning is what stops you second-guessing when the AI suggests something different at 11pm in phase 3.

```
Framework:   [choice] — because [...]
Styling:     [choice] — because [...]
Database:    [choice] — because [grows into later phases without re-platforming]
Email/forms: [choice] — because [...]
Hosting:     [choice] — because [deploys per branch, pairs with phase workflow]
```

**(b) A living architecture sketch** (ASCII is fine) showing how pieces talk, including a dashed "later phases" zone so you can see nothing gets thrown away as you grow.

**Region/compliance note (generalize this):** if your users' data has a legal home (India's DPDP, EU's GDPR, health data rules), pick the database region accordingly and note it here. It's cheap to set at creation, expensive to move later.

**Done when:** every choice has a one-line "because," and you can trace a request from click → server → database → back.

---

## 06. Database Schema + Image & Asset Plan

### 6a. Database Schema

Map tables, fields, and relationships *before* prompting. Mark each field for **required / unique / PII / server-only**.

```
TABLE: leads
  id, name*, email, ... , source*, consent_at, created_at
RELATIONSHIP: [how tables connect]
SECURITY: row-level security on; public is insert-only via server; no public read
WHAT NEVER LEAVES THE SERVER: secrets, internal status flags, full PII tables
```

**Done when:** every "Data:" line from your User Flow Map has a home in a table.

### 6b. Image & Asset Plan *(new in v2 — images are not decoration)*

On a real site, images carry trust, reduce anxiety, and help people self-identify. But every image is also weight on the page, so each one must earn its place by doing a job text can't. Decide placement by walking the User Flow Map and asking, at each step: *"what would the visitor need to **see** here to feel safe / understand / act?"*

**The decision rule (works for any site type):**

| Need | Use | Where |
|---|---|---|
| Trust / "these are real humans" | **Real photos** (team, premises, real work) | About/Team, hero, founder bio |
| Identify a category fast | **Icons**, not photos | Service/segment cards, feature lists, nav |
| Understand a process or data | **Diagrams / charts** | How-it-works, resources, docs, pricing |
| Show the actual product | **Product shots / screenshots** | E-commerce, SaaS, portfolio work |
| Nothing text doesn't already do | **No image** | Most body content, FAQs, legal pages |

**Hard rules (these prevent real-world breakage):**
- **Real beats stock, always** — especially anything trust-led. A genuine, imperfect team photo outconverts a polished stock handshake. Empty space beats a fake image; *fake reads as untrustworthy.* **Never present an AI-generated person as a real team member or testimonial** — that crosses from placeholder into misrepresentation on a trust-led site.
- **Never use random images off the web** — copyright is a real liability for a real business. Use your own, or properly-licensed stock (Unsplash/Pexels free; or a paid library) where the license permits commercial use.
- **Compress before adding** (Squoosh / TinyPNG). Start small even though the framework optimises serving — don't feed it a 6MB phone photo.
- **Placement-by-type, mapped per site:** team/people → photos; categories/features → icons; process/data → diagrams; everything else → probably nothing.

**Count by INSTANCE, not category, and generate 06b FROM 03b's page list *(v3 fix)*.** The original failure: an asset plan that lists "service page hero" as one row when the site has 7 service pages — undercounting by 6. So 06b is built by walking 03b's enumerated page list and expanding every repeated page into its real files. A "service hero" is 7 images; a team page is N photos; a blog is one header per post.

**Per-page image-depth decision *(v3)*.** For each page instance, decide deliberately: **unique image / shared image / icon / none.** Richness is a real design choice with a load-and-consistency cost — not an agent default. Default toward fewer/shared/none on content-led pages; the temptation to fill every slot because generation is cheap is exactly how decorative bloat returns.

**The asset table (instance-level — one row per FILE, fill before the image phase):**
```
FILE (folder/name)            TYPE         DEPTH    SOURCE          STATUS   ALT TEXT
hero/hero-office.png          real photo   unique   own/licensed    needed   ...
service-heroes/hero-gst.png   illustration unique   AI/made         needed   ...
service-heroes/hero-tax.png   illustration unique   AI/made         needed   ...
...(one row per service hero — 7 total)...
team/[name].png               real photo   unique   own             needed   ...
service cards                 icons        n/a      icon set        have     n/a
logo/logo.svg                 vector       unique   commissioned    interim  n/a
```

**Technical note (framework-agnostic principle):** use your framework's optimized image component (e.g. Next.js `next/image`) — it resizes, reformats, and lazy-loads automatically. Fixed brand assets live in `/public`; content images live next to the content they belong to. You drop files in yourself (the AI doesn't "hold" images, same as it doesn't hold secrets) and tell the agent where they are and where they go. **The image-prompt generator (in the toolkit's prompts/) emits one prompt per FILE, each labeled with its target filename** — so you save each download correctly the first time, no rename step.

**Done when:** every image FILE implied by 03b's page list has a row (instance-level, not category) with a type, depth, source, and alt text — and nothing decorative survived the "does it do a job?" test.

---

# PART 2 — Control Artifacts (Living — where vibe coding is won or lost)

## 07. Context Anchor — a literal `CLAUDE.md` in the repo root

The highest-leverage file in the playbook. The AI has **no memory between sessions** — without an anchor, phase-3 you is talking to an agent that never saw phases 1–2. If you use Claude Code, name it `CLAUDE.md`; it auto-loads at the start of every session.

```markdown
# PROJECT CONTEXT — read this first
## What this is        [one paragraph: site, killer feature, who it's for]
## Current status      [phase N of M · last completed · next up · last commit]
## Stack               [one line]
## Conventions         [folders · naming · TOKENS ONLY no hardcoded hex · no new deps without asking · secrets in .env only]
## Decisions made (do not revisit)   [the frozen calls + links to docs]
## Where things live   [tokens · schema · each doc]
```

**Update the "Current status" block at the end of every session.** Those two lines — last completed, next up — are what keep future-you out of trouble. (On the CA build, this is the single thing that made each new session pick up cleanly.)

---

## 08. Build Roadmap — phases sequenced for safety

Order phases so each stands on solid ground, with explicit **acceptance criteria** per phase. The proven ordering, generalized:

```
Phase 0: Scaffold     — repo, stack, design tokens, empty routes, deploys blank
Phase 1: Homepage     — static, the main shape (incl. segment router if used)
Phase 2: Secondary    — all remaining pages static; global states (404/empty/error)
Phase 3: Killer feature — build the differentiator as a front-end first
Phase 4: Data wiring  — make the flows real: DB + email/notifications
Phase 5: Polish       — responsive, real states, SEO, a11y, performance, analytics
LAUNCH:  Go live      — deploy, verify email domain, real content + images, region/compliance
```

Why this order: get the *shape* right with cheap static pages first, then wire data into one proven flow before doing them all. Data-last-and-all-at-once is where most builds collapse.

**Per-phase template**
```
PHASE N: [name]
Goal:        [one sentence]
Acceptance:  [checkable lines — works on mobile, states handled, etc.]
Out of scope: [No-List items]
```

**Done when (per phase):** every acceptance line is *checked*, not "looks about right."

---

## 09. Build Log — the changelog that ends debugging-archaeology

One line per significant prompt and what it produced or broke. When something explodes in phase 4, you trace it to a phase-1 decision in minutes.

```
DATE | PHASE | PROMPT SUMMARY            | RESULT / NOTES        | COMMIT
.... | 4     | Wire form to DB           | Works                 | a3f9c
.... | 4     | Add email on submit       | BROKE submit—reverted | (reverted)
.... | 4     | Add email, keep submit    | Fixed                 | b8e21
```

The **BROKE / reverted lines are the gold** — your map of where the landmines are.

**The "resume note" at each phase transition *(v3)*.** The Context Anchor (07) keeps the *agent* oriented between sessions — but *you* lose context if you pause a project for weeks, and a terse status line won't rehydrate your memory. So at the end of each major phase, have the agent write a short *conversational* paragraph addressed to future-you: why it was built this way, any hidden gotcha (e.g. "the rate-limit logic lives in security.ts, not the form"), and which file to open first when you return. This keeps your *human* memory synced with the system — the counterpart to CLAUDE.md.

---

## 10. QA Checkpoint Protocol — the gate between phases (+ Stuck-State rule)

Phases compound, so never enter the next on a broken foundation. Run the same checklist at every gate:

```
[ ] Renders on real mobile width (360px), not just narrow desktop
[ ] All links/buttons in this phase actually work
[ ] Matches Design System (colors are tokens, spacing on scale)
[ ] Matches the PRD scope for this phase — nothing extra crept in
[ ] Empty / loading / error states exist where relevant
[ ] Any feature that fetches live (DB / API / feed / auth) has a planned fallback — loading-with-timeout, empty, and failed (cached or a calm message), never an endless spinner; content stays visible if JS is slow or blocked (v4)
[ ] Motion (if any) uses the named pieces only — no ad-hoc inline animation — and honors prefers-reduced-motion: with reduced motion on, the page is fully static and readable (v4)
[ ] No console errors
[ ] Committed to git on the phase branch
[ ] Context Anchor + Build Log updated
```

**Self-review trick:** before *you* review, make the agent review itself: *"Review what you built this phase against @02-prd.md and @04-design-system.md. List every deviation and missing state. Don't fix — just list."* It catches its own drift surprisingly well, and turns your review into confirming a list.

### The Stuck-State Protocol *(new in v2 — three strikes, then revert)*

AI agents have a specific failure mode: they confidently "fix" a bug, break something adjacent, fix *that*, re-break the first thing, and spiral — getting worse, not better, with each attempt. The rule:

> **If the agent hasn't fixed a bug in ~3 tries, STOP. `git checkout` back to the last good commit, and re-approach with a fresh session and a re-thought prompt.**

The reason this works isn't just "start over" — it's that **each failed fix pollutes the context with wrong assumptions.** A fresh session often solves in one shot what a poisoned one couldn't in five. Your per-phase commits are what make this safe: you always have a clean point to fall back to. Log the spiral in the Build Log so you don't repeat the prompt that triggered it.

---

## 11. Analytics & Events *(new in v2 — the invisible-funnel fix)*

AI treats analytics and SEO as an afterthought unless you mandate them. Without this doc, you ship a site and have no idea whether anyone finishes your killer feature. This doc makes measurement a first-class spec, not a Phase 5 scramble.

```
ANALYTICS TOOL:  a deliberate choice (v4), not a default —
  - Cookieless (Vercel Analytics / Plausible): no consent banner, clean DPDP/GDPR
    story, counts everyone — but shallow (counts + pageviews, little slicing).
  - GA4: deep funnels, acquisition channels, segments — but uses cookies, needs a
    consent banner, sends data to Google (cross-border). Must fire only AFTER consent.
  - Both: cookieless as the always-on baseline + GA4 (consent-gated) for deep analysis.
  Pick per project from the Business Brief's audience + privacy posture. If GA4 (or
  both): it MUST be consent-gated, and the privacy policy MUST match what's actually
  deployed (a launch gate). Expect the two dashboards to disagree — cookieless counts
  everyone, GA4 only consenting users.

URL STRUCTURE:   clean, readable, stable (/services/gst not /page?id=3)
                 — list the canonical URLs so the AI doesn't improvise slugs

META PER PAGE:   title + description + Open Graph — required on every page
STRUCTURED DATA: the right schema for the site
                 (LocalBusiness, Article, Product, Person...) with real details

KEY EVENTS TO TRACK (the funnel):  the few moments that prove the site works
  - killer_feature_started     (e.g. health-check / signup / add-to-cart begun)
  - killer_feature_completed   (the conversion moment)
  - lead_submitted / purchase / contact
  - [drop-off points from your User Flow Map]
```

**Why events matter more than pageviews:** pageviews tell you traffic; events tell you whether your *funnel* works. Tracking "started vs completed" on your killer feature is the single most valuable number you can have — it tells you if people are bouncing mid-flow, which no amount of traffic data reveals. Wire these in Phase 5, but *decide them here, early*, so the components are built with the hooks in place rather than retrofitted.

**Instrument before launch, not after *(v4)*.** Wire analytics in *before* you go live — you cannot measure a launch retroactively (the first weeks' data is gone if the tracking isn't already there), and on a delivered site you won't be coming back to add it. Provision the bucket before it rains. *(On the CA build, the analytics decision — and adding GA4 alongside the cookieless baseline — surfaced exactly this: instrument before handoff, or the early data is lost.)*

**Done when:** every conversion moment in your User Flow Map has a named event, and every page has a title/description/schema plan.

---

# PART 3 — Running a phase (the loop)

Every phase is the same ritual. Muscle memory is the point.

```
1. OPEN    New session (CLAUDE.md auto-loads context)
2. AIM     State the phase Goal + Acceptance Criteria; reference the docs. NO code yet — get a plan first.
3. BUILD   Generate in small chunks, not one giant prompt
4. REVIEW  Agent self-reviews against PRD + Design System
5. QA      Run the gate checklist (doc 10)
6. SAVE    Commit on the phase branch
7. RECORD  Update Build Log + Context Anchor status
8. CLOSE   Stop. Don't drift tired into the next phase.
```

**Branch per phase, merge when green.** This is your one-command rollback — and the foundation the Stuck-State Protocol depends on.

---

## Copy-paste prompt templates

**Session opener / plan-first**
```
Read CLAUDE.md and /docs for full context. We're on Phase [X]: [goal].
First create branch phase-[X] off main. Don't write code yet — confirm you
understand the current state, stack, and conventions, then give me your plan
in 3–5 steps.
```

**Phase build**
```
Build Phase [X]: [goal].
Acceptance criteria: [...]
Constraints:
- Tokens only from globals.css (no hardcoded hex)
- Match the components in @03-component-inventory.md
- Reuse shared components; do NOT rebuild or touch [prior phases]
- Out of scope: [No-List items]
Work in small steps; stop after [first chunk] for review.
```

**Self-review**
```
Review what you built this phase against @02-prd.md and @04-design-system.md.
List every deviation, missing state (empty/loading/error), and convention
mismatch. Don't fix yet — just the list.
```

**Stuck-state recovery**
```
This bug isn't resolving. Stop editing. The Build Log shows this area last
worked at [commit]. Do NOT keep patching — instead, in one message: explain
the most likely root cause, and propose ONE clean fix. If you're unsure, say so.
```

**Add images (run at launch prep)**
```
I've added [team photos] to /public/images/[...]. Wire them into [About page
team cards] using the framework's optimized image component, with descriptive
alt text. Keep service/segment cards as icons — do NOT swap them to photos.
Don't touch anything else.
```

---

# PART 4 — Safety rails (non-negotiable, all proven)

- **Git, per phase, no exceptions.** Vibe coding without version control is building on a cliff edge. Commit after every QA checkpoint; one branch per phase, merge when green. This is your rollback when the AI confidently breaks something — and it *will*.
- **Never let the AI hold secrets.** API keys, DB passwords, email keys go in a gitignored `.env.local` *you* fill in a text editor — never pasted into a prompt or chat, never hardcoded. The agent reads them from disk and refers to them only by name. *(Learned live: a secret shown even in a screenshot is exposed — rotate it immediately.)*
- **Run the dev server in its own terminal.** Keep a dedicated terminal window running the dev server while you work with the agent in another. They fight over the port otherwise. *(Learned live.)*
- **Verify current tool facts; don't trust the AI's memory.** Tools change — key formats, install commands, framework versions, region names. Check the official docs for anything version-sensitive before relying on it. *(Learned live: the database provider had renamed its API keys; the email provider only delivers to your own address until a domain is verified.)*
- **One dependency rule.** The agent can't add packages without asking. Unsupervised, it'll pull in a library for a five-line problem you now maintain forever. **And it must not *upgrade* either *(v3)*** — no `npm update`, no editing version numbers in `package.json`, without explicit permission. Agents break builds by bumping an existing package to a mismatched major version just as often as by adding one. Dependency management is human-controlled.
- **Prefer small, modular components *(v3, guidance not a hard limit).*** Agents write giant single-file components because it's faster in one prompt — but those choke future sessions and are hard to maintain. Guide it: *if a component is doing two distinct jobs, split it into child components.* (No rigid line-count — that forces artificial splits; it's a judgement, not a tripwire.)
- **Changing a frozen doc is a deliberate, logged action *(v3).*** When reality forces a spec change, don't change the spec and the code in the same breath: **update the doc first, commit it separately with a clear message, then build.** (Keeps the "reconcile-to-reality" exception from quietly becoming uncontrolled drift — no heavy process needed, just separate, logged steps.)
- **The domain expert reviews domain logic.** If the site gives advice or computes anything consequential (health, legal, financial, safety), *you* — the expert — review that logic before launch, and keep its output framed as indicative, not definitive. Put the logic in one editable config file so review is easy. *(Learned live with the Health Check ruleset.)*
- **Polish (Phase 5) bar, made explicit because AI skips it:** responsive to 360px, real empty/error states, SEO (title/meta/OG/schema), accessibility (alt text, focus, contrast, keyboard), performance (image sizes, bundle), analytics + privacy page.
- **Features with a runtime dependency need a planned fallback *(v4)*.** Static pages can't fail for a visitor — there's nothing to fetch. But anything that fetches *live at the moment of use* — a database query, an external API, a news/data feed, an auth check — can be down, slow, or changed, and then the visitor is stuck. For every such feature, decide its off-happy-path behaviour *when you spec it*, not after: a **loading** state with a timeout (so it can't hang forever), an **empty** state, and a **failed** state showing cached/last-known data or a short calm message — never an endless spinner. The accuracy-critical part must render even if a secondary part fails (e.g. statutory due dates still show even if the news feed is down), and anything JS-driven must keep its content visible if the script is slow or blocked. *(Learned live: with JS disabled the Compliance Hub showed a permanent "Loading…" — exactly what a real visitor sees the day the source has an outage.)*
- **The skills library — reusable craft, copied into each build *(v4)*.** The toolkit ships a `skills/` folder of Claude Code skills; the *whole* library is copied into each new project at kickoff (into the project's `.claude/skills/`), so the build agent has them locally and self-activates whichever the task needs (skills trigger by their description — no manual calling). Maintain only the master; every new project copies the *current* master; never patch a project's copy in place. Copying *into* each project (rather than one global install) is deliberate: each delivered site stays pinned to the skills it shipped with, so improving the master later never changes a site already handed off. **Members today:** `frontend-design` (overall craft — distinctive type, committed colour, composition; steer it to the brand via doc 04 + the Brief, never its bold default, and verify WCAG contrast at launch — its bold colours can fall under the bar) and the **motion layer** (the named pieces in doc 04). Extensible — add a skill when a real, repeated need appears, not speculatively.

---

# PART 5 — Launch & Deploy (hardened in v3 — the build's biggest revealed gap)

Building ends at Phase 5. Going live is real-world steps, not code — and it's where the CA build hit the most friction, so v3 hardens it into a real phase with its own gates.

**The hard rule that would have saved two failed deploys:** **run `npm run build` (the production build) locally before every push — not just `npm run dev`.** The dev server is forgiving and silently runs past type errors; the production build runs the strict check the host will run, and catches them on *your* machine instead of as a red deploy. *(Bit the CA build twice — both times a type error invisible in `dev`.)*

**Soft launch vs full launch — name them, they're different stages:**
- **Soft launch** — live at the host URL, for testing; you control who sees it. Placeholders elsewhere are tolerable.
- **Full launch** — promoted, real traffic, all compliance done. Don't mistake a soft launch for finished.

**Deploy mechanics checklist:**
```
[ ] Production build passes LOCALLY (npm run build) before pushing
[ ] Connect repo to host (expect a GitHub/account-link step the first time)
[ ] Add env keys in the host's settings (not in code) — type names exactly
[ ] EXPECT the first build may fail — read the log, fix, re-push (normal, not alarming)
[ ] Set the production site URL (canonical/sitemap/OG depend on it)
[ ] Enable analytics in the host AND redeploy — it only collects from the deployed site
[ ] Email: verify a sending domain so mail reaches anyone, not just your own inbox
```

**Content & compliance checklist:**
```
[ ] Replace ALL placeholders — real copy, team, testimonials, logo, AND contact
    details everywhere (footer, contact page, schema, the wa.me + tel: links)
[ ] Images: run the instance-level Image Plan (06b) — real photos in, icons stay, compress
[ ] Privacy policy is real (not placeholder) — required once you collect any PII (DPDP/GDPR)
[ ] Privacy policy MATCHES the analytics actually deployed — which tool, cookies/consent yes-or-no, where data goes (v4)
[ ] Rendered <title> is correct on each page TYPE — the site/firm name appears once, not doubled; check the real output, not the template (v4)
[ ] Region + consent storage confirmed; schema has real details
[ ] Domain-logic review by the expert (if applicable)
```

**The live-URL smoke test (a formal gate — "works locally" ≠ "works live", proven 3× on the CA build):**
```
[ ] On the DEPLOYED url (not localhost): submit a form → it saves + email arrives
[ ] WhatsApp/call links open to the REAL number (wa.me format ≠ displayed format — check it)
[ ] Analytics dashboard receives events (after the processing delay)
[ ] Walk it on a real phone — images render, nothing overflows at 360px
```

---

# PART 6 — Maintain & Improve (after launch)

Building ends at Phase 5; launching is PART 5. But a site you *deliver* isn't a project you babysit — it has to keep working without you. After handoff it comes back only for updates, fixes, or maintenance, so the lifecycle needs a light operating rhythm, or a live site quietly rots: a form breaks, email stops delivering, dependencies drift, the analytics goes unread. *(This is the "real deliverable, not a project" bar, made practical.)*

Keep it light — a checklist, not a job:

```
WEEKLY (a 5-minute glance)
[ ] A test form submission still saves + the email still arrives
[ ] Analytics / Search Console look sane (no traffic cliff, no error spike)
[ ] No obvious broken links or dead images

MONTHLY
[ ] Update dependencies MANUALLY (never auto) — then run the production build
[ ] Run Lighthouse / PageSpeed — performance and a11y haven't regressed
[ ] Review top pages, drop-offs, and leads — is the funnel still converting?
[ ] Back up / export the leads or content

AFTER ANY MAJOR EDIT (same discipline as a phase)
[ ] npm run build passes locally
[ ] Mobile 360px check · a test form submission · live-URL smoke test
```

**Done when:** there's a rhythm you'll actually keep — and "after any major edit" is treated like a mini-phase (build + smoke test), not a quick push.

---

# PART 7 — Extension: Building an Authenticated App *(v4 — only if your project has logins, roles, and private data)*

Skip this unless your project includes user accounts — a client portal, a dashboard, a members' area, any SaaS. It *layers onto* the core method above (same docs, same loop, same rails); it doesn't replace it. Why it's separate: an app holding private per-user data has a far higher security bar than a marketing site, and the failure here isn't a cosmetic bug — it's one user seeing another's data. *(Generalized from the CA client portal: client + staff roles, per-client data, built after the marketing site.)*

**The extra planning docs (layer onto PART 1).** Three small additions the doc-generation step produces for an app project:
- **App PRD** — the user roles (e.g. client / staff / admin), what each can see and do, and the data that must stay private. The No-List matters even more here.
- **Data model & security** — the schema *plus*, for every table, the access rule: who may read/write which rows. This is where row-level security (RLS) is specified, not assumed.
- **App build roadmap** — phased in security-first order (below), with the denial test as an explicit acceptance gate.

**Build in security-first order — not features-first.** The proven sequence:
```
1. Auth first    — login / logout / session works, before any private data exists
2. Access rules  — define and ENABLE row-level security (RLS) / per-row access
3. PROVE denial  — log in as user A, attempt to read user B's data, confirm it FAILS
4. THEN features — only once denial is proven do you build the screens on top
```
Features-first is the classic trap: build the dashboards, wire the data, bolt on access control last — by which point a leak is buried under everything. Auth and access rules are the foundation, not the finish.

**Deny by default, allow on purpose.** Every table, route, and query starts closed: no access unless a rule explicitly grants it. The opposite — open by default, lock down later — guarantees you forget to lock something. *(On the portal, RLS was written so a row is invisible unless it belongs to the requesting user; staff access is a separate, explicit grant.)*

**The cross-user denial gate (non-negotiable).** Before any feature that shows user data ships: log in as one user and *try* to reach another user's records — by URL, by API call, by guessing an id. It must fail. This single test is the difference between "it works for me" and "it's safe for everyone." Add it to the QA gate for every app phase that touches private data.

---

## The whole thing, at a glance

```
PLAN:    Flow Map → PRD (No-List+Killer+Conversion) → Components(+form security)
         → 03b Site Map & Page Layouts [APPROVE] → Design System → Tech Stack
         → DB Schema → 06b Image Plan (instance-level, from 03b)
SET UP:  Context Anchor (CLAUDE.md) → Build Roadmap → Analytics&Events → git repo
IMAGES:  generate from 06b (filename-labeled prompts) → compress → place → wire
DRIVE:   Each phase → Open·Aim·Build·Review·QA·Save·Record(+resume note)·Close (branch per phase)
GUARD:   Build Log always · QA gate every phase · Stuck-State = 3 strikes then revert
         · no dep add/upgrade without asking · spec changes logged separately
SHIP:    prod-build-locally → deploy mechanics → real content → smoke-test LIVE
         → soft launch, then full launch when compliance done
MAINTAIN: weekly form/email/links glance · monthly deps+build+Lighthouse+leads review (v4)
APP ONLY: if it has logins — auth → access rules → PROVE cross-user denial → THEN features (v4, PART 7)
```

You were already thinking like a product manager. v1 added the release engineer (continuity, consistency, rollback). v2 added what a real deploy teaches: images are trust infrastructure, a stuck AI must be reverted not coaxed, and an unmeasured funnel can't improve. v3 adds what *finishing and launching* teaches: **approve the skeleton before you build it** (03b), **count images as files not categories**, **protect the forms**, and **harden the launch** — because "it builds locally" is not "it works live." v4 adds what *delivering and operating* teaches: plan a fallback for anything fetched live (a feature shouldn't hang when its source is down), choose analytics deliberately and instrument it before launch, maintain the site so it survives without you, and — for apps — prove no user can reach another's data before the feature ships. This framework now works for any site — swap the domain specifics, keep the discipline. *Validate it on website #2.*
