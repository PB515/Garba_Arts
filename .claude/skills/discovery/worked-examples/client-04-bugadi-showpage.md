# Worked example — Bugadi showpage (the Signature-CRAFT example; round-trip)

*Discovery run reverse-validated against a real build (`Desktop/bugadi-showpage`). This is the **missing Signature-CRAFT example** — it completes proof-bar #1 across all three craft tiers — and a **second round-trip** (now at the Signature tier). **Status: round-trip proof.***

**Date:** 2026-06-21 · **Verdict: craft tier = SIGNATURE (+ a Flagship 3D accent) · surface = brand/lookbook**

---

## 0. Why this one matters
- Fills the gap from client-03: a **true Signature-CRAFT** build (GSAP pinned scroll-story + micro-interactions), not capability-heavy/craft-light.
- **Second round-trip** — discovery's predicted Signature+accent vs the shipped craft → match.
- Surfaces the next refinement: **tier is assigned per SURFACE, not per brand** (the same brand is Essential on its store and Signature on its lookbook).

## 1. Raw input (the brand/showpage idea)
> Bugadi — an Indian oxidised-jewellery brand (Instagram-led) — wants a **showpage/lookbook**: a cinematic brand surface that shows the pieces and the *Wearable Heritage* story, to feel premium and not-templated. (The real **store** — catalog/cart/checkout — already exists separately and is conversion-critical.)

## 2. Forced early questions → answers
- **Audience → device?** India, **mobile-first, mixed devices**, Instagram referral traffic.
- **The one action = success?** Feel the brand + tap through to Instagram / the store — *not* a checkout on this surface.
- **Goal vs ask?** The goal is **perceived premium / differentiation** — feeling *is* the product here. So craft earns its keep (unlike the coaching funnel in client-02).
- **Verifiable claims?** Real pieces/photos from the brand; heritage copy is brand-owned. No fabricated claims.

## 3. Feature → capability → tier → perf
| Feature | IDP capability | **Craft tier** | Perf / effort |
|---|---|---|---|
| Hero + editorial lookbook | marketing/brand (golden-path: portfolio-ish) | **Essential base** | Lenis smooth scroll + reveal-on-scroll |
| "Wearable Heritage" story | content (storytelling) | **Signature** | GSAP **pinned scroll-story** (Motif→Region→Occasion scrub) |
| Selected pieces / cards | content-model | **Signature** | card-hover micro-interactions; magnetic CTA |
| "The piece, in the round" | — | **Flagship accent** | R3F 3D, drag-to-rotate — one moment, not the whole site |
| Packages page (`/tiers`) | marketing | **Essential** | sells the tiers themselves |

## 4. Tier verdict (scorecard + the per-surface split)
Scorecard: budget moderate (1) · sells on **feeling/heritage (2)** · "wow" **helps (1)** · audience **mixed mobile (1)** · **experience-forward showpage (2)** = **7 → Signature.** Plus a **Flagship accent** (the 3D piece) only where it doesn't tax a funnel.

**The override that defines this case:** the **store** surface is conversion-critical → **Essential** on commerce pages. The **brand/lookbook** surface is feeling-led → **Signature + accent**. **Same brand, different tier per surface.** That split is exactly why the showpage (craft) is built separately from the store (commerce).

## 5. ROUND-TRIP — discovery's verdict vs what shipped
| Discovery predicted | bugadi-showpage actually shipped | Match? |
|---|---|---|
| Signature centerpiece = pinned scroll-story | `HeritageStory.tsx` (GSAP pinned, scrub) | ✅ |
| Micro-interactions | `MagneticButton.tsx` + card-hover | ✅ |
| Essential base | `SmoothScroll.tsx` (Lenis) + `Reveal.tsx` | ✅ |
| One Flagship accent, not everywhere | R3F 3D piece (`three` + `@react-three/fiber`) | ✅ |
| Degrades for reduced-motion / no-JS | `StaticHeritage.tsx` fallback for the scroll-story | ✅ |
| Sells the tiers | `/tiers` packages page; `?tier=` switch | ✅ |

Discovery's Signature+accent verdict reproduces the real build on every row — a **second round-trip**, at the Signature tier.

## 6. The refinement — tier is per SURFACE, not per brand
The same brand (Bugadi) is **Essential on its store** (conversion funnel → speed) and **Signature on its lookbook** (feeling → craft). So the discovery output must allow **different tiers per surface/route**, and apply the hard-overrides **per surface** (a commerce page inside an otherwise-Signature site still drops to Essential). This is the per-section tiering the site map already supports, now stated as a rule. → fold into SKILL.md.

## META — notes for the skill
- **Tier per surface, not per brand/site** — the headline refinement (mirrors client-01's mixed-tier site map: Flagship home + Essential reader). Generalize: assign tier per route, overrides applied per route.
- **A Flagship *accent* is a real option** — one 3D/shader moment on an otherwise-Signature site, placed where it doesn't tax a funnel. The skill should offer "tier + optional accent," not just a single tier.
- **Cross-tier proof now complete:** Flagship (Hinglaj) · Essential (coaching) · capability-heavy/craft-Essential (Inspire) · **Signature (this)** — all three craft tiers + the capability axis covered, with **two real round-trips** (Inspire, Bugadi-showpage).
- The `StaticHeritage` fallback is the verification-matrix discipline showing up in code — the skill should always pair a Signature/Flagship craft call with its required degraded path.
