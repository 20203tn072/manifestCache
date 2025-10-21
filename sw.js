const appShellAssets = [
    '/', 
    '/index.html',
    '/manifest.json',
    '/sw.js',
    'images/icons/192.png',
    'images/icons/512.png'
];

const appShellDinamic = [];

//Cache sino red
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;
        return fetch(event.request).then(networkResponse => {
          return caches.open('appShellDinamic').then(cache => {
            cache.put(event.request, networkResponse.clone());  
            return networkResponse;
          });
        });
      })
  );
});