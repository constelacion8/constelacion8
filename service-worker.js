const C8_CACHE = 'constelacion8-shell-v1';
const C8_SHELL = [
  './',
  './index.html',
  './install-app.css',
  './install-app.js',
  './manifest.webmanifest',
  './app-icon-192.svg',
  './app-icon-512.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(C8_CACHE)
      .then((cache) => cache.addAll(C8_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== C8_CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(C8_CACHE).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        if (event.request.mode === 'navigate') return caches.match('./');
        throw new Error('Sin conexión y recurso no disponible en caché.');
      })
  );
});
