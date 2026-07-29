# Worked example — Bugadi showpage (the SIGNATURE-craft example · completes proof #1)

*Discovery run round-tripped against a real built artifact (`Desktop/bugadi-showpage`) — the craft-lab's one-brand-three-tiers demo. This is the **Signature-craft** example the proof bar was missing: a brand surface where cinematic craft is *correct*. **Status: round-trip proof — third craft tier locked.***

**Date:** 2026-06-22 · **Verdict: capability = ~none (brand surface, not commerce) · craft tier = SIGNATURE (+ optional Flagship accent)**

---

## 1. Raw input (reconstructed)
> Bugadi — an **oxidised-jewellery brand**, Instagram-led. Wants a **showpage / lookbook** that *feels* premium and heritage-rich — show the pieces and the craft story, drive to Instagram/contact. **The actual store (commerce) is a separate site;** this surface is pure brand.

## 2. Forced early questions → answers
- **Audience → device?** Aspirational shoppers from Instagram — India, **mobile-first, mixed devices.**
- **The one action = success?** Reach out / follow (Instagram, contact) — **not** a cart (commerce lives elsewhere).
- **Brand sells on?** **Feeling + heritage** — *expressive* identity (jewellery, ornament). Wow genuinely helps the goal here.
- **Verifiable?** Real pieces/photos; the heritage story is real craft narrative.

## 3. Feature → capability → tier → perf
| Feature | IDP capability | Craft tier | Perf / effort |
|---|---|---|---|
| Home / lookbook (hero → statement → selected pieces → collections → CTA) | marketing/landing | **Signature** | Lenis smooth-scroll + reveals; cinematic but fast |
| "Wearable Heritage" story | content (static) | **Signature** | **GSAP pinned scroll-story** (Motif → Region → Occasion scrub) |
| Pieces / collections | content | **Signature** | card hover micro-interactions |
| Instagram / contact CTA | link | **Signature accent** | **magnetic button** |
| "The piece, in the round" | content | **Flagship accent** | R3F 3D piece + oxidised-silver shader — *only* where it doesn't tax the funnel |

Note the **capability column is ~empty** — there's no commerce/portal/CMS here; the real store handles that. This surface is **almost pure craft.**

## 4. Tier verdict (scorecard)
Budget moderate (1) · brand sells on **feeling/heritage — expressive identity (2)** · **wow helps (1)** · India mobile, mixed devices (1) · **experience-forward showpage (2)** = **7 → Signature.** Plus a **Flagship accent** (the 3D piece / shader) on the experience surface only.

**The override that proves the split:** the *real store* is **conversion-critical → Essential** on commerce pages. Same brand, two surfaces, two tiers — which is exactly why the craft showpage is a separate artifact from the store. Mixed-tier discipline in action.

## 5. ROUND-TRIP — predicted vs built
| Discovery predicted | bugadi-showpage built | |
|---|---|---|
| Signature stack: smooth-scroll + GSAP scroll-story + micro-interactions | `lenis` + `gsap`/@gsap/react + `MagneticButton` + card hover + the pinned "Wearable Heritage" scroll-story | ✅ |
| Flagship *accent* only | R3F 3D piece + shader present, gated as an accent | ✅ |
| Brand-surface, not commerce | no cart/checkout; pure lookbook; store is separate | ✅ |
| Mobile-first, perf-gated | reduced-motion/no-JS/weak-device fallbacks per PERFORMANCE.md | ✅ |

Discovery's **Signature** verdict matches the built Signature tier exactly.

## 6. This completes proof #1 — all three craft tiers now have a real example
- **Essential:** coaching (client-02) · Inspire Academy (client-03) · Purven (client-04)
- **Signature:** **Bugadi showpage (this)** ✅
- **Flagship:** Hinglaj (client-01)

## META — notes for the skill
- **The two-axis bookend (with client-03):** Inspire Academy = **high capability / Essential craft**; Bugadi showpage = **~zero capability / Signature craft**. Opposite corners of the same two axes → the strongest possible proof that capability and craft tier are **independent**.
- **Expressive identity (jewellery, heritage) correctly scores 2** on the identity signal — the *other* side of the client-04 refinement (credible-builder scored 1). The split holds both ways.
- **Same brand → different tier per surface** (showpage Signature vs store Essential) — the discovery output must allow **per-surface tiers**, not one verdict per client. Already in SKILL.md (mixed-tier); this confirms it on a real artifact.
- Proof #1 (cross-tier generalisation) is now **complete** across Essential/Signature/Flagship with real examples. Remaining for `proven`: live trigger evals (#4) and a forward round-trip on a new build (the Hinglaj client).
