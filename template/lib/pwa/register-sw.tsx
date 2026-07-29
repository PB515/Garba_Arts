'use client';
/**
 * RegisterSW — registers the service worker (Tier-2 #8).
 *
 * Use when: enabling the PWA. Drop <RegisterSW /> into app/layout.tsx (inside
 * <body>). Renders nothing; registers /sw.js on the client after mount. Only
 * runs in the browser and only if service workers are supported.
 */
import { useEffect } from 'react';

export function RegisterSW() {
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* registration is best-effort — never break the page */
      });
    }
  }, []);
  return null;
}
