# cinematic-scroll-saga · v1

A chapter as **one pinned, two-column stage**: a 2.5D scene-reel that flows into a guided
map tour and closes on a photo. Text lives in a left panel; the right frame is artwork only.
Hard-swapped beats (one mounted at a time → no cross-fade, nothing overlaps). Weighted-timeline pacing.

> Harvested & proven on **Hingulapuran** (the Fall-of-Sati chapter). `status: proven`.

## Files
- `CinematicScrollSaga.tsx` — the generic component (self-contained; imports `./timeline`).
- `timeline.ts` — weighted-timeline pacing util (also generally reusable).
- `example.config.ts` — the Hinglaj config, as a usage reference.

## Install
1. Copy `CinematicScrollSaga.tsx` + `timeline.ts` into the site's `components/` (or `lib/`).
2. Dep: **`motion`** (`motion/react`). No other runtime deps.
3. Theme tokens the element reads (the site must define them — they come from the IDP token layer):
   `bg-raat` / `text-patra` / `text-swarna` / `text-muted` / `border-swarna`, and CSS vars
   `--font-display` / `--font-display-latin` / `--font-body` / `--radius`. Marker colours are props (not tokens).

## Use
```tsx
import { CinematicScrollSaga } from "@/components/CinematicScrollSaga";
import { myChapter } from "@/lib/my-chapter"; // a CinematicSagaConfig
export function MyChapter() { return <CinematicScrollSaga {...myChapter} />; }
```

## Config (`CinematicSagaConfig`)
| field | type | notes |
|---|---|---|
| `scenes` | `SagaScene[]` | each = `{ far, subject, near, deva, en, subjectScale?, nearScale?, nearAlign?, overlay? }`; layers are `{ d, m }` (desktop/mobile image URLs) |
| `mapImage` | `string` | the painted map shown during the beats |
| `beats` | `SagaBeat[]` | `{ deva, en, body, all?, x?, y?, hinglaj? }`; `all:true` = the overview beat that lights the scattered `peethas`; `x/y` (percent) = a focus marker; `hinglaj:true` = the white beacon |
| `peethas?` | `{x,y}[]` | scattered markers (percent) lit on the overview beat |
| `finalePhoto?` | `string \| null` | if set, closes on this photo (held, no fade) |
| `finaleText?` | `{deva,en,body}` | left-panel text for the finale |
| pacing | `sceneWeights?`, `sceneWeight?`, `beatWeight?`, `finaleWeight?`, `vhPerUnit?` | per-beat scroll length + overall density |
| markers | `markerColor?`, `beaconCore?`, `beaconGlow?`, `beaconHalo?` | 6-digit hex; defaults = vermilion + white/gold beacon |

## Asset slots
`scenes[].far/subject/near` (2.5D layers — far = opaque backdrop, subject/near = cut-outs on transparent), `mapImage`, `finalePhoto`.

## Build discipline (when adapting / debugging)
Static → pacing → motion → polish, verify each. Debug by **subtraction**. "No visible effect" = a
pipeline bug (stale dev server/cache), not the code. The map is a plain `<img>` on purpose — never
wrap it in a scroll-driven opacity layer (that was the v1 bug that cost a day).
