# microinteractions · v1

Small, memorable hover moments. v1 ships **`MagneticButton`** — the button (and its label, at
half strength for parallax) eases toward the cursor while hovered, then springs back on leave.
Transform-only (GPU-composited). Reduced-motion → a plain button. Keyboard-reachable (a real `<a>`).

> Proven in production (bugadi-showpage / the Showcase). `status: proven`.

## Install
1. Copy `MagneticButton.tsx` into `components/`.
2. Dep: **`motion`** (only `useReducedMotion`).

## Use
```tsx
import { MagneticButton } from "@/components/MagneticButton";

<MagneticButton href="/contact" strength={0.35} className="rounded-full bg-accent px-8 py-3">
  Get in touch
</MagneticButton>
```

## Props
| prop | default | notes |
|---|---|---|
| `href` | — | it's a real anchor (keyboard/focus safe) |
| `children` | — | label |
| `strength` | `0.35` | magnet pull factor (label parallaxes at 0.4×) |
| `className` | `""` | applied to the anchor |

## Notes
Overlaps the `motion` skill's named pieces — this is the *interactive* (cursor-driven) cousin.
Add sibling micro-pieces (hover-depth cards, tilt) as `microinteractions` grows.
