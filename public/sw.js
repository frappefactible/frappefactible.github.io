/* Service worker de FACTIBLE: cachea solo recursos del propio sitio. */
const SHELL = 'factible-shell-v3';
const CORE = ['/', '/index.html', '/logos/factible_logo1.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== SHELL).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

const cacheResponse = (request, response) => {
  if (!response || (response.status && response.status >= 400)) return;
  const copy = response.clone();
  caches.open(SHELL).then((cache) => cache.put(request, copy)).catch(() => {});
};

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // carátulas remotas: las maneja el navegador

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          cacheResponse(request, response);
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/index.html'))),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          cacheResponse(request, response);
          return response;
        }),
    ),
  );
});
