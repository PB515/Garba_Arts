/*
 * Minimal service worker (Tier-2 #8) — offline app-shell fallback only.
 * Registered by lib/pwa/register-sw.tsx. Bump CACHE on each deploy that should
 * invalidate old assets. Keep it simple; reach for Workbox only if you need more.
 *
 * Network-first, not cache-first — this is a live admin CRM (dashboard/leads/
 * fees), not a content site, so staff must always see fresh data when online.
 * The cache exists only as a fallback for genuine offline access, never as
 * the default path. (Cache-first previously caused a real production bug:
 * if the network fetch failed transiently and the offline fallback lookup
 * came back empty, `respondWith` received an invalid response and the whole
 * page failed to load with a raw connection error — intermittent, hard to
 * reproduce, looked like a network/ISP issue but wasn't.)
 */
const CACHE = 'site-shell-v2';
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
    fetch(request)
      .then((response) => {
        // Keep the offline shell reasonably fresh, best-effort, never blocking.
        if (response && response.ok && request.mode === 'navigate') {
          caches.open(CACHE).then((cache) => cache.put('/', response.clone()));
        }
        return response;
      })
      .catch(async () => {
        // Only reached when the network genuinely fails (offline). Fall back
        // to whatever's cached; if nothing is cached, let the browser show
        // its own offline error rather than passing an invalid response to
        // respondWith (that invalid-response case was the actual bug).
        const cached = await caches.match(request) || await caches.match('/');
        return cached || Response.error();
      })
  );
});
