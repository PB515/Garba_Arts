---
name: motion
description: Add tasteful entrance motion and micro-interactions to a site using a small set of named pieces (pop-in, reveal-on-scroll, bounce). Use when building or polishing UI that should feel alive without becoming janky or inaccessible. Honors reduced-motion, keeps content visible without JS, and watches mobile performance.
---

*Reconstructed from the toolkit's backlog entry 9 (the validated CA-build motion experiment) and the `frontend-design` skill's motion guidance, because the original `motion/` skill file was missing from the inputs. Faithful to the documented spec — replace with the original if you have it.*

Motion lifts perceived quality only if it doesn't cost stability. Add it via a small set of **named pieces**, not ad-hoc inline animation, and hold the three checks below — they matter more here because this is JS-driven.

## The pieces (keep the set small)

- **pop-in** — element scales/fades in on mount. For hero elements, cards, key CTAs.
- **reveal-on-scroll** — fades/slides in as it enters the viewport. For sections down the page. Stagger siblings with a small delay for a considered feel.
- **bounce** — a subtle spring on a deliberate interaction (a confirm, an add-to-cart). Use sparingly — one or two per page.

One well-orchestrated page-load with staggered reveals beats scattered micro-interactions. Reach for high-impact moments, not motion everywhere.

## Library

Use **Motion** (the Framer Motion successor, `motion/react`) when the project is React/Next — it's already the `frontend-design` skill's default and a sanctioned exception to the no-extra-dependency rail (decide it deliberately; don't pile on more). For plain HTML, prefer CSS-only (`@keyframes` + `animation-delay`).

Tone comes from the Business Brief's Voice & Tone and doc 04 — a luxury brand moves slowly and precisely; a playful one springs. Match the motion to the brand.

## The three mandatory checks (non-negotiable)

1. **No-JS / slow-JS content visibility.** Motion libraries render hidden initial states (opacity 0) and need JS to reveal them. Throttle or disable JS and confirm content — especially the hero — still shows. Never ship a page that's blank without JS. (Same failure class as an endless "Loading…".)
2. **Reduced-motion, wired explicitly.** Honor `prefers-reduced-motion` — the library does NOT do it automatically. Wrap the app in `<MotionConfig reducedMotion="user">` and/or branch on `useReducedMotion()` to drop transforms. A reduced-motion user should get instant, static content.
3. **Mobile Lighthouse.** JS-driven motion adds weight. Re-run PageSpeed/Lighthouse on mobile after adding it and confirm performance didn't regress.

## QA gate (add to the phase gate)

`[ ] named pieces only (no ad-hoc inline animation)  ·  [ ] reduced-motion honored  ·  [ ] content visible with JS blocked  ·  [ ] mobile Lighthouse not regressed`
