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
    background_color: '#ffffff', // TODO: match your --background token
    theme_color: '#ffffff', // TODO: match your brand
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
