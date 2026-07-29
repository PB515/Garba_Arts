# v4 Backlog — Recommended Toolkit Improvements

*The running spec for the next version of the toolkit. Every improvement gets captured here, with enough context to act on later without re-deriving it. **This file IS the v4 spec:** when you sit down to write v4, walk these entries, fold the approved ones into the toolkit, mark them done, and keep the rejected ones logged so they don't creep back.*

*Maintained continuously — add to it the moment you hit a real gap (a build, a retro, a review), while it's fresh. This replaces the one-line placeholder backlog that used to live in the README; the README now points here.*

---

## The admission filter (what's allowed in)

> Take only things that catch a **concrete failure** — something that actually broke, or clearly will, in real use.
> Reject tidy-sounding structure: modes, tiers, extra phases, rigid numbers, process for its own sake.
> Every entry must name the real failure it catches. If it can't, it doesn't belong here.

*This is the same filter that kept v3 honest. Lived experience drives the structural changes; reviews only polish edges. Be most skeptical of suggestions that add frameworks; most receptive to ones that name a specific thing that breaks.*

---

## How to use this file

1. **Capture as you go.** Hit a gap mid-build or in a review → add an entry now, in the format below.
2. **Keep it honest.** Run each candidate through the filter above before it earns a slot.
3. **When writing the next version:** this file is the spec. Decide which entries make the cut, fold them into the toolkit (SOP / Playbook / a doc / a new module / prompts), mark them `done`, and clear them.
4. **Never delete a rejected idea** — log it under Rejected with its reason, so it doesn't quietly creep back.
5. **Validate before trusting.** An entry written from one build is a strong draft, not gospel — confirm it on the next real build.

Entry format:
```
### N. Title — Status
- Catches:        the concrete failure
- Fix:            what changes
- Slots into:     which file / module
- Why it matters: the consequence of not doing it
- Source:         where it surfaced
```

---

## Approved for v4

### 1. Authenticated-app module — Status: approved
- **Catches:** The toolkit is built for marketing / content / lead-gen sites. Building the client portal (login, client + staff roles, per-user data isolation, row-level security) had no pattern — portal-01/02/03 and the security-first phase order were invented mid-build.
- **Fix:** Add a reusable "authenticated app" module alongside the website method: a doc pattern (PRD + data-model & security + roadmap), a security-first phase order (auth → access rules / RLS → prove cross-user denial → *then* features), the "deny-by-default, allow-on-purpose" principle, and the cross-user denial test as a non-negotiable gate before any feature that shows user data. Generalize the CA portal's portal-01 / 02 / 03 into the reusable templates.
- **Slots into:** a new module in the toolkit, referenced from the SOP / Playbook whenever a build includes auth.
- **Why it matters:** an authenticated app holding user data has a far higher security bar than a marketing site — winging it risks one user seeing another's data, which on a real site is a disaster, not a bug. A pattern means the next app starts from proven structure instead of improvisation.
- **Source:** CA client-portal build (Phase A / B); confirmed in the live-site review.

### 2. Runtime-dependency pattern — Status: approved
- **Catches:** The method was proven on static ("printed menu") pages that can't fail. Features that fetch live at the moment of use ("specials board" — the Compliance Hub's news/dates, the portal's login-gated data) can fail at runtime, and the method has no step that forces a planned fallback. Evidence: the Hub renders an endless "Loading…" with no JavaScript — exactly what a real visitor sees the day the source is down.
- **Fix:** For any feature with a runtime dependency (database, API, live feed, auth check), decide *at planning time* — not as a QA afterthought — what the visitor sees in each off-happy-path state: **loading** (with a timeout so it can't hang forever), **empty** (nothing to show), **failed** (source didn't answer → cached last-known data or a calm "temporarily unavailable" message, never an endless spinner). The accuracy-critical part of a feature must render even if a secondary part fails (e.g. statutory due dates render even if the news feed is down).
- **Slots into:** a planning step in the relevant doc (Component Inventory / build roadmap) + a launch-gate check. Promotes the existing "loading / empty / error states" QA checkbox into a planning decision with a real fallback.
- **Why it matters:** static sites can't break for a user; runtime features can — and when they do it's a broken-looking page that costs trust and leads. Every future dynamic feature (booking, dashboard, search, any login) hits this.
- **Source:** Compliance Hub + portal; confirmed in the live-site review.

### 3. QA gate — check the rendered title per page type — Status: approved
- **Catches:** The live site shipped with a doubled `<title>` ("Compliance, made human - Patel | Patel") even though the toolkit covers title / meta in the Analytics & Events doc. The spec covered titles; a doubled one still shipped because nobody checked the actual rendered output.
- **Fix:** Add to the launch / QA gate: view the rendered `<title>` (and og:title) on each page type and confirm the firm name appears exactly once, in the intended format.
- **Slots into:** launch checklist (SOP Step 7) and the per-phase QA gate.
- **Why it matters:** a doubled / wrong title is an SEO + polish miss invisible unless you check the rendered output — cheap to catch, ships silently otherwise.
- **Source:** live-site review.

### 4. QA gate — privacy policy matches deployed analytics — Status: approved
- **Catches:** The live privacy policy contradicted itself — one section described Google Analytics 4 + Vercel Analytics, another said only Vercel, cookie-free. This happens when analytics / cookies change but the policy isn't reconciled.
- **Fix:** Add to the launch gate: confirm the privacy policy's analytics/cookies section matches what's actually deployed — which analytics is installed, whether cookies/consent are used, where data goes.
- **Slots into:** launch checklist (content & compliance section).
- **Why it matters:** for a professional / regulated site, a privacy policy that doesn't match reality is a credibility and (mild) compliance risk under DPDP / GDPR.
- **Source:** live-site review.

### 5. Analytics — make the tool a choice (cookieless / GA4 / both) + instrument before delivery — Status: approved
- **Catches:** Doc 11 specs Vercel Analytics only. But (a) the deep long-term analysis a delivered site needs — acquisition channels (where traffic comes from), funnel exploration, segments — lives in GA4, which Vercel's thin dashboard can't do; (b) analytics must be live *before* launch, since you can't retroactively measure the first weeks of real traffic and, on a delivered site, you won't be coming back to add it; and (c) doc 11 doesn't address the cookie/consent tradeoff GA4 brings.
- **Fix:** Make the analytics tool an explicit *choice* in doc 11 — cookieless-only (Vercel / Plausible), GA4, or both — with the tradeoff stated: GA4 = richer analysis but cookies, a consent banner, and cross-border transfer to Google; cookieless = clean DPDP story but shallow analysis. If GA4 (or both) is chosen, attach two hard requirements: GA4 fires only *after* consent (consent-gated), and the privacy policy discloses it accurately. State the principle plainly: instrument analytics before launch, not after — a delivered site can't be measured retroactively.
- **Slots into:** doc 11 (Analytics & Events) — the tool section + a consent/privacy requirement; plus a launch-gate line.
- **Why it matters:** for a "real deliverable, not a project," analytics is how the client keeps improving the site after the builder is gone — so it has to be the right depth, live from day one, and compliant. Skipping it means lost early data and a weaker long-term tool.
- **Source:** CA site (GA4 added alongside Vercel); this discussion.

### 6. Master doc-generation prompt — Status: approved
- **Catches:** Step 3 — feed Playbook + Research + Brief and generate all the project docs — is the highest-leverage step in the whole method, and it's the *only* one with no dedicated prompt. It's run from memory each time, so the doc set's consistency depends on whoever's driving remembering the rules.
- **Fix:** Add `prompts/doc-gen-master.md`. Inputs: the current Playbook + Deep Research Report + Business Brief (the three you actually have — not a separate "strategy blueprint"). It generates docs 01–11 (incl. 03b, 06b) in a consistent structure, with the rules baked in: Business Brief leads for substance and voice; Research leads for competitive gap and feature strategy; never invent testimonials, credentials, prices, team, or legal claims; mark unknowns `TBD`; flag contradictions between the inputs *before* generating; keep docs internally consistent; respect the 03b approval gate.
- **Slots into:** `prompts/` (new file), referenced from SOP Step 3.
- **Why it matters:** Step 3 is where the entire build gets specced — running it from memory is the biggest operational gap in the toolkit. A prompt makes the toolkit genuinely repeatable across niches instead of dependent on recall.
- **Source:** first toolkit review (turn 1) + ChatGPT review — two independent analyses converged on this same gap.

### 7. Post-launch maintenance checklist — Status: approved
- **Catches:** The method ends at launch + retro (Steps 7–8) with no "operate it after handoff" guidance. But a delivered site comes back only for updates, fixes, or maintenance — and it has to keep working without the builder present. The post-launch lifecycle is uncovered.
- **Fix:** Add a short maintenance checklist (a Step 9, or folded into Launch) — lean, not heavy. *Weekly:* forms still submit, email still delivers, analytics / Search Console sane, no broken links. *Monthly:* update dependencies manually (never auto), run production build, run Lighthouse / PageSpeed, review top pages + drop-offs + leads. *After any major edit:* `npm run build`, mobile 360px check, form test, live-URL smoke test (this line partly formalizes a rule you already have).
- **Slots into:** SOP (a Step 9 after the retro) + the Playbook.
- **Why it matters:** the toolkit's whole point is "real deliverable, not a project" — a site nobody maintains after handoff quietly rots (dead forms, broken email, stale deps). This closes the lifecycle. Forward-looking (the CA site only just launched), but it's the practical form of the deliverable-not-project principle.
- **Source:** ChatGPT review + your own "delivered site comes back only for maintenance" reasoning.

### 8. Housekeeping — fix version + numbering inconsistencies (apply during the v4 rewrite) — Status: approved
- **Catches:** The v3 docs drifted out of sync — version references and a doc-count mismatch that can mislead the AI at generation time and confuse future-you. Deferred to the v4 rewrite rather than patched piecemeal now.
- **Fix (three edits):**
  - **README**, "What this folder is": "points back to *Playbook v2*" → "the current Playbook version" (don't hardcode the number, so it survives future bumps).
  - **Comprehensive Guide**, intro: "Companion to … *Vibe-Coding-Playbook-v2.md* (the method)" → "the current Vibe-Coding-Playbook version."
  - **Comprehensive Guide**, numbering: control docs "07–12" → "07–11" (two places — the Step 3 "What" and the frozen/living split) to match the Playbook and SOP. Keep 03b and 06b as sub-docs.
- **Slots into:** README + Comprehensive Guide; re-confirm the SOP stays consistent at 01–11.
- **Why it matters:** a toolkit whose own docs disagree on version and doc count erodes trust in the system and can feed the AI a wrong doc list. Cheap to fix; fold it into the rewrite so it actually happens.
- **Source:** ChatGPT review + confirmed in this session; deferred to the v4 pass at your call.

---

## Rejected (logged so they don't creep back)

- **Secrets-hardening workflow rule.** *Rejected.* The "keys in `.env.local`, never in chat" rule already lives in the safety rails. The key-paste incidents were one-time first-timer confusion by a solo operator who now understands the flow — not a systemic gap. More process here would be bloat.
- **Website Strategy Blueprint (doc 00).** *Rejected.* Its content already lives in the Business Brief, the PRD's Conversion Strategy, 03b, and Tech Stack; caused no concrete failure on the CA build. Upfront tidy-structure. (Small live kernel — "website type → which optional modules apply" — noted, not built; revisit if a future build's type actually demands it.)
- **Lead Handling & Operations (doc 12 — CRM, dashboards, lead status, CSV export).** *Rejected.* The save-to-DB + email + spam-protection flow works and didn't fail; the rest is business-specific feature-creep overlapping the portal/admin already being built. (UTM / traffic-source capture on forms noted as a cheap future idea, not committed.)
- **SEO / content keyword plan (doc 06c).** *Deferred.* Real kernel for SEO-dependent sites, but its technical-SEO half duplicates doc 11 and its growth-readiness half overlaps entry 5; the new part (keyword-per-page map + content engine) hasn't failed anything yet. Revisit once the site has real traffic and you can see whether the lack of it hurts ranking.
- **Folder restructure (playbooks/ templates/ prompts/ examples/ archive/).** *Rejected.* Catches no failure and would break every existing reference (CLAUDE.md, README tree, SOP diagram, prompt→doc links). Reorganization churn.
- **Renaming the version.** *Rejected.* Cosmetic — the value is in the content, not the title.

---

## Validation status

> **Entries 9 (motion) and 10 (skills library)** were the design-quality experiments — **both validated on the live CA site** (full rollout, on-brand, with the reduced-motion / no-JS / mobile-Lighthouse checks held), so **both are now approved and folded into the Playbook** (doc 04 + Safety Rails). Their entries are kept below as the record of what was tested.
>
> The rest of v4 is approved and written into the Playbook, but everything so far is from ONE build (the CA firm). The newer *structural* patterns — the **authenticated-app extension** (entry 1) and the **runtime-dependency fallback** (entry 2) — have not been run from the start of a fresh project; confirm or correct them on build #2 in a different niche, then mark them settled.

### 9. Motion & interaction layer — Status: approved (validated on the CA build; folded into the Playbook — doc 04 + QA gate)
- **Catches:** Sites ship visually static — no entrance motion, reveal, or micro-interaction — which can read as unfinished next to competitors. Quality gap, not yet a concrete failure (the CA site shipped and worked without it). Also tests the other direction: whether *adding* motion creates a concrete failure — jank / layout shift, bad behaviour at 360px, content invisible without JS (same failure class as the Hub's endless "Loading…", entry 2), or a reduced-motion miss.
- **Fix:** A small set of motion pieces — pop-in, reveal-on-scroll, bounce — used via named components (not ad-hoc inline animation), plus a reduced-motion rule. **What actually shipped on the CA site: the Framer / Motion library, not the CSS-only approach the original motion doc specced.** That divergence happened because the frontend-design skill reaches for Framer by default and won — the exact silent-dependency risk entry 10 warns about, now a live instance. Decision: **keep Framer** (it's a legitimate production library and the site's built on it); the no-dependency rule gains a sanctioned exception for animation; the CSS-only components remain as a fallback if ever wanted. Because Framer is JS-driven, three checks are mandatory (and matter more than with CSS): (1) **no-JS / slow-JS** — Framer renders hidden initial states (opacity 0) and needs JS to reveal them, so throttle/disable JS and confirm content (especially the hero) still shows, never invisible; (2) **reduced-motion must be wired explicitly** (`MotionConfig` / `useReducedMotion`) — Framer doesn't honor it automatically; (3) **mobile Lighthouse** — Framer adds JS weight, re-check PageSpeed didn't drop.
- **Slots into:** doc 04 (Design System & Vibe) — a short MOTION block (motion vibe + which pieces this site uses + where) + QA-gate lines (named pieces only; reduced-motion honored; no-JS content-visibility check). NOT a new phase. Tone set in the Business Brief's Voice & Tone; the AI generates the doc-04 motion block from it. Reusable form = a skill in the skills library (entry 10).
- **Why it matters:** for "a real deliverable, not a project," polish is part of the bar — but only if it doesn't cost stability. The homepage shows motion can lift perceived quality (read as not-generic, on-brand); the JS-driven checks are what keep that from costing stability when no one's there to fix it.
- **Source:** build #1 motion experiment — full CA site shipped and deployed, judged not-generic / on-brand, with the reduced-motion / no-JS / mobile-Lighthouse checks held. **Validated → approved, folded into the Playbook (doc 04 + the QA gate).** Shipped with Framer/Motion (diverged from the CSS-only plan via the skill's default — concrete evidence for entry 10's "decide the dependency deliberately" rule). Re-confirm on build #2 like the rest.

### 10. Skills library — a reusable shelf of AI skills, copied into every project — Status: approved (validated on the CA build; folded into the Playbook — Safety Rails)
- **Catches:** Capabilities like design quality — and more skills to come — otherwise get wired in by hand, per skill, per project, which doesn't scale. There's no standard way for a build's agent to have the right skills on hand.
- **Fix:** One skills folder in the toolkit = the master library (single source of truth), holding multiple Claude Code skills. The whole library is copied into every new project at kickoff (into the project's `.claude/skills/`), so the agent has them all locally and self-activates whichever the task needs — skills trigger by their description, no manual calling. You maintain and grow only the master; every NEW project copies the CURRENT master; never patch a project's copy in place. **Member #1 — frontend-design:** steered to the brand via doc 04 + the Business Brief tone (never its bold default), contrast verified in the Phase 5 accessibility check (its bold colours can land under WCAG AA and it doesn't self-correct), and its motion guidance deferring to the motion layer (entry 9) — which, packaged as a skill, is a natural member #2 of this same library.
- **Slots into:** SOP project setup — "copy the current skills library into the new project" becomes a kickoff step (Step 0 prereqs, or Step 5 "organise assets + env"). The master library lives in the toolkit beside the prompts and docs.
- **Why it matters:** it scales — each new skill adds capability with zero per-project wiring, and every build starts with the full set. And copying the library *into* each project (vs a shared global install) fits the deliverable-not-project rule: each delivered site is self-contained and pinned to the skills it shipped with, so improving the master later never changes a site already handed off — like pinned dependencies. A shared global install would do the reverse (update one skill, every project shifts). The single rule that keeps it clean: edit only the master; new projects always pull the current master.
- **Source:** this session — generalized from frontend-design into a library model at your direction. **Validated on the CA build (frontend-design + motion shipped via the library) → approved, folded into the Playbook (Safety Rails).** frontend-design is member #1, motion member #2; keep validating the approach as you add more skills.

### 11. Personal-brand / portfolio research path — Status: approved (validated on a real generation)
- **Catches:** The single deep-research prompt is a competitor-analysis engine (competitors → shared gap → killer feature). Pointed at a portfolio / founder / creator site — which has no competitor market and wins on authentic identity — it produces a competitor-framed report that doesn't fit, and the docs inherit nonsense (a portfolio PRD with a competitor table + a killer-feature gap).
- **Fix:** A second research prompt, `deep-research-personal-brand.md`, that studies INSPIRATIONS not competitors and ends with a positioning differentiator + phased roadmap. A Step 2a decision rule picks between the two by how the site wins (better-than-competitors → business; authentically-this-person → personal brand). The existing prompt was renamed `deep-research-business.md` for symmetry. `doc-gen-master.md` gained a personal-brand branch (competitor table → inspirations table; killer feature → positioning differentiator; research design tokens/copy treated as directional, doc 04 + Brief stay authoritative; citation markers stripped from site copy).
- **Why it's a 2-way split, not bloat:** the axis is *competitor-differentiated vs identity-differentiated* — one business prompt covers CA / ecom / SaaS / landing / services; one personal prompt covers portfolio / founder / creator / consultant. This is the LAST split on this axis; per-niche research prompts (ecommerce, saas, …) are rejected — just skip the parts of the business prompt that don't apply.
- **Validation:** generated a real portfolio research report with the personal-brand prompt — it studied real inspirations (Paul Graham, Naval, Anthropic, Stripe, Linear, Brittany Chiang, Lee Robinson), gave concrete borrow/avoid, an MVP structure that maps to doc 03b, and invented nothing. Then trimmed the prompt (16 → 11 sections; merged duplicate content; hardened the differentiator; made visual direction directional). Two weaknesses the gate now guards: a soft differentiator, and design-direction drifting into doc 04's territory.
- **Source:** this session — a portfolio build need plus a test generation that confirmed the prompt works.
