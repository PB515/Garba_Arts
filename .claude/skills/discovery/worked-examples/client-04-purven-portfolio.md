# Worked example — Purven portfolio (round-trip + a rubric refinement)

*Discovery run reverse-validated against a real shipped build (`Desktop/Portfolio-site`, a foundational IDP build: personal-brand portfolio + CMS). **Status: round-trip proof + refinement.** The interesting part isn't the tier — it's *why* a **portfolio** (a category that usually earns Signature) correctly lands **Essential** here.*

**Date:** 2026-06-22 · **Verdict: capability = moderate (CMS portfolio) · craft tier = ESSENTIAL (restrained — and correct)**

---

## 1. Raw input (reconstructed)
> A personal-brand **portfolio + light CMS** for a builder/engineer (Purven). Show the work (projects), write (field-notes), capture connect/leads. A **Root (Builder Mode) / Canopy (Thinking Mode)** dual-identity. Voice: **credible, plain-spoken, calm, grounded, premium** — *not* flashy.

## 2. Forced early questions → answers (from the build's docs)
- **Audience → device?** People evaluating him (recruiters/collaborators/clients) — mixed/modern, but they're **scanning for substance**, not spectacle.
- **The one action = success?** A **connect** — `lead_submitted` / `outbound_click` (the analytics doc optimizes exactly this funnel).
- **Brand voice?** docs/04: *"calm and understated — motion confirms structure, never decorates… restrained end of frontend-design, never its bold default."*
- **Verifiable?** Real projects + writing; never inflate.

## 3. Feature → capability → tier → perf
| Feature | IDP capability | Craft tier | Perf / effort |
|---|---|---|---|
| Home (Root/Canopy identity) | marketing/landing | **Essential** | reveal + hero pop-in; calm |
| Portfolio + `[slug]` | content-model (projects CMS) | **Essential** | the work speaks; restraint |
| Field-notes + `[slug]` | CMS (writing) | **Essential** | readable, SEO |
| About / Contact (lead) | forms + `lib/security` | **Essential — connect core** | honeypot+rate-limit |
| Admin (projects/notes/leads/images/reports) | CMS admin + auth | **Essential** | functional |

## 4. Tier verdict — and the refinement it forced
Raw scorecard *looks* mid: budget moderate (1) · **brand sells on identity (2?)** · wow helps (1) · devices mixed (1) · part content/part experience (1) → **~6, which would say Signature.** But the build correctly shipped **Essential/restrained** — and that's *right*. Why the gap?

> **Refinement: "brand sells on feeling/identity" needs a sub-distinction.** An *expressive/spectacle* identity (fashion, creative, artist) → craft UP. A **credible/substance identity** (builder, engineer, consultant, expert) **wins on trust → restraint**, exactly like a conversion funnel. Flashy motion would *undermine* a "plain-spoken, credible" builder brand the same way it erodes a coaching brand.

So the identity signal scores **1, not 2**, here → **Essential** (with at most a tasteful reveal). The brand *voice* is the deciding input, not the category label "portfolio."

## 5. ROUND-TRIP — predicted vs shipped
| Discovery predicted | Purven shipped | |
|---|---|---|
| Essential / restrained motion | docs/04: "calm, understated, motion confirms structure never decorates"; no GSAP/Three | ✅ |
| Connect is the one action | analytics optimizes `lead_submitted` / `outbound_click` | ✅ |
| Capability = portfolio CMS + admin | projects · field-notes · leads · site-images · reports + admin | ✅ |
| Never fabricate | real work only | ✅ |

Discovery reproduces the shipped decisions again — a second real round-trip (after Inspire Academy).

## 6. So does this fill the Signature slot?
**No — and that's the honest, useful finding.** It's the *third* real/representative case to land Essential (coaching · Inspire · Purven), which tells us something real: **the user's actual client work is credibility/conversion-led → Essential.** The rubric is now strongly validated at the Essential end and at Flagship (Hinglaj, in progress); a **true Signature-craft** example is still only the **`bugadi-showpage` Signature tier** (a lab artifact, not yet a shipped client). That remains the genuine Signature fill.

## META — notes for the skill
- **Refinement (fold into SKILL.md + WHEN-TO-USE): split the "identity" signal into expressive-identity (spectacle → craft up) vs credible-identity (substance → restraint).** "Portfolio" is NOT auto-Signature; the brand *voice* decides. Purven proves a portfolio can correctly be Essential.
- **Brand voice is a first-class discovery input** — "calm/credible/plain-spoken" is itself a hard down-tier signal, like a conversion funnel.
- Round-trip #2 — the rubric keeps reproducing real shipped builds. Confidence high at Essential; the gap is a shipped Signature, not the method.
