const CACHE_NAME = 'sadman-blog-v2'
const RUNTIME_CACHE = 'sadman-blog-runtime-v2'

const STATIC_ASSETS = [
  '/',
  '/fonts/BricolageGrotesque.woff2',
  '/fonts/InterVariable.woff2',
  '/fonts/IosevkaFixedSS03-Regular.woff2',
  '/fonts/IosevkaFixedSS03-SemiBold.woff2',
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
          .filter((cacheName) => cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE)
          .map((cacheName) => caches.delete(cacheName))
      )
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)

  // Skip chrome-extension and external origins
  if (url.protocol === 'chrome-extension:' || url.origin !== self.location.origin) return

  // Navigation requests: stale-while-revalidate for instant back/forward
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) =>
        cache.match(event.request).then((cached) => {
          const networkFetch = fetch(event.request).then((response) => {
            if (response.ok) {
              cache.put(event.request, response.clone())
            }
            return response
          }).catch(() => cached)

          return cached || networkFetch
        })
      )
    )
    return
  }

  // Static assets (fonts, CSS, JS): cache-first with runtime population
  if (
    url.pathname.startsWith('/_astro/') ||
    url.pathname.startsWith('/fonts/') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js')
  ) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) =>
        cache.match(event.request).then((cached) => {
          if (cached) return cached
          return fetch(event.request).then((response) => {
            if (response.ok) {
              cache.put(event.request, response.clone())
            }
            return response
          })
        })
      )
    )
    return
  }
})
