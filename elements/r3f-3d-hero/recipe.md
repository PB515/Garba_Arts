# r3f-3d-hero · v1 (neural core)

A glowing wireframe **icosahedron inside two orbital rings** with a particle halo, optionally
parallaxing toward the cursor. React-Three-Fiber. Ships the **performance-safe wrapper**: lazy
`ssr:false`, `IntersectionObserver` mount (only spins up when near the viewport), and a CSS
static fallback on weak devices / reduced-motion. Colours are props.

> Harvested & proven on **command-center-os** (the 3D Feature core). `status: proven`.

## Files
- `Core3D.tsx` — the wrapper (mount this). Lazy-loads the scene, static fallback.
- `CoreScene.tsx` — the R3F scene (default export, dynamically imported — keeps three.js out of the main bundle).
- `core-config.ts` — `CoreColors` type + `DEFAULT_CORE_COLORS` (the cyan/violet defaults).

## Install
1. Copy all three files into `components/`.
2. Deps: **`three`**, **`@react-three/fiber`**, **`@react-three/drei`**, **`motion`**.
3. Give the parent a height — the canvas fills `h-full w-full`.

## Use
```tsx
import { Core3D } from "@/components/Core3D";

// default cyan/violet:
<div className="h-[70vh]"><Core3D pointerCam /></div>

// re-coloured to a site's brand (any subset; rest fall back to defaults):
<Core3D colors={{ core: "#c9a227", ringA: "#e7d7b8", ringB: "#b5302a", glow: "#5c0a22",
                  particles: "#c9a227", lightA: "#c9a227", lightB: "#b5302a" }} />
```

## Props
| prop | default | notes |
|---|---|---|
| `pointerCam` | `false` | rig parallaxes toward the mouse |
| `colors` | `DEFAULT_CORE_COLORS` | `Partial<CoreColors>` — `{ core, glow, ringA, ringB, particles, lightA, lightB }` (6-digit hex) |
| `particleCount` | `140` | halo density |

## Notes
- The **wrapper pattern is the important bit** — never mount a heavy R3F canvas eagerly/SSR. The
  `IntersectionObserver` + `dynamic(ssr:false)` + weak-device fallback keep it Lighthouse-safe.
- Geometry/animation are fixed in v1; only colours + particle count are exposed. Fork a `v2` for
  different geometry rather than editing v1.
- Static fallback colours are derived from `colors` (inline-styled), so it re-brands too.
