# Prompt — Deep Research Report (Universal)

*Toolkit prompt · feeds SOP Step 2a · output feeds doc generation (Step 3)*
*One prompt, works on any capable AI. Platform notes at the bottom for the few differences.*

---

## How to use

1. Fill the three blanks in `[ ]` (niche, region/market, business type).
2. Paste the whole prompt into a capable AI **with web access** if possible (live competitor data beats memory).
3. Read the output against the GATE at the end before you trust it.

---

## THE PROMPT (copy from here)

```
You are a senior product and market researcher. Produce a deep, structured
competitive research report for a new website in this niche:

NICHE / INDUSTRY: [e.g. Chartered Accountancy firm]
MARKET / REGION:  [e.g. India, B2B, SME + startup + NRI clients]
BUSINESS TYPE:    [e.g. professional services lead-generation site]

The report's PURPOSE is to inform how I build a conversion-focused website in
this niche. Optimise the whole report for that — not for prestige or company
size, but for what makes a website actually win customers.

Produce the report in these sections:

1. METHOD & SCORING MODEL
   - State how you selected competitors and what you scored them on.
   - Score each on a clear set of parameters covering: clarity of messaging,
     service/offer depth, trust signals, call-to-action strength, contact/
     conversion mechanics, content/SEO depth, mobile/UX quality, and any
     niche-specific factors. Give a transparent /100 conversion-potential score.
   - Be honest about data limitations (note where you couldn't verify something).

2. TOP COMPETITORS (aim for ~20–30; rank them)
   - A comparison table: name, URL, overall score, their single biggest
     conversion strength, their single biggest gap.
   - Then a short paragraph per top performer: what they do well, where they
     leak customers.

3. WHAT THE BEST ONES DO RIGHT (patterns worth copying)
4. WHAT TO AVOID (patterns that hurt — brochure-style, cluttered, slow, no proof)
5. THE GAP (most important): what do MOST or ALL competitors fail to do?
   This is where a killer feature could live. Name it explicitly.
6. RECOMMENDED FEATURES for my site, split into a PHASED list:
   - MVP (must-have for launch)
   - Phase 2 (after launch)
   - Phase 3 (later / scale)
   Each with: feature, why it matters, rough complexity.
7. ONE-PARAGRAPH STRATEGIC SUMMARY: the single clearest way to win in this niche.

Rules:
- Prioritise real, current, verifiable observations over generic advice.
- If you use web sources, cite them; if you're inferring, say so.
- Be specific and critical, not flattering. I need the truth, not encouragement.
- End with the phased feature list and the named gap — those are the inputs my
  next step depends on.
```

---

## GATE (check before you trust the output)

```
[ ] It names a REAL differentiator / gap, not "have a clear CTA and good design"
[ ] Competitors are real and recent, with specific observations (not vague)
[ ] It ends with a PHASED feature list (MVP / Phase 2 / Phase 3)
[ ] It's critical where competitors are weak, not uniformly positive
```
If it fails any of these, push back ("be more specific / more critical / name the gap explicitly") or rerun on a tool with web access.

---

## Platform notes (the only things that differ)

- **Claude** — handles this long structured prompt well as-is. Use a model with web search on for live competitor data. Strong at the critical/honest analysis.
- **ChatGPT (GPT-5 / with browsing or Deep Research mode)** — turn on browsing/Deep Research for current data. If output is shallow, add: "use your research/browsing tools; don't answer from memory."
- **Gemini** — enable its research/grounding mode for live data. If it over-summarises, add: "be exhaustive and specific; longer is fine; one paragraph per competitor."
- **No web access available** — the prompt still works from the model's knowledge, but say: "flag clearly where you are uncertain or working from older data," and verify the top competitors yourself before relying on the report.

*One prompt, one source of truth. The platform notes are tweaks, not separate prompts — when you improve the prompt, you improve it once.*
