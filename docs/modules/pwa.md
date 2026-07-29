# Module — PWA (Tier-2 #8)

*Make the site installable + offline-capable. Rebuilt ad-hoc on Inspire and Patel CA; this is the one-pass setup. Authored from current Next.js App Router practice (the original `pwa-setup-nextjs.md` was not in the inputs).*

## What ships

| File | Role |
|---|---|
| `app/manifest.ts` | Generates `/manifest.webmanifest` from `lib/site.ts` (name, description, icons). |
| `public/sw.js` | Minimal service worker — offline app-shell cache. |
| `lib/pwa/register-sw.tsx` | `<RegisterSW />` client component that registers the worker. |

## Enable it (3 steps)

1. **Render the registrar** — add `<RegisterSW />` inside `<body>` in `app/layout.tsx`:
   ```tsx
   import { RegisterSW } from '@/lib/pwa/register-sw';
   // …
   <body>{children}<RegisterSW /></body>
   ```
2. **Add icons** to `public/icons/` — `icon-192.png`, `icon-512.png`, `maskable-512.png` (use the image-gen prompt or a favicon generator).
3. **Set the colours** in `app/manifest.ts` (`background_color`, `theme_color`) to your brand tokens.

## Checks before launch

```
[ ] manifest loads at /manifest.webmanifest with real name + icons
[ ] installable (Chrome → Install app) — no manifest/icon console warnings
[ ] offline: load once, go offline, reload → the shell still renders
[ ] bump CACHE in sw.js on deploys that must invalidate cached assets
```

Keep it minimal. Reach for `next-pwa`/Workbox only when you need precaching of many routes or background sync — most sites don't.
