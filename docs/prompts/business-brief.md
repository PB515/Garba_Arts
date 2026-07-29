# Prompt — Business Brief (Universal Intake)

*Toolkit prompt · feeds SOP Step 2b · output feeds doc generation (Step 3)*
*This captures who the business actually is, so the AI builds a real site, not a placeholder one. Works for any website type.*

---

## How to use

Two ways:
- **Interview mode (easier):** paste the prompt and let the AI ask you the questions one section at a time, then have it assemble your answers into a clean brief.
- **Fill-in mode:** answer the questions yourself in a markdown file and use that directly as the brief.

The Business Brief is *inward-looking* (who we are) — the counterpart to the Research Report (who the competitors are). For the substance docs (flow, page content, design vibe), the Brief LEADS; the research shapes strategy on top.

---

## THE PROMPT (copy from here)

```
You are helping me write a Business Brief — a single document describing my
business so that an AI can later build a website that genuinely reflects it,
without inventing generic placeholder content.

Ask me the questions below, one section at a time, waiting for my answers.
Where I leave something blank, note it as "TBD" rather than inventing it. At the
end, assemble my answers into a clean, structured Business Brief in markdown.

Cover these sections:

1. THE BASICS
   - Business name. What it does in one sentence. Who it's for.
   - Locations / where it operates / does it serve a specific region?
   - Years operating, size (solo / small team / larger), any real numbers
     (clients served, projects done) I'm comfortable showing.

2. WHAT WE OFFER
   - The actual products / services (list them as they really are).
   - IMPORTANT: what we explicitly DO NOT offer (so the site doesn't invent it).
   - Pricing posture: fixed price / quote-based / "starting from" / not shown.

3. WHY US (differentiators)
   - What genuinely makes us different or better than alternatives.
   - Our "one thing" we'd want a visitor to remember.

4. THE PEOPLE & TRUST
   - Founder(s) / key team: names, real credentials/qualifications.
   - Real client types or named clients (with permission), real testimonials
     if any, certifications, awards, memberships, press.
   - Anything that proves we're credible and real.

5. VOICE & TONE
   - How should the site sound? (e.g. warm/formal/playful/expert/reassuring)
   - Words, phrases, or claims we WOULD use.
   - Words, claims, or vibes we would NEVER use.
   - 1–2 brands/sites whose tone we admire.

6. THE CUSTOMER
   - Who is the ideal customer? Their situation, their worry, what they want.
   - If there are several distinct customer types, list them.
   - What action do we most want a visitor to take? (call / form / book / buy)
   - The primary CTA and the one belief a visitor must hold before acting
     (this feeds the PRD's Conversion Strategy section).

7. SITE STRUCTURE (feeds doc 03b)
   - Should this be multi-page (separate routes), single-page (one page,
     navbar scrolls to sections), or hybrid (multi-page + a few scroll links)?
   - Rule of thumb: most business sites → multi-page (each page can rank for its
     own terms). Single-page only for a minimal landing page or simple portfolio.
   - Any nav items that should scroll to a section on the current page rather than
     open a new page?

8. CONTENT SEEDS
   - The real questions customers actually ask us (FAQ material).
   - Any real facts/data/process specifics only we know (e.g. exact deadlines,
     steps, requirements) — especially anything the site might compute or advise on.
   - Existing brand assets: logo? colours? photos? any current website?

9. CONSTRAINTS
   - Anything legally sensitive (advice we can/can't give, disclaimers needed,
     data/privacy rules for our region).
   - Anything we must include or must avoid.

When assembling the final brief, keep my real wording where it captures the
voice, mark gaps as TBD, and flag anything that looks legally sensitive so I
review it before launch.
```

---

## Why each section exists (so you don't skip the load-bearing ones)

- **What we DON'T offer** → stops the AI inventing service pages you don't deliver.
- **Voice & tone** → this is where the site's personality should come from — not from the AI guessing or from a generic "professional" default.
- **Trust & people** → the difference between real headshots/testimonials and the PLACEHOLDER badges you'd otherwise ship.
- **Content seeds (real facts/deadlines)** → the only place the domain-specific truth enters; critical if the site computes or advises anything (the "expert reviews the logic" rule depends on this being real).

---

## GATE (check before feeding into doc generation)

```
[ ] Real services listed, and the "do NOT offer" list filled
[ ] Voice/tone is specific (not just "professional")
[ ] At least the real trust assets named (team, credentials, client types)
[ ] Content seeds include the real facts the site will need (esp. anything it computes)
[ ] Legally sensitive items flagged for expert review
```

*Universal: every website type has a business behind it. The sections don't change; only your answers do. One prompt, one source of truth.*
