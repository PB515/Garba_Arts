# SOP — Building a Deployable Website with Vibe Coding

*Your start-here process. Follow these steps in order, every project. This is the spine; the Playbook is the method; the prompts are the tools.*

*Part of Vibe Coding Toolkit v4 · one version across the whole toolkit (see CHANGELOG.md)*

---

## What this is

A repeatable, personal operating procedure for taking any website — CA firm, healthcare, portfolio, blog, SaaS, e-commerce — from idea to deployed, using an AI coding agent, without the drift and breakage that kills most AI builds. Proven once end-to-end on a real deployed site (a CA firm), and hardened by that build's lessons.

**The toolkit (this folder) is permanent and reused every project. The output (a project's docs + code) is new every time.** Never copy the toolkit into a project; reference it.

```
TOOLKIT (this folder — reused every project)        PER PROJECT (new every time)
  SOP.md            ← you are here                     /docs (01, 02, 03, 03b, 04-11, generated)
  Vibe-Coding-Playbook-v4.md   ← the method            CLAUDE.md (points back to the current Playbook version)
  Comprehensive-Guide.md       ← the why                the code, the deployed site
  /prompts
    deep-research-business.md       (Step 2a — business / competitor path)
    deep-research-personal-brand.md (Step 2a — portfolio / founder path) (v4)
    business-brief.md
    doc-gen-master.md     (v4 — Playbook + Research + Brief → all docs)
    image-prompt-gen.md   (instance-level, filename-labeled)
```

---

## The two inputs that feed everything

Before any docs exist, you produce two reports. They are different and you need both:

- **Research Report** — *outward-looking.* The market & competitors (business) or the inspirations (personal brand). Answers "how does this site stand out?" → ends with a differentiator + phased plan. *(Use `prompts/deep-research-business.md`, or `deep-research-personal-brand.md` for a portfolio/founder site — see Step 2a.)*
- **Business Brief** — *inward-looking.* This specific business. Answers "what is true and specific about us the site must reflect?" → real services, voice, trust assets, content seeds. *(Use `prompts/business-brief.md`.)*

Two identical businesses in one niche share a Research Report but have completely different Business Briefs. The Brief is what stops the AI filling your site with generic placeholder content.

---

## The Steps

### Step 0 — Prerequisites (once per machine, not per project)
```
[ ] Node.js (LTS) installed · git installed · GitHub account
[ ] AI coding agent installed (e.g. Claude Code) + a paid plan
[ ] A code editor or markdown viewer (VS Code is both)
[ ] PowerShell execution policy set so npm runs (RemoteSigned, CurrentUser)
[ ] Know the lesson: run the dev server in its OWN terminal, separate from the agent
```

### Step 1 — Select the niche / business
Decide what you're building and for whom. One sentence is enough to start.

### Step 2a — Deep Research Report
Pick the research prompt by **how the site wins**:
- **Business / product / service** (CA, e-commerce, SaaS, landing page, local services) → `prompts/deep-research-business.md` — competitor/market analysis → the killer-feature gap.
- **Personal brand / portfolio / founder / creator / consultant** → `prompts/deep-research-personal-brand.md` — inspiration analysis → a positioning differentiator.
- *Tie-breaker:* does the site win by being **better than competitors**, or by being **authentically this person**? Service-on-a-market → business; hire-me-for-who-I-am → personal brand.

Run the chosen prompt on a capable AI (web access strongly preferred).
→ **GATE before proceeding:** does the report name a *real* differentiator — a competitor gap (business) or a specific, defensible positioning gap (personal brand), not generic advice? Does it end with a phased feature/roadmap list? If not, the docs will inherit the weakness — redo it.

### Step 2b — Business Brief
Run `prompts/business-brief.md` and answer its questions about the actual business. **Includes the site-structure question (v3):** is this multi-page, single-page, or hybrid? (Most business sites → multi-page; single-page only for minimal/portfolio.) This answer feeds doc 03b.
→ **GATE:** are the real services, voice, and trust assets captured — enough that the AI won't have to invent content? If you're leaving big blanks, the site will be placeholder-filled.

### Step 3 — Generate all planning + control docs
Run `prompts/doc-gen-master.md`, feeding it **three inputs**: the **current Playbook** (the how) + the **Research Report** (what-wins) + the **Business Brief** (who-we-are). It first surfaces any contradictions/gaps between them for you to resolve, then generates docs 01–11, **including the new 03b Site Map & Page Layouts** (site structure + master page list + nav behaviour + section order per page). For an authenticated app it also generates the PART 7 app docs.
- For the *substance* docs (flow map, PRD content, design vibe), the **Business Brief leads**; the Research Report shapes strategy on top.
- The PRD now includes a **Conversion Strategy** section and a **form-security** requirement (v3).
→ **GATE:** are the docs internally consistent? Spot-check: does the DB schema (06) have a home for every field the flow map (01) writes? Does the killer feature (02) appear in a flow? Does 03b's page list match the flows? Freeze the planning docs once this passes.

### Step 3b — Approve the Site Map & Page Layouts *(new gate in v3)*
Read doc 03b and **sign off the skeleton before any images or code:** site structure declared with a reason, every page listed, every nav item marked navigate-or-scroll, every page's section order set.
→ **GATE:** you approve 03b. This is where you catch layout regret as a cheap edit, and it locks the image slots so 06b can count them. **06b is generated FROM 03b's page list** (instance-level — 7 service pages = 7 heroes, not 1).

### Step 4 — Produce images (BEFORE coding, not at launch)
Take the **instance-level Image & Asset Plan (06b)** + the **Design System (04)** and run `prompts/image-prompt-gen.md` to generate one aspect-locked, **filename-labeled** prompt per image FILE. Then generate (AI) or shoot (real) each image, in your style, at your quality bar. Save each as its stated filename — no rename step.
- Trust slots (team, testimonials) → real, never AI-faked-as-real. Concept slots (OG, blog art) → AI is fine. Logo → vector/commissioned, not AI raster.
- Per-page image-depth is a deliberate choice (unique/shared/icon/none) — default toward fewer on content-led pages.

### Step 5 — Organise assets + final environment setup
```
[ ] Images compressed (Squoosh/TinyPNG) and placed in /public/images/... by filename
[ ] Accounts created (DB, email, host) in the correct region for your compliance
[ ] Keys gathered and put in .env.local YOURSELF (never in chat); .env gitignored
[ ] Copy the toolkit's skills library into the project (its .claude/skills/) so the build agent has frontend-design + the motion layer on hand (v4)
```
→ **GATE:** the setup that interrupts builds is done *now*, so the build runs uninterrupted.

### Step 6 — Vibe code (the build loop)
Follow the Playbook's phase loop for each phase (0→5):
```
Open → Aim (plan first) → Build (small chunks) → Review (agent self-review)
→ QA (the checklist) → Save (commit on phase branch) → Record (log + CLAUDE.md
  + a human "resume note" at phase transitions) → Close (stop; don't drift tired)
```
- Branch per phase, merge when green.
- **Stuck-State rule:** if a bug isn't fixed in ~3 tries, `git checkout` to the last good commit and re-approach with a fresh session. A poisoned context can't fix what a clean one can.
- **No dependency add OR upgrade without asking** (no `npm update` / version bumps either — v3).
- **If a frozen doc must change:** update the doc first, commit it separately, then build (v3).

### Step 7 — Launch & Deploy *(hardened in v3; automated in the IDP)*
**Before pushing:** run `npm run build` (the production build) LOCALLY — the dev build hides type errors that fail in production.

**IDP pre-flight (automatable — run first, fix every blocker):**
```
[ ] npm run env:validate   — no secret-shaped NEXT_PUBLIC_, keys well-formed, required present
[ ] npm run deploy:check   — readiness manifest: required env + per-site placeholders replaced
[ ] npm run build          — production build passes LOCALLY (in template/)
[ ] npm run db:check       — (if the site has a DB) no migration drift
```
Runbooks: `docs/runbooks/deploy.md` (full phase) · `secrets.md` · `migrations.md` · `platform-constraints.md` (Vercel body limit · production alias vs hash URLs · stale CSS · `.next` corruption).
```
DEPLOY MECHANICS
[ ] Connect repo to host (expect an account-link step first time)
[ ] Env keys in host settings (not code), names exact
[ ] Expect the first build may fail — read the log, fix, re-push (normal)
[ ] Set the production site URL (canonical/sitemap/OG depend on it)
[ ] Enable analytics in the host AND redeploy (only collects from the deployed site)
[ ] Verify a sending domain for email (reaches anyone, not just you)
CONTENT & COMPLIANCE
[ ] Replace ALL placeholders — copy, team, testimonials, logo, AND contact details
    everywhere (footer, contact page, schema, wa.me + tel: links)
[ ] Run the instance-level Image Plan (06b)
[ ] Privacy policy REAL (required once you collect any PII — DPDP/GDPR)
[ ] Privacy policy MATCHES the analytics actually deployed — tool, cookies/consent, where data goes (v4)
[ ] Rendered <title> correct per page TYPE — site/firm name appears once, not doubled; check the output, not the template (v4)
[ ] Domain-expert reviews any consequential logic (health/legal/financial)
LIVE SMOKE TEST (on the deployed URL, not localhost — "works locally" ≠ "works live")
[ ] Submit a form → it saves + email arrives
[ ] WhatsApp/call links open the REAL number (wa.me format ≠ displayed — check it)
[ ] Analytics receives events (after processing delay)
[ ] Any live/dynamic feature (feed, portal) degrades gracefully if its source is slow/down — no endless spinner (v4)
[ ] Walk it on a real phone at 360px
```
**Soft launch** (live, testing, you control who sees it) is not **full launch** (promoted, all compliance done). Don't confuse them.

### Step 8 — Retro (this is what keeps the toolkit sharp)
After the project, 10 minutes:
```
- What broke that the playbook didn't cover?
- What did I relearn the hard way?
- What should change in the next playbook version / the prompts / this SOP?
```
Fold the answers back into the toolkit. This is the only step that improves the toolkit itself — skip it and the SOP freezes forever.

### Step 9 — Maintain & Improve (ongoing, after launch) *(v4)*
A site you deliver has to run without you. Keep a light rhythm:
```
WEEKLY: a test form submission saves + email arrives · analytics/Search Console sane · no broken links
MONTHLY: update deps MANUALLY → run prod build · Lighthouse · review top pages/drop-offs/leads · back up data
AFTER ANY MAJOR EDIT: npm run build · 360px mobile check · live-URL smoke test
```
Without this, a delivered site rots quietly — dead form, undelivered email, stale deps. Keep it a checklist, not a job.

---

## If your project is an authenticated app *(v4 — logins, roles, private data)*

A portal, dashboard, or members' area is a different species from a marketing site — the failure mode is one user seeing another's data. Use the Playbook's **PART 7 extension**, which layers onto these steps: extra app docs at Step 3 (app PRD, data-model & security, app roadmap), a **security-first build order** at Step 6 (auth → access rules → *prove* cross-user denial → then features), deny-by-default, and a **cross-user denial gate** before any feature that shows user data ships.

---

## The gates, in one glance

The handoffs are where errors compound. Don't pass a gate on a weak output:

```
after 2a → research names a real differentiator + phased features
after 2b → business substance captured, minimal blanks, site-structure decided
after 3  → docs internally consistent; planning docs frozen
after 3b → 03b skeleton APPROVED (structure, pages, nav, section order) before images/code
after 5  → env + keys + accounts done, build won't be interrupted
each phase → QA checklist passes before the next phase
before push → production build passes LOCALLY
after 7  → live-URL smoke test passes (form, links, analytics, mobile)
at launch → rendered titles correct (not doubled) · privacy policy matches deployed analytics · live features degrade gracefully (v4)
app phases → cross-user denial proven before any feature shows user data (v4)
```

---

## One-line mental model

> Research (outward) + Brief (inward) → docs (incl. 03b) → APPROVE 03b → images → code → launch (hardened) → retro.
> Toolkit is the kitchen; each website is a meal. Keep the kitchen clean and one of a kind.
