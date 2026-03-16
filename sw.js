const CACHE_NAME = 'kobir-lyrics-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/home.html',
  '/manifest.json',
  '/favicon.ico',
  '/files/bangla_style.css',
  '/files/gallery.html',
  '/files/gallery_script.js',
  '/icons/Icon-192.png',
  '/icons/Icon-512.png'
];

// Install: Cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('✓ Caching essential assets');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // We prefer network for fresh content (like dynamic categories)
  // but fallback to cache if offline
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request).then((response) => {
          if (response) return response;
          // If both fail, and it's a page request, show offline page or just fail
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
        });
      })
  );
});
