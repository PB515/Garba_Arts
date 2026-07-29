# add-element — the consumption playbook

How the build agent wires a **proven** element into a site, from an invocation like:

> *"add `cinematic-scroll-saga` to the Hingul chapter with these images"*
> *"add `horizontal-scroll` v1 with these 5 panels"*
> *"add `material-shader` behind the CTA, brand colours"*

This is a **pattern**, not a skill (Charter §8) — the `frontend-design` / `motion` skills and the
build agent follow it. Every step below is deterministic from `registry.json` + the element's `recipe.md`.

---

## 0 · Resolve
- Parse the ask → **name**, optional **version** (default = registry's), **target location**, **assets**.
- Look up `name` in [`registry.json`](registry.json).
  - `status: proven` → proceed.
  - `todo` → it's shipped on a source site but **not generalized yet**; offer to harvest it first (see README "harvest" + [[scroll-section-build-method]]).
  - `superseded`/`parked` → tell the user, suggest the replacement.
- Read the element's `recipe.md` (deps, theme tokens, config schema, asset slots) and its `example.*`.

## 1 · Copy the files
- Copy **every file** in `registry[name].files` into the site's `components/` (keep co-located relative
  imports like `./timeline`, `./core-config`, `./material-config`).
- Multi-file elements copy as a set: `r3f-3d-hero` (3 files), `material-shader` (3), `page-transition-morph` (2).
- Elements with a stylesheet (`custom-cursor` → `cursor.css`) — import the CSS into the site's globals.

## 2 · Install deps
- Add `registry[name].deps` (skip any already present). Heavy ones to flag:
  - `three` + `@react-three/fiber` (+ `@react-three/drei`) → `r3f-3d-hero`, `material-shader`
  - `lenis` + `gsap` → `smooth-scroll`
  - `motion` → most others; `custom-cursor` + `hover-image-distortion` have **no deps**.

## 3 · Theme tokens
- The element reads the site's theme tokens (listed in its recipe — e.g. `bg-raat`, `text-patra`,
  `--font-display`, `--radius`). Ensure the IDP token layer defines them for this site.
- **Brand colours that are element-specific are PROPS**, not tokens — pass the site's values
  (marker colours, `CoreColors`, `ShaderColors`, `PageWipe` classes, `--cursor-*`).

## 4 · Wire data + assets
- Copy the element's `example.*` to `lib/<name>.ts` (or inline), then **replace the example data with the
  real content**. Drop the user's images into `public/…` and point the config's **asset slots** at them.
- Art-layer elements need the art pipeline if the art arrives on a white background:
  - `cinematic-scroll-saga`: `scenes[].far` (opaque) + `subject`/`near` (cut-outs) → run `cutout.mjs` then `to-webp.mjs`.
  - `preloader-gateway`: `backdrop` + `leaf` (mirrored) + optional `toran`.

## 5 · Mount
- Render `<Element {...config} />` where asked.
- **Mount-once-near-root** elements: `smooth-scroll`, `custom-cursor`, and `PageWipe` (the last goes in
  `app/template.tsx`, **not** `layout.tsx` — only `template` re-mounts per route).

## 6 · Verify (build discipline)
- Build the site; if it renders in the browser, verify per the recipe's notes.
- **One layer at a time. Debug by subtraction. "No visible effect" = a pipeline bug** (stale dev server /
  cache → fresh port + hard reload), not the code. (See [[scroll-section-build-method]].)

## Versions
`add <name> v2` pulls the **frozen** v2 variant. A new behaviour is a **new version**, never an edit to v1.

---

## Quick map — what to ask for
| element | one line | key config |
|---|---|---|
| `cinematic-scroll-saga` | pinned reel → guided map → photo finale | `scenes[]`, `beats[]`, `mapImage`, `finalePhoto?` |
| `preloader-gateway` | doors part on scroll to reveal a title | `backdrop`, `leaf`, `title`, `toran?` |
| `horizontal-scroll` | pinned sideways panel scroll | `panels[]`, `title?`, `heightVh` |
| `r3f-3d-hero` | R3F neural core (icosahedron + rings + particles) | `colors`, `pointerCam`, `particleCount` |
| `material-shader` | animated oxidised-metal band behind content | `colors {a,b,accent}`, `veil` |
| `hover-image-distortion` | SVG ripple-on-hover image (no WebGL) | `src`, `intensity`, `fallback?` |
| `page-transition-morph` | tile→fullscreen `layoutId` morph + route wipe | `MorphGallery items[]` · `PageWipe` classes |
| `kinetic-typography` | char/word stagger reveal (`SplitText`) | `text`, `by`, `stagger` |
| `reveal` | reveal-on-scroll wrapper | `delay`, `y` |
| `custom-cursor` | dot + trailing ring, hover-grow | `--cursor-*` vars (+ `cursor.css`) |
| `smooth-scroll` | Lenis provider (mount once) | — |
| `microinteractions` | `MagneticButton` (eases to cursor) | `href`, `strength` |
| `ambient-motifs` | sparse motifs fill the gutters; float + cursor-parallax | `motifs[]`, `offset`, `color`, `count` |
