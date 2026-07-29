# horizontal-scroll · v1

A row of panels that scrolls **sideways while the section is pinned** (vertical scroll →
horizontal travel). Panel widths come from `aspect-ratio`, so the track width is deterministic
— no cold-load measurement bug. Reduced-motion → a vertical stack.

> Harvested & proven on **Hingulapuran** (the history-of-Hingul cloth). `status: proven`.

## Files
- `HorizontalScroll.tsx` — the generic component (self-contained; `react` + `motion`).
- `example.config.ts` — the Hingul panels/copy, as a usage reference.

## Install
1. Copy `HorizontalScroll.tsx` into the site's `components/`.
2. Dep: **`motion`** (`motion/react`).
3. Theme tokens: `bg-raat`, `bg-rakta`, `text-patra`, `text-swarna`, `text-muted`, `border-border`,
   `border-swarna` + CSS vars `--font-display` / `--font-display-latin` / `--font-body` / `--radius`.

## Use
```tsx
import { HorizontalScroll } from "@/components/HorizontalScroll";

export function History() {
  return (
    <HorizontalScroll
      panels={[
        { src: "/art/1.webp", cap: "The penance" },
        { src: "/art/2.webp", cap: "The conquest" },
      ]}
      kicker="The history"
      title="…heading…"
      scrollCue="scroll —"
      heightVh={900}                 // or omit → panels.length * 180
      clothTexture="/art/cloth.webp" // optional tiled bg
    />
  );
}
```

## Config (`HorizontalScrollConfig`)
| field | type | notes |
|---|---|---|
| `panels` | `{src,cap}[]` | each panel image + caption (numbered automatically) |
| `title?` / `kicker?` | `string` | pinned heading + eyebrow |
| `scrollCue?` | `string` | bottom hint (default "scroll") |
| `heightVh?` | `number` | scroll depth — longer = slower travel (default `panels.length * 180`) |
| `clothTexture?` | `string` | optional tiled background |
| `panelAspect?` | `string` | default `"8 / 3"` |
| `panelHeight?` | `string` | default `"60vh"` |

## Asset slots
`panels[].src` (each panel image). Optional `clothTexture` (tiled background).

## Notes
Track width is measured from `scrollWidth` in `useLayoutEffect` (deterministic because panel
widths come from aspect-ratio, not image load). Tune travel speed with `heightVh`, not magic offsets.
