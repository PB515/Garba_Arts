/*
 * Minimal service worker (Tier-2 #8) — offline app-shell cache.
 * Registered by lib/pwa/register-sw.tsx. Bump CACHE on each deploy that should
 * invalidate old assets. Keep it simple; reach for Workbox only if you need more.
 */
const CACHE = 'site-shell-v1';
const SHELL = ['/'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return; // never cache mutations
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).catch(() => caches.match('/')) // offline fallback to the shell
    )
  );
});
