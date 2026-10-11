/* EcoConsume AI — service worker minimal untuk mode offline. */
const CACHE = 'ecoconsume-v2';
const OFFLINE_URL = '/offline.html';
const PRECACHE = ['/', '/dashboard', '/scan', '/konsumsi', '/sampah', '/edukasi', OFFLINE_URL, '/manifest.json', '/icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE).catch(() => undefined)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // biarkan lintas-origin (mis. OFF) apa adanya

  // Navigasi halaman: network-first, fallback ke cache lalu offline page.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match(OFFLINE_URL)))
    );
    return;
  }

  // Aset statis: network-first agar bundle tidak pernah usang; fallback ke cache saat offline.
  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok && (url.pathname.startsWith('/_next/') || url.pathname.match(/\.(css|js|svg|png|jpg|webp|woff2?)$/))) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
        }
        return res;
      })
      .catch(() => caches.match(request))
  );
});
