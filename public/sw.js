// SOS: System of Support — Service Worker
// Network-first for assets (handles Vite hash renames), cache-first for navigation

const CACHE_VERSION = 'sos-v3';
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const ASSET_CACHE = `${CACHE_VERSION}-assets`;
const ALL_CACHES = [SHELL_CACHE, ASSET_CACHE];

// Only the bare shell is pre-cached — Vite hashed assets are NOT listed
// because their filenames change on every build
const PRECACHE_URLS = ['/', '/index.html', '/manifest.json'];

// ── Install ──────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  // Take control immediately so the new SW serves the fresh assets right away
  self.skipWaiting();
});

// ── Activate: delete ALL old caches ─────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => !ALL_CACHES.includes(k))
          .map((k) => {
            console.log('[SW] Deleting stale cache:', k);
            return caches.delete(k);
          })
      )
    )
  );
  self.clients.claim();
});

// ── Fetch ────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  const url = new URL(event.request.url);

  // Navigation requests → serve index.html from shell cache (SPA routing)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Vite hashed JS/CSS assets → network-first so deploys always get fresh files
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(ASSET_CACHE).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request)) // fall back to cache if offline
    );
    return;
  }

  // Everything else → cache-first (icons, manifest, etc.)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const clone = response.clone();
        caches.open(SHELL_CACHE).then((cache) => cache.put(event.request, clone));
        return response;
      }).catch(() =>
        new Response('Offline', { status: 503, statusText: 'Service Unavailable' })
      );
    })
  );
});
