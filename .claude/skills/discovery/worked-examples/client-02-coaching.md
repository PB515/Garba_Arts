# Worked example — Kota coaching institute (JEE/NEET prep)

*Live discovery capture. **Status: representative dogfood** — a constructed Essential-tier brief (no live client) run to prove the process **generalizes to the opposite end of the tier spectrum from Hinglaj (Flagship)** and to run the **with/without test**. A real Essential client would strengthen this; the reasoning and tier judgment are the proof.*

**Date:** 2026-06-20 · **Status:** discovery (proof run) · **Tier verdict: Essential** (one Signature accent)

---

## 1. Raw input (as given)
> A coaching institute in Kota (JEE + NEET prep) wants a website. ~12 years running, strong results (toppers' photos, ranks), faculty are IITian/doctor teachers, batches for class 11/12 + droppers, plus a hostel. They want it to look **"premium and modern, maybe with animations like the big edtech sites,"** and the goal is **more admission enquiries**. They have a logo + brand colours.

*The trap is in the input: the client explicitly asks for "animations like the big edtech sites." A craft-pusher says yes. The skill's job is to decide what actually serves the goal.*

## 2. Clarifying questions → answers  *(ASSUMED — no live client; marked as assumptions)*
- Q: Who opens this site, on what device? → A (assumed): anxious **parents + 16–18 students**, overwhelmingly **mid-range Android, admission-season spikes, often tier-2/3 towns + patchy data.**
- Q: What's the ONE action that = success? → A: an **admission enquiry** (call / WhatsApp / form) that a counsellor follows up.
- Q: Which results can you actually **verify/show with consent**? → A: ranks + topper photos with permission (this is the trust currency; **never fabricate** — Safety Rail).
- Q: Where do enquiries go + who follows up how fast? → A: a counsellor team; speed of follow-up matters more than any animation.
- Q: Regional language? → A: English + **Hindi** helps (audience).

## 3. Feature list → IDP capability + craft tier + perf
| Feature | IDP capability | Craft tier | Perf / effort note |
|---|---|---|---|
| Home / landing | marketing/landing (golden-path) | **Essential** | fast, trust-forward; **NOT** a hero video — it taxes the exact mobile audience |
| Results / toppers | content-model (results collection) | **Essential + one Signature accent** | the ONE place a tasteful count-up / reveal earns its keep (it IS the proof) |
| Courses / batches (11/12/dropper) | content-model | **Essential** | clear, comparable, scannable |
| Faculty | content-model | **Essential** | credibility; real photos + real credentials |
| Hostel | static page | **Essential** | info + photos |
| **Admission enquiry (call/WhatsApp/form)** | forms + `lib/security` (honeypot+rate-limit) + lead store | **Essential — the conversion core** | the whole site exists for this; make it instant + everywhere |
| Hindi/English | i18n | **Essential** | widen reach |

## 4. Site map (tier per section)
- `/` — trust hero (results proof + clear CTA) — **Essential** (sticky call/WhatsApp)
- `/results` — ranks + toppers — **Essential + a single Signature reveal**
- `/courses` — batches — **Essential**
- `/faculty` · `/hostel` · `/about` · `/contact` — **Essential**

## 5. Decisions + rationale (the restraint IS the skill)
- **Verdict: Essential**, with exactly **one Signature accent** (the results reveal). Rationale below — this is `WHEN-TO-USE` + the scorecard in action.
- **Reject the client's "edtech animations" ask** — politely, with reasoning: the audience is anxious parents on mid-range Android in admission season; **speed + trust + proof + a one-tap enquiry convert here, motion does not.** Heavy animation would *slow* the funnel and *erode* credibility (flashy reads as "all marketing, weak results"). This is a **hard override**: conversion-critical funnel → speed wins.
- **The big-edtech sites they're copying optimise for a different game** (brand/VC, huge budgets, app installs) — mimicking their motion on a coaching site imports the cost without the benefit.
- **Where craft DOES earn a place:** the results section — a restrained count-up / staggered reveal of ranks makes the *proof* feel alive. One memorable moment, on the thing that actually sells. (Essential + accent, not Signature-everywhere.)

## 6. Rough perf budget
- **Mobile-first, low-end Android, admission-season traffic spikes.** LCP green is non-negotiable (it's the funnel). Near-zero JS motion; the one results animation is transform/opacity-only + reduced-motion aware. No hero video. Static-fast everywhere.

## 7. Open questions to take back (the real value-add)
1. Which **specific results** can you show **with student consent**? (the entire trust case rests on this — and we never invent ranks.)
2. **Lead routing:** form/WhatsApp → which inbox/CRM, who calls back, how fast? (the site's success metric lives *after* the click.)
3. Counsellor **WhatsApp number** verified (wa.me digits ≠ display format)?
4. Hostel: same campus / separate / photos available?
5. Hindi content — who translates, or English-first launch?
6. Admission-season **traffic spike** size (sets caching/perf headroom)?

## 8. The brief (ready to feed doc-gen-master)
> A fast, trust-forward **admissions site** for a 12-year Kota JEE/NEET institute, built mobile-first for anxious parents + students on low-end Android. The whole site drives **one action — an admission enquiry** (sticky call/WhatsApp + a spam-protected form routed to counsellors). Lead with **verified results/toppers** (with consent) and real faculty credibility; courses, faculty, hostel as clear scannable pages; Hindi + English. **Essential tier** for speed and credibility, with a **single tasteful results-reveal** as the one premium accent. No hero video, no decorative animation — they'd slow the funnel this audience converts on.

---

## PROOF — with vs without the discovery process
*Same raw input, two outputs.*

**WITHOUT (free-handed, what the client asked for):**
> "Build a modern, premium coaching website — hero **video**, animated stats, about, courses, faculty, results, gallery, contact form. Add **scroll animations** to feel like the big edtech sites." → tier-blind, chases the flashy ask, no audience reasoning, no conversion focus, no perf budget, no "which results are verifiable" guardrail. Plausible — and wrong for the goal.

**WITH (the process):** the **opposite tier verdict, with a reason** — Essential + one accent; an explicit **override** (conversion funnel → speed); the conversion core named (enquiry → counsellor); the trust guardrail (verified results, never fabricate); a mobile-Android perf budget; and 6 sharp client questions the free-handed version never asks.

**The decider:** the with-process output is not just "more detailed" — it reaches a **materially different and better decision** (resist the animation, optimise the funnel) and protects the client from their own flashy instinct. That's a skill changing the outcome, not narrating the obvious.

## META — notes for the skill
- **The headline pattern: the brief's loudest ask can be the thing to refuse.** The skill must weigh asks against the **goal + audience + funnel**, and be willing to *down-tier with a reason* — and give the builder the **words to say no to the client**. Restraint-with-rationale is a first-class output, not an afterthought.
- **`Audience → device → perf` as an early forced question generalised cleanly** from Hinglaj (Flagship) to here (Essential) — opposite tiers, **same forcing question, opposite answer.** Strong signal the question belongs in the skill core.
- **The feature→capability→tier→perf table is again the core artifact** (matches Hinglaj's META) — now proven to discriminate at *both* ends. The "one accent on the thing that sells" move (results reveal) is a reusable Essential pattern.
- **New required guardrail surfaced:** "which claims/results are **verifiable with consent**" — the never-fabricate rail, as a discovery question. (Hinglaj had the image-rights version of this; generalise to "evidence/consent for every trust claim.")
- **Hard-override list is forming** (conversion-critical · low-end/a11y audience · content-they-came-to-do) → matches `WHEN-TO-USE`; lift verbatim into the skill.
- Gap: this is a *constructed* brief. Proof bar #2/#3 (round-trip: brief → build → shipped matches; tier calls survive) still need a **real build**. This run proves #1 (cross-tier generalisation) + #6 (with/without). Two tiers down (Flagship ✓, Essential ✓); a **Signature** real-client run is the third.
