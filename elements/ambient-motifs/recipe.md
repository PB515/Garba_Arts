# ambient-motifs · v1

A field of sparse decorative motifs that fill a section's **empty gutters** (the dark negative
space around a pinned media frame or a centred block), so the emptiness reads as composed, not blank.
Each motif floats on its own **and** the whole field leans with the cursor (per-motif `depth` =
parallax). A motif pool is rotated per section via `offset` so adjacent sections never match.
Desktop only (phones stay clean), `aria-hidden`, reduced-motion safe.

> Proven in production (hingulapuran — Sati / Hingul / Brahmarandhra / Parashurama gutters). `status: proven`.
> Generalized from the math-glyph field (`FloatingMath`) on the Snehal-Soni tutoring site.

## Install
1. Copy `AmbientMotifs.tsx` into `components/`.
2. Dep: **`motion`** (`motion/react`).

## Use
Render as the **first child** of a positioned, `overflow-hidden` section, and lift the section's real
content to `relative z-10` (the field sits at `z-0`; a negative-z layer would hide behind the section
background). Give each section a different `offset` so neighbours don't repeat.

```tsx
import { AmbientMotifs } from "@/components/AmbientMotifs";

<section className="relative overflow-hidden bg-[#1a0f12] …">
  <AmbientMotifs offset={1} color="#C9A227" />
  <div className="relative z-10 …">{/* the real content */}</div>
</section>
```

Custom motif set (any inline SVG, drawn in a `0 0 100 100` viewBox, strokes only — they inherit
`currentColor` from the `color` prop):
```tsx
const star = <path d="M50 12 61 40 90 40 66 58 75 88 50 70 25 88 34 58 10 40 39 40Z" />;
<AmbientMotifs motifs={[star, …]} color="var(--brand-gold)" count={4} />
```

## Props
| prop | default | notes |
|---|---|---|
| `motifs` | devotional kalam set (rosette/sun/paisley/lotus/diya) | `ReactNode[]` — SVG children, `0 0 100 100` viewBox, stroke-only |
| `slots` | 6 gutter slots | placement/size/depth/opacity/float per motif (`MotifSlot[]`, also exported) |
| `offset` | `0` | per-section index; rotates which motif lands in each slot |
| `count` | `6` | how many slots to fill (≤ `slots.length`) |
| `color` | `#C9A227` | any CSS colour; becomes `currentColor` for the strokes |
| `shift` | `16` | max px the field leans toward/away from the cursor |

## Gotchas
- **z-order:** field is `z-0`; the section's content MUST be `relative z-10`, or the content paints
  under the motifs. (A `-z` layer renders behind the section background and disappears — the bug we hit.)
- **Stacking context:** the host section needs one (`position` + `z-index`, `transform`, `perspective`,
  or `position: sticky`) so `z-0` is scoped to it. Pinned `sticky` containers already qualify.
- **Mobile:** hidden below `md` by design; the two `tablet` slots show at `md`, the rest at `lg+`.
- **Tune:** strength = `op` per slot + `color` opacity; liveliness = `shift` + per-slot `depth`/`float`.
