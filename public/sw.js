/* Service worker de FACTIBLE: app shell + caché de carátulas para uso offline. */
const SHELL = 'factible-shell-v2';
const IMAGES = 'factible-images-v2';
const CORE = ['/', '/index.html', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png', '/logos/factible_logo1.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== SHELL && key !== IMAGES).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

const cacheResponse = (cacheName, request, response) => {
  if (!response || (response.status && response.status >= 400)) return;
  const copy = response.clone();
  caches.open(cacheName).then((cache) => cache.put(request, copy)).catch(() => {});
};

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    // Carátulas y fuentes remotas: cache-first, admitiendo respuestas opacas.
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request)
            .then((response) => {
              cacheResponse(IMAGES, request, response);
              return response;
            })
            .catch(() => cached),
      ),
    );
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          cacheResponse(SHELL, request, response);
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
          cacheResponse(SHELL, request, response);
          return response;
        }),
    ),
  );
});
