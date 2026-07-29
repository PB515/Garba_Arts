# Prompt — Master Doc Generator (Universal)

*Toolkit prompt · feeds SOP Step 3 · turns the Playbook + Research + Brief into the full project doc set (01–11, incl. 03b & 06b)*
*This is the step that was previously run from memory. It encodes the generation rules so the doc set comes out consistent every time, and nothing gets invented.*

---

## How to use

1. Have ready your three inputs: the **current Playbook** (the method), your **Deep Research Report** (Step 2a), and your **Business Brief** (Step 2b).
2. Paste the prompt below + all three inputs into a capable, long-context AI (this is a large generation — a model with a big context window handles it best).
3. It first reports **contradictions and gaps** for you to resolve — answer them; don't let it invent. Then it generates the docs.
4. Save each doc under its filename in the project's `/docs`.
5. Run the **GATE** (below), then **approve 03b (Step 3b)** before any images or code.

The Playbook defines *what each doc contains*; Research drives *strategy*; the Brief drives *substance and voice*. This prompt just orchestrates them and holds the rules.

---

## THE PROMPT (copy from here)

```
You are generating the COMPLETE planning and control document set for a real-world
website build. I will give you three inputs:

  (1) THE PLAYBOOK — the method. It defines what each doc (01–11, plus 03b and 06b)
      must contain and the rules the docs obey. It is the authority on STRUCTURE and
      standards. Follow it.
  (2) THE DEEP RESEARCH REPORT — outward-looking: the market, competitors, the gap,
      and the phased feature list. It is the authority on STRATEGY (the killer
      feature, what wins, what to prioritise).
  (3) THE BUSINESS BRIEF — inward-looking: who this business actually is — real
      services, voice, trust assets, content seeds, the site-structure answer. It is
      the authority on SUBSTANCE and VOICE (everything the site actually says).

When inputs conflict: the Brief wins on facts about the business; Research wins on
competitive strategy; the Playbook wins on doc structure and rules.

STEP 1 — BEFORE generating anything, reconcile the inputs. Read all three and report:
  - Any CONTRADICTIONS (e.g. Research assumes a service the Brief says they don't offer).
  - Any GAPS the docs will need that the inputs don't cover.
List them and ask me to resolve them. Do NOT invent answers to fill them.

STEP 2 — Once I confirm, generate the docs below, in order, as ONE internally
consistent set. Output each under a clear "## NN. <name>" heading so the set can be
split into files. (You may span several messages if needed — keep them consistent.)

PLANNING DOCS (frozen after generation):
  01. User Flow Map — 3–5 core journeys; every page/component/table/image falls out
      of these. If the site serves multiple audiences with no single primary one,
      make a segment router the homepage's job.
  02. PRD — a competitor table (from Research) + the No-List (what you are NOT building
      in v1) + the Killer Feature (the gap competitors share) + a CONVERSION STRATEGY
      block (primary CTA, secondary CTA, the one belief a visitor must hold, top 2–3
      objections + how the page answers each) + a FORM SECURITY requirement (honeypot
      + server-side validation + rate limiting) + a success metric.
  03. Component Inventory — every component with its STATES (button default/hover/
      focus/disabled/loading; input empty/focused/filled/error; form idle/submitting/
      success/error; page-level loading/empty/error/404). Every form carries the
      security requirement.
  03b. Site Map & Page Layouts — the site structure (multi/single/hybrid, taken from
      the Brief, with a one-line why), EVERY page enumerated, each nav item marked
      navigate-vs-scroll, and each page's section order. THIS IS APPROVED BY THE HUMAN
      BEFORE IMAGES OR CODE — generate it, then flag clearly that it needs sign-off,
      and that 06b is counted from its page list.
  04. Design System & Vibe — vibe line + 2–3 references + tokens (color/type/spacing
      scale/radius/shadows) + a MOTION block: the motion vibe in a line, which named
      pieces this site uses (pop-in / reveal / bounce) and where, driven by the
      Brief's Voice & Tone (restrained motion for calm/credible brands; never
      decoration). All colours as tokens — no hardcoded hex.
  05. Tech Stack + Architecture.
  06. Database Schema — a home for EVERY field any flow (01) reads or writes.
  06b. Image & Asset Plan — built FROM 03b's page list, INSTANCE-LEVEL (7 service
      pages = 7 hero files, not 1), each row with type/depth/source/alt. Trust slots
      (team, testimonials) are real, never AI-faked-as-real.

CONTROL DOCS (touched every session):
  07. Context Anchor (CLAUDE.md) — what this is, current status, stack, conventions
      (tokens only / no hardcoded hex / no new deps without asking / secrets in .env
      only), decisions-made (do not revisit), where-things-live.
  08. Build Roadmap — phases 0–5 with per-phase acceptance criteria, in safety order
      (scaffold → homepage → secondary pages → killer feature → data wiring → polish).
  09. Build Log — the changelog template + a human "resume note" at each phase transition.
  10. QA Checkpoint Protocol — the per-phase gate, including: empty/loading/error
      states; for ANY feature that fetches live (DB/API/feed/auth) a PLANNED fallback
      (loading-with-timeout, empty, failed → cached or a calm message; never an endless
      spinner; content visible even if JS is slow/blocked); and motion uses the named
      pieces only and honors prefers-reduced-motion.
  11. Analytics & Events — name the funnel events (killer_feature_started /
      _completed, lead_submitted / contact), per-page meta + schema, clean URL
      structure. THE ANALYTICS TOOL IS A CHOICE: cookieless (Vercel/Plausible) vs GA4
      vs both — pick from the Brief's audience + privacy posture; if GA4 (or both), it
      MUST be consent-gated and the privacy policy MUST match what's deployed.
      Instrument before launch.

IF THIS PROJECT IS AN AUTHENTICATED APP (the Brief/Research indicate logins, user
roles, or private per-user data), ALSO generate these and use a security-first order:
  - App PRD — the user roles, what each can see/do, and the data that must stay private.
  - Data Model & Security — the schema PLUS, for every table, who may read/write which
    rows (row-level security specified, not assumed). Deny by default.
  - App Build Roadmap — auth → access rules → PROVE cross-user denial → THEN features,
    with the cross-user denial test as an explicit acceptance gate.

IF THIS IS A PERSONAL-BRAND / PORTFOLIO PROJECT (the research came from
deep-research-personal-brand.md — no competitor market): adjust the PRD — the competitor
table becomes an INSPIRATIONS table, and the Killer Feature becomes the POSITIONING
DIFFERENTIATOR (the specific, defensible space this person owns). Conversion Strategy
still applies (what you want a visitor to do and believe — read, hire, follow). Treat any
design tokens, hero copy, or templates IN THE RESEARCH as DIRECTIONAL input only: doc 04
and the Business Brief remain the authority on the final design system and substance, and
contrast is verified at launch. Never carry the research's citation markers into site copy.

RULES THAT APPLY THROUGHOUT:
  - NEVER invent testimonials, credentials, prices, team members, client names, or
    legal claims. If the Brief doesn't supply it, write "TBD" and flag it.
  - Keep the set INTERNALLY CONSISTENT: every field a flow (01) writes has a home in
    the schema (06); the killer feature (02) appears in a flow; 03b's page list matches
    the flows and is what 06b counts from.
  - Flag anything legally sensitive (advice, disclaimers, data/privacy rules) for human
    review before launch.

End with: a list of every TBD/unknown, and any contradiction you could not resolve.

Here are my inputs:
--- (1) THE PLAYBOOK ---
[paste the current Vibe-Coding-Playbook]
--- (2) THE DEEP RESEARCH REPORT ---
[paste your Step-2a research output]
--- (3) THE BUSINESS BRIEF ---
[paste your Step-2b brief]
```

---

## GATE (check before you freeze the docs)

```
[ ] Contradictions between the inputs were surfaced and resolved BEFORE generation
[ ] Internally consistent — schema (06) has a home for every field the flows (01) write;
    killer feature (02) appears in a flow; 03b's page list matches the flows
[ ] Nothing invented — every unknown is "TBD" (no fake testimonials/credentials/prices/team/legal)
[ ] PRD has the Conversion Strategy block + the form-security requirement
[ ] doc 04 has a MOTION block; doc 10 has the runtime-fallback + reduced-motion checks
[ ] doc 11 states the analytics CHOICE; if GA4, consent-gating + privacy-match are noted
[ ] If an app: App PRD + Data-Model-&-Security + security-first roadmap + denial gate present
[ ] If personal-brand/portfolio: PRD uses an inspirations table + positioning differentiator (NOT a competitor table); research tokens/copy treated as directional, doc 04 + Brief authoritative
[ ] Legally sensitive items flagged for review
→ Then APPROVE 03b (Step 3b) before any images or code.
```

---

*One prompt turns the three inputs into the whole doc set: the Playbook defines structure, Research drives strategy, the Brief drives substance — and nothing gets invented. One source of truth.*
