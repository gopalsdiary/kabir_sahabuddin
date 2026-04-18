/// <reference lib="webworker" />

const CACHE_NAME = 'kobir-lyrics-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/app_logo.png'
];

const sw = self as unknown as ServiceWorkerGlobalScope;

// Install: Cache essential assets
sw.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('✓ Caching essential assets');
      return cache.addAll(ASSETS);
    })
  );
  sw.skipWaiting();
});

// Activate: Clean up old caches
sw.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  sw.clients.claim();
});

// Fetch: Network first, fallback to cache
sw.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request).then((response) => {
          if (response) return response;
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html') as Promise<Response>;
          }
          return new Response('Offline', { status: 503 });
        });
      })
  );
});

export {};
