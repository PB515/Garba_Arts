# reveal · v1

Reveal-on-scroll wrapper: fades + rises its children once when they enter the viewport
(opacity + transform only). Reduced-motion → static render. The workhorse for entrance polish.

> Proven in production (every Showcase site). `status: proven`.

## Install
1. Copy `Reveal.tsx` into `components/`.
2. Dep: **`motion`** (`motion/react`).

## Use
```tsx
import { Reveal } from "@/components/Reveal";

<Reveal><h2>…</h2></Reveal>
<Reveal delay={0.1} y={32}><p>…</p></Reveal>
```

## Props
| prop | default | notes |
|---|---|---|
| `children` | — | content to reveal |
| `delay` | `0` | start delay (s) |
| `y` | `24` | rise distance (px) |
| `className` | — | applied to the wrapper |

Fires once (`viewport once`, `-12%` margin), expo ease. For staggered groups, give siblings
increasing `delay`.
