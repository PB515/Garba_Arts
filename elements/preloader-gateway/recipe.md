# preloader-gateway · v1

A cinematic entry: two **door leaves part on scroll** to reveal a backdrop scene + title
behind them. Layered-PNG parallax (no WebGL — cheap everywhere); degrades to "doors already
open" for reduced-motion / no-JS.

> Harvested & proven on **Hingulapuran** (the temple-door hero). `status: proven`.

## Files
- `PreloaderGateway.tsx` — the generic component (self-contained; only `react` + `motion`).
- `example.config.ts` — the Hinglaj art/copy, as a usage reference.

## Install
1. Copy `PreloaderGateway.tsx` into the site's `components/`.
2. Dep: **`motion`** (`motion/react`).
3. Theme tokens it reads: `bg-raat`, `bg-rakta`, `text-patra`, `text-swarna` + CSS vars
   `--font-display` / `--font-display-latin`.

## Use
```tsx
import { PreloaderGateway } from "@/components/PreloaderGateway";

export function Hero() {
  return (
    <PreloaderGateway
      backdrop={{ d: "/art/hero-wide.webp", m: "/art/hero-tall.webp" }}
      leaf={{ d: "/art/door-wide.webp", m: "/art/door-tall.webp" }}
      toran="/art/festoon.webp"           // optional foreground
      title="हिंगलाज माता"
      subtitle="…a mantra / tagline…"
      scrollCue="scroll to enter"
      openAt={0.4}                         // doors finish opening at 40% scroll
      heightVh={450}
    />
  );
}
```

## Config (`GatewayConfig`)
| field | type | notes |
|---|---|---|
| `backdrop` | `{d,m}` | revealed scene — desktop wide (object-cover) / mobile tall |
| `leaf` | `{d,m}` | door leaf — desktop wide (object-cover) / mobile tall (object-contain); right leaf is auto-mirrored |
| `toran?` | `string` | optional foreground festoon (tiled 3× desktop / single mobile) |
| `title` | `string` | big heading behind the doors |
| `subtitle?` | `string` | second line (mantra/tagline) |
| `backdropAlt?` | `string` | alt text for the backdrop |
| `scrollCue?` | `string` | bottom hint (default "scroll to enter") |
| `heightVh?` | `number` | scroll depth (default 450) |
| `openAt?` | `number` | fraction where doors finish opening (default 0.4) |

## Asset slots
`backdrop.{d,m}` (the revealed scene), `leaf.{d,m}` (the door — one art, mirrored for the right), `toran?` (festoon).

## Build / tuning notes
The title + scrim are **static behind the doors** — revealed by the leaves sliding away, NOT by a
scroll-driven opacity (that was getting stuck at 0; see [[scroll-section-build-method]]). To tune
`openAt`, temporarily log `scrollYProgress` and scroll to where you want the doors fully open.
