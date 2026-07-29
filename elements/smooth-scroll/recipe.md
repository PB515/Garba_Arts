# smooth-scroll · v1

Lenis smooth-scroll driven off the **GSAP ticker**, feeding `ScrollTrigger.update` so pinned/
scrubbed triggers stay in sync. Disabled under reduced-motion. Also smooth-scrolls `a[href^="#"]`
anchor links. The foundation many scroll elements assume.

> Proven in production (command-center-os / the Showcase). `status: proven`.

## Install
1. Copy `SmoothScroll.tsx` into the site's `components/`.
2. Deps: **`lenis`**, **`gsap`**.
3. Mount once near the root layout: `<SmoothScroll />` (renders `null`).

## Use
```tsx
// app/layout.tsx
import { SmoothScroll } from "@/components/SmoothScroll";
export default function RootLayout({ children }) {
  return (<html><body>{children}<SmoothScroll /></body></html>);
}
```

## Notes
- If the site doesn't use GSAP/ScrollTrigger, drop the ticker wiring and call `lenis.raf` from a
  plain `requestAnimationFrame` loop instead (lighter; no gsap dep).
- No props. Self-disables on `prefers-reduced-motion: reduce`.
