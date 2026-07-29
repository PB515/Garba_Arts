# Worked example — Attar house (LIVE EVAL of the skill, not a hand-run)

*This run was produced by **invoking the `discovery` skill via the Skill tool** on a brief it had never seen — the trigger/execution eval (proof-bar #4), not me hand-running the process. Chosen deliberately as an **expressive luxury** brief to test the **up-tier** direction the five prior examples never exercised (all Essential/credible + one Flagship-devotional).*

**Date:** 2026-06-22 · **Verdict: capability = ecommerce (small) · craft = SIGNATURE site + FLAGSHIP home accent + ESSENTIAL checkout (per-surface)**

---

## 1. Raw input (verbatim)
> A boutique perfume house in Jaipur — small-batch artisanal attars rooted in Rajasthani ittar tradition, positioned luxury/modern. Wants a website that "feels like the fragrance" — immersive, sensory, premium. Sells a handful of signature scents online (small catalogue + checkout). The founder's story and the craft ritual matter a lot. Audience: affluent urban Indians + NRIs, mostly newer phones + desktop. Budget is generous; they explicitly want it to wow.

## 2. Forced early questions → answers (assumed; flagged)
- **Audience → device → network?** Affluent urban Indians + NRIs; modern phones + desktop; mostly good networks but NRIs vary → **modern, but still need a degraded path.**
- **One action = success?** **Buy a signature scent** (real commerce — small catalogue + checkout). The founder story drives desire → the purchase.
- **Verifiable?** Real founder story, craft ritual, scents. Don't fabricate awards/press.
- **Goal vs ask?** Goal = sell luxury fragrance + build brand. Ask = "immersive/wow." **Here the wow *serves* the goal** (luxury fragrance sells on desire) — so the ask is aligned, *unlike* coaching where wow fought the funnel.

## 3. Specialized research
Attar / ittar = traditional oil-based perfumery; treat the Rajasthani heritage with respect (real tradition, not costume). Minor decision impact vs Hinglaj, but the craft-ritual story must be authentic.

## 4. Feature → capability → tier (per surface)
| Surface | IDP capability | Craft tier | Perf / effort |
|---|---|---|---|
| `/` brand immersion | marketing/landing | **Flagship *accent*** | one sensory 3D/shader "scent" moment; lazy; degrades to a still hero |
| `/story` founder + craft ritual | content | **Signature** | GSAP scroll-story (distill → bottle) |
| `/scents` catalogue | ecommerce | **Signature** | rich reveals / hover |
| `/scents/[slug]` product | ecommerce | **Signature (restrained)** | sell + inform; readable |
| `/cart` · `/checkout` | ecommerce · payments (Razorpay) · GST | **Essential** ← override | conversion funnel: fast, no flourish |
| `/about` · `/contact` | marketing | **Essential** | — |

Capability = small ecommerce; craft = Signature with a Flagship home accent.

## 5. Tier verdict (scorecard + per-surface overrides)
Scorecard: budget 2 · expressive identity 2 · **wow is the point 2** · modern 2 · experience-is-content 2 = **10 → Flagship.**
But **per surface:** Flagship *accent* on home only · Signature on story/catalogue/product · **Essential on cart/checkout (conversion-critical override).** Not a blanket Flagship — a Signature site with one Flagship moment and a fast funnel.

## 6. Site map (tier per section)
`/` Flagship-accent · `/story` Signature · `/scents` Signature · `/scents/[slug]` Signature-restrained · `/cart`+`/checkout` Essential · `/about`+`/contact` Essential.

## 7. Perf budget
Modern audience + generous budget afford the Flagship home — but: the 3D/shader moment **lazy + IntersectionObserver-mounted + degrade to a still hero** (weak device / no-WebGL / reduced-motion / NRIs on poor networks); **checkout near-zero JS, LCP green** (it's the funnel); product LCP green. Real-phone + cold-load matrix before launch.

## 8. Open questions (the gold)
1. **Asset pipeline (schedule long-pole):** pro fragrance photography / bottle renders / craft-ritual video — have it or commission? Luxury lives/dies on imagery.
2. **International shipping (NRIs)** — reshapes checkout, tax, logistics. In scope for v1?
3. **GST rate for perfume** — confirm with their CA; Razorpay for payments.
4. **The "scent" hero** — abstract smoke/oil shader vs a 3D bottle? Art-direction lock before build.
5. Catalogue size now + growth; brand assets (logo/type/palette) or design from scratch.

## 9. Tightened brief
> A luxury small-batch **attar e-commerce** site. A **Flagship-accent** brand-immersion home (one sensory 3D/shader moment, degrading to a still hero), a **Signature** cinematic founder/craft-ritual scroll-story, a **Signature** scent catalogue + product pages, and an **Essential** (fast, conversion-first) cart/checkout with Razorpay + GST. Mobile-first with full degraded paths. The one action: **buy a signature scent.** Out (phase 2): large catalogue ops, subscriptions, AR try-on.

## META — eval notes
- **#4 execution half PROVEN:** invoked as a real skill on an unseen brief, it produced a correct, sophisticated output — and **tiered UP** (Flagship/Signature) for an expressive brand, the direction no prior example tested. The "wow" signal correctly read **2** here vs **0** for coaching (desire vs funnel) — the rubric discriminates on intent, not surface.
- **Per-surface tiering + Flagship-accent + conversion-override** all fired correctly from the written skill (not from me) — the client-04 refinement is load-bearing.
- **Still open for `proven`:** the *description-triggering* half of #4 (skill-creator evals: does it auto-fire on the right phrasing, not just when explicitly invoked) + a **forward** round-trip (Hinglaj build). This run was an explicit invocation, which proves execution, not auto-trigger.
