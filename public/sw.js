// Simple service worker for static asset caching
const CACHE_NAME = 'sadman-blog-v1'
const STATIC_ASSETS = [
  '/',
  '/fonts/BricolageGrotesque.woff2',
  '/fonts/InterVariable.woff2',
  '/fonts/IosevkaFixedSS03-Regular.woff2',
  '/fonts/IosevkaFixedSS03-SemiBold.woff2',
  '/static/logo.svg',
]

// Cache static assets on install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  )
})

// Clean up old caches on activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      )
    ).then(() => self.clients.claim())
  )
})

// Serve cached content when offline
self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') return

  // Skip chrome-extension, API calls, and external requests
  if (
    event.request.url.startsWith('chrome-extension://') ||
    event.request.url.startsWith('/api/') ||
    !event.request.url.startsWith(self.location.origin)
  ) {
    return
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) return response

        // For fonts and static assets, cache them
        if (
          event.request.url.includes('/fonts/') ||
          event.request.url.includes('/static/') ||
          event.request.url.includes('.woff2') ||
          event.request.url.includes('.woff') ||
          event.request.url.includes('.css') ||
          event.request.url.includes('.js')
        ) {
          return caches.open(CACHE_NAME).then((cache) =>
            fetch(event.request).then((fetchResponse) => {
              if (fetchResponse.status === 200) {
                cache.put(event.request, fetchResponse.clone())
              }
              return fetchResponse
            })
          )
        }

        // For everything else, network first
        return fetch(event.request)
      })
      .catch(() => {
        // If offline, show a simple offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return new Response(
            '<!DOCTYPE html><html><body><h1>Offline</h1><p>Please check your connection.</p></body></html>',
            { headers: { 'Content-Type': 'text/html' } }
          )
        }
      })
  )
})