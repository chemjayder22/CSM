const CACHE_NAME = 'sdo-cms-v1';

const CORE_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './scripts.js',
  './generate.js',
  './signatories.js',
  './another-page.html',
  './manifest.json',
  './assets/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req)
        .then((res) => {
          const resClone = res.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => {
              cache.put(req, resClone);
            })
            .catch(() => {});
          return res;
        })
        .catch(() => {
          return caches.match('./index.html');
        });
    })
  );
});
