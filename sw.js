const STATIC_CACHE = 'app-shell-v1';
const DYNAMIC_CACHE = 'app-shell-dynamic-v1';

// OJO: Asegúrate que esta ruta 'images/' coincida con tu carpeta real
const appShellAssets = [
  './',
  './index.html',
  './manifest.json',
  './sw.js',
  './images/icons/192.png', // Ruta corregida
  './images/icons/512.png'  // Ruta corregida
];

// --- PASO 1: INSTALACIÓN ---
// Se dispara cuando el Service Worker se instala
// Aquí pre-cacheamos el App Shell estático
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      console.log('Cacheando app shell estático...');
      return cache.addAll(appShellAssets);
    })
  );
});

// --- PASO 2: ACTIVACIÓN ---
// Se dispara cuando el Service Worker se activa
self.addEventListener('activate', event => {
  console.log('Service Worker activado.');
  // (Aquí es un buen lugar para borrar caches viejos si los tuvieras)
});


// --- PASO 3: FETCH ---
// Intercepta todas las peticiones de red
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        
        // 1. Si la respuesta está en el cache (estático o dinámico), la retorna
        if (response) {
          return response;
        }

        // 2. Si no está en cache, va a la red (fetch)
        return fetch(event.request).then(networkResponse => {
          
          // 3. Y guarda la respuesta en el cache dinámico para futuras visitas
          return caches.open(DYNAMIC_CACHE).then(cache => {
            // Usamos la constante DYNAMIC_CACHE
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
  );
});
// (Se eliminó el '}' extra que tenías al final)