# custom-cursor · v1

A branded cursor: an accent dot follows precisely, a ring trails with a lerp and grows on
interactive hover (`a, button, [data-cursor]`). Fine-pointer only — does nothing on touch/no-JS
(native cursor stays). Reduced-motion → ring tracks instantly (no trail).

> Proven in production (desi-maximalism / the Showcase). `status: proven`.

## Install
1. Copy `CustomCursor.tsx` into `components/` and import `cursor.css` into the site (global stylesheet).
2. No JS deps (pure DOM + rAF).
3. Mount once near the root: `<CustomCursor />`.
4. Colours: override `--cursor-dot` / `--cursor-ring` / `--cursor-accent` (CSS vars; else the fallbacks).

## Use
```tsx
import { CustomCursor } from "@/components/CustomCursor";
// once in the layout:
<CustomCursor />
```
```css
/* globals.css */
:root { --cursor-dot: #e5452e; --cursor-ring: #c9a227; --cursor-accent: #c0356b; }
@import "./cursor.css"; /* or paste cursor.css in */
```

## Notes
Hides the native cursor (`body { cursor: none }`) only on `(hover:hover) and (pointer:fine)`.
Add `data-cursor` to any element to trigger the hover-grow state.
