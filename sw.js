const STATIC_CACHE = 'app-shell-v1';
const DYNAMIC_CACHE = 'app-shell-dynamic-v1';

const appShellAssets = [
  'manifestCache/',
  'manifestCache/index.html',
  'manifestCache/manifest.json',
  'manifestCache/sw.js',
  'manifestCache/images/icons/192.png',
  'manifestCache/images/icons/512.png'
];


self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      console.log('Cacheando app shell estático...');
      return cache.addAll(appShellAssets);
    })
  );
});

self.addEventListener('activate', event => {
  console.log('Service Worker activado.');
});


self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(networkResponse => {
          return caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
  );
});