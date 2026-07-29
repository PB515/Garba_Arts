# The craft layer (the 15%)

The IDP ships a site as **~80% backend factory + ~15% frontend craft + ~5% business brief**.
This doc is the entry point for that **15% craft layer** — the premium, hand-feel motion/3D/scroll
work that makes a site look bespoke instead of templated.

It has two halves:

| half | what | where |
|---|---|---|
| **Theory** | how a technique works (recipes) | `craft-lab/recipes/*` (the knowledge base) |
| **Runnable** | proven, parameterized components you drop in | [`elements/`](../elements/) ← **this is the new bit** |

## The elements library (`elements/`)

A registry of **proven, self-contained, data-driven** components. Each entry is a frozen brick:
a component (+ optional util) that reads the site's theme tokens and takes all content via props.

- **[`elements/README.md`](../elements/README.md)** — the contract (what makes an element library-grade) + status.
- **[`elements/registry.json`](../elements/registry.json)** — the catalogue (name, status, files, deps, config, recipe).
- **[`elements/ADD-ELEMENT.md`](../elements/ADD-ELEMENT.md)** — the consumption playbook the build agent follows.
- `elements/<name>/` — each element's files + `recipe.md` + `example`.

**Status: complete — 12 proven** (2026-06-19):
`cinematic-scroll-saga` · `preloader-gateway` · `horizontal-scroll` · `r3f-3d-hero` · `material-shader` ·
`hover-image-distortion` · `page-transition-morph` · `kinetic-typography` · `reveal` · `custom-cursor` ·
`smooth-scroll` · `microinteractions`.

> **Not a fourth skill** (Charter §8 — most gaps want a pattern, not a skill). The library is a
> **pattern + registry**, consumed by the `frontend-design` / `motion` skills and the build agent.

## How it's used in a build

When a brief calls for a premium moment, the build agent runs the **ADD-ELEMENT playbook**:

> *"add `cinematic-scroll-saga` to the Hingul chapter with these images"*
> → resolve in registry → copy files → install deps → ensure theme tokens → wire data + assets
> → mount → **build & verify**.

The element's brand-specific bits (marker colours, shader palette, etc.) are **props**; everything
structural reads the site's token layer. So the same brick re-skins per client.

## How elements get into the library (the harvest)

Each brick was **generalized → dogfooded on a real source site → frozen**:
1. Lift the shipped component, move its client-specific content to **props/data + a thin wrapper**.
2. **Build the source site** to prove the generalization didn't break it (the 3D/GLSL/routing ones were
   build-verified in their repos, not just typechecked).
3. Copy the canonical files into `elements/<name>/`, write the recipe, flip the registry to `proven`.

## The build discipline (hard-won)

One layer at a time, verify each — **never all at once**:
**static → pacing → motion → polish.** Debug by **subtraction** (strip to the simplest thing that
works, add back one layer). **"My edit had no visible effect" = a pipeline bug** (stale dev server /
cache → fresh port + hard reload), not the code. This is the lesson that cost a day on the
`cinematic-scroll-saga` map; it's encoded in every recipe.
