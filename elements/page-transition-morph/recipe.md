# page-transition-morph · v1

Two complementary navigation pieces:
1. **`MorphGallery`** — a tile grid where clicking a tile **morphs its cover** (Motion `layoutId`)
   into a full-screen detail card, and closing morphs it back. Reduced-motion → instant.
2. **`PageWipe`** — a per-route **wipe transition** (a panel retracts upward + an accent bar),
   dropped inside `app/template.tsx` so it plays on every navigation.

> Harvested & proven on **photographer-portfolio** (brutalist work gallery; build-verified). `status: proven`.

## Files
- `MorphGallery.tsx` — the shared-element gallery (self-contained; `motion`).
- `PageWipe.tsx` — the route wipe (self-contained; `motion`).
- `example.usage.tsx` — wiring the gallery to a data source.

## Install
1. Copy `MorphGallery.tsx` + `PageWipe.tsx` into `components/`.
2. Dep: **`motion`** (`motion/react`).
3. Theme tokens the gallery reads: `bg-paper-2`, `bg-ink`, `text-paper`, `text-accent`, `text-muted`,
   `border-line` + `--font-display` / `--font-body` / `--font-mono`. PageWipe colours are class props.

## Use
```tsx
// the gallery
import { MorphGallery, type GalleryItem } from "@/components/MorphGallery";
const items: GalleryItem[] = data.map((d) => ({ id: d.slug, src: d.cover, title: d.title, eyebrow: d.n, meta: `${d.cat} · ${d.year}`, blurb: d.blurb }));
<MorphGallery items={items} detailHref={(it) => `/work/${it.id}`} />

// the route wipe — app/template.tsx (Next App Router re-mounts this per navigation)
"use client";
import { PageWipe } from "@/components/PageWipe";
export default function Template({ children }: { children: React.ReactNode }) {
  return (<><PageWipe panelClassName="bg-ink" barClassName="bg-accent" />{children}</>);
}
```

## Config
**MorphGallery** — `items: GalleryItem[]` (`{ id, src, title, eyebrow?, meta?, blurb? }`), `detailHref?: (item) => string` (shows an "Open full page →" deep link if given).
**PageWipe** — `panelClassName` (default `bg-ink`), `barClassName` (default `bg-accent`).

## Notes
- The morph relies on stable `layoutId={`card-${id}`}` between the tile and the detail card — keep ids unique.
- `PageWipe` must live in **`template.tsx`** (not `layout.tsx`) — only `template` re-mounts per route.
- Keep the `/work/[slug]` (or equivalent) routes for deep links / SEO; the morph is progressive enhancement.
