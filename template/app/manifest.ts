import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';

/**
 * PWA manifest (Tier-2 #8). Next serves this at /manifest.webmanifest from the
 * App Router metadata route. Add the icons to public/icons/ and set the colours
 * to your brand tokens before launch. See docs/modules/pwa.md.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.name,
    description: site.description,
    start_url: '/',
    display: 'standalone',
    // Matches globals.css's current --background/--accent values exactly -
    // both are still the loudly-marked PLACEHOLDER magenta palette (this
    // app has never had its own token pass). Update both together whenever
    // real branding lands; a manifest with stale colors relative to the
    // app itself is worse than the current placeholder-matching state.
    background_color: '#fff5fb',
    theme_color: '#d6008c',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
