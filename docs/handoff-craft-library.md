# Handoff — the craft elements library is built (2026-06-20)

> Paste-in briefing for a fresh IDP session. TL;DR: the **15% craft layer** of the IDP product is
> now a **runnable, proven component library**, merged to `main` and documented. Nothing's open.

## What changed
The craft layer used to be theory-only (`craft-lab/recipes/*`). It now has a **runnable half**: a
registry of proven, parameterized components you drop into a site — [`elements/`](../elements/).

**12 elements, all `proven`** (each generalized from a real shipped site, dogfooded, then frozen;
the 3D/GLSL/routing ones build-verified in their source repos):

| element | what it is |
|---|---|
| `cinematic-scroll-saga` | pinned 2.5D reel → guided map tour → photo finale |
| `preloader-gateway` | doors part on scroll to reveal a title |
| `horizontal-scroll` | pinned sideways panel scroll |
| `r3f-3d-hero` | React-Three-Fiber neural core (icosahedron + rings + particles) |
| `material-shader` | animated oxidised-metal band (GLSL) behind content |
| `hover-image-distortion` | SVG ripple-on-hover image (no WebGL) |
| `page-transition-morph` | `layoutId` tile→fullscreen morph + per-route wipe |
| `kinetic-typography` | `SplitText` char/word stagger reveal |
| `reveal` | reveal-on-scroll wrapper |
| `custom-cursor` | dot + trailing ring, hover-grow |
| `smooth-scroll` | Lenis provider |
| `microinteractions` | `MagneticButton` |

## Where it lives (read these first)
- **[`elements/README.md`](../elements/README.md)** — the contract (what makes an element library-grade).
- **[`elements/registry.json`](../elements/registry.json)** — the catalogue (name, status, files, deps, config).
- **[`elements/ADD-ELEMENT.md`](../elements/ADD-ELEMENT.md)** — the consumption playbook (the deterministic
  steps for *"add `<name>` with these images"*).
- **[`docs/craft-layer.md`](craft-layer.md)** — how it slots into the IDP product (80% backend / 15% craft / 5% brief).
- `elements/<name>/` — each element's component(s) + `recipe.md` + `example`.

## How to use it in a build
When a brief calls for a premium moment, run the ADD-ELEMENT playbook: resolve in registry → copy
files → install deps → ensure theme tokens → wire data + assets → mount → **build & verify**. Brand
specifics (colours/palette) are **props**; structure reads the site's token layer, so a brick re-skins per client.

**It is NOT a fourth skill** (Charter §8 — most gaps want a pattern, not a skill). It's a
pattern + registry, consumed by the `frontend-design` / `motion` skills and the build agent.

## The build discipline (carry this forward)
One layer at a time, verify each — **never all at once**: **static → pacing → motion → polish.**
Debug by **subtraction**. **"My edit had no visible effect" = a pipeline bug** (stale dev server /
cache → fresh port + hard reload), not the code. (Cost a day on `cinematic-scroll-saga`; now encoded in every recipe.)

## State of the repos
- **IDP (PB515/IDP) `main`** — library + docs merged. ✅
- **command-center (PB515/Display) `main`** — `r3f-3d-hero` generalization merged. ✅
- **Hingulapuran (PB515/Hingulapuran) `main`** — refactored to consume 3 of the elements (live proof). ✅
- bugadi / desi / photographer — not their own git repos (Showcase mono); build-verified locally.

## What's next (open IDP fronts — NOT started)
1. **Step-0 discovery/ideation skill** — turn a fuzzy client idea → a tier-tagged buildable brief
   (the IDP's missing front door; dogfood it on the real Hinglaj client).
2. **Grow element versions on demand** — e.g. `material-shader` v2 = the aura refraction/bloom variant —
   only when a real site needs it (new behaviour = new version, never edit v1).
3. **Consolidate the 3 fragmented IDP frontend skills** into one once the library proves out in builds.
