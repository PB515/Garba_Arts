# kinetic-typography · v1 (`SplitText`)

Splits a line into **chars or words** and reveals them staggered (rise + slight rotate) when
scrolled into view. Accessible: the whole string is announced via `aria-label`; the split units
are `aria-hidden`. Reduced-motion → plain text.

> Proven in production (desi-maximalism / the Showcase). `status: proven`.

## Install
1. Copy `SplitText.tsx` into `components/`.
2. Dep: **`motion`** (`motion/react`).

## Use
```tsx
import { SplitText } from "@/components/SplitText";

<h1 className="text-7xl font-black">
  <SplitText text="MARIGOLD" by="char" stagger={0.04} />
</h1>
<SplitText text="a quieter subhead" by="word" y={24} delay={0.2} />
```

## Props
| prop | default | notes |
|---|---|---|
| `text` | — | the string to animate |
| `by` | `"char"` | `"char"` (with rotate) or `"word"` |
| `stagger` | `0.03` | seconds between units |
| `delay` | `0` | start delay |
| `y` | `44` | rise distance (px) |
| `className` | — | applied to the wrapping inline span |

Fires once on enter (`viewport once`). Style the wrapping `<span>` (inline-block) via `className`.
