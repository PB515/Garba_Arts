# hover-image-distortion · v1 (`RippleImage`)

A liquid **ripple on hover** — an SVG `feTurbulence` + `feDisplacementMap` filter whose
displacement scale ramps up on pointer-enter and eases back (rAF). Works on any `<img>`,
GPU-composited, **no WebGL / no three.js**. Heavy-media safe (lazy + async-decode + `onError`
fallback). Touch / reduced-motion → plain image, no filter.

> Harvested & proven on **desi-maximalism** (folk-painting gallery; build-verified). `status: proven`.

## Files
- `RippleImage.tsx` — the component (self-contained; `react` only, no deps).

## Install
1. Copy `RippleImage.tsx` into `components/`. No JS deps.
2. Give the parent (or pass via `className`) a sized box — the `<img>` fills `h-full w-full object-cover`.

## Use
```tsx
import { RippleImage } from "@/components/RippleImage";

<RippleImage
  src="/art/piece.webp"
  fallback="/art/piece.jpg"
  alt="…"
  className="aspect-[4/5] rounded-xl"
  intensity={20}
/>
```

## Props
| prop | default | notes |
|---|---|---|
| `src` | — | image URL |
| `alt` | — | required |
| `fallback?` | — | swapped in on load error |
| `intensity` | `20` | peak displacement scale (ripple strength) |
| `className` | `""` | applied to the wrapper (set the aspect/size/radius/bg here) |

## Notes
Each instance gets a unique filter id (`useId`), so many on a page don't collide. Tune the look
via the `feTurbulence baseFrequency`/`numOctaves` in the SVG (fork a v2 for a very different filter).
