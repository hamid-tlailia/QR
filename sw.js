const CACHE_NAME = 'qr-app-v3';

const PRECACHE_URLS = [
  './qr.html',
  './qr.css',
  './qr.js',
  './manifest.json',
  './images/favicon.png',
  './images/icon-512.png',
  'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css',
  'https://code.jquery.com/jquery-3.5.1.slim.min.js',
  'https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js',
  'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html5-qrcode/2.2.0/html5-qrcode.min.js',
];

function fetchWithTimeout(request, ms) {
  return Promise.race([
    fetch(request),
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => Promise.all(
      PRECACHE_URLS.map(url => {
        const request = new Request(url, { mode: url.startsWith('http') ? 'no-cors' : 'same-origin' });
        return fetchWithTimeout(request, 8000).then(response => cache.put(url, response)).catch(() => {});
      })
    )).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const isSameOrigin = new URL(event.request.url).origin === self.location.origin;

  if (isSameOrigin) {
    // Network-first for our own app files: online users always get the latest
    // code immediately, and only fall back to the cached copy when offline.
    event.respondWith(
      fetch(event.request).then(response => {
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone())).catch(() => {});
        return response;
      }).catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first for third-party vendor libraries: they rarely change and
  // this keeps things fast and reliable offline.
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone())).catch(() => {});
        return response;
      }).catch(() => new Response('', { status: 504, statusText: 'Offline' }));
    })
  );
});
