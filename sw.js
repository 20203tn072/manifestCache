const STATIC_CACHE = 'app-shell-v1';
const DYNAMIC_CACHE = 'app-shell-dynamic-v1';

const appShellAssets = [
  './',
  './index.html',
  './manifest.json',
  './sw.js',
  './images/icons/192.png',
  './images/icons/512.png'
];

// Precaching
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(appShellAssets))
      .then(() => self.skipWaiting())
  );
});

// Cleanup old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== STATIC_CACHE && k !== DYNAMIC_CACHE)
          .map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

// Fetch: cache-first for app shell assets (so manifest/icons served), dynamic caching for others
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // If request is for one of the precached app shell assets -> reply from cache
  const isAppShell = appShellAssets.some(a => {
    const path = a.startsWith('./') ? a.slice(1) : a;
    return url.pathname === '/' + path || url.pathname === path || url.pathname === '/';
  });

  if (isAppShell) {
    event.respondWith(
      caches.match(req).then(res => res || fetch(req))
    );
    return;
  }

  // Otherwise: network-first, fallback to dynamic cache
  event.respondWith(
    fetch(req)
      .then(networkRes => {
        if (req.method === 'GET' && networkRes && networkRes.ok) {
          const copy = networkRes.clone();
          caches.open(DYNAMIC_CACHE).then(cache => cache.put(req, copy));
        }
        return networkRes;
      })
      .catch(() => caches.match(req))
  );
});