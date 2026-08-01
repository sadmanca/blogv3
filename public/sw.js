const CACHE = 'sadman-blog-v4'

const ROUTES = [
  '/',
  '/blog/',
  '/blog/1/',
  '/projects/',
  '/about/',
  '/tags/',
  '/reading/',
  '/uses/',
  '/authors/',
]

const CRITICAL_ASSETS = [
  '/fonts/BricolageGrotesque.woff2',
  '/fonts/InterVariable.woff2',
  '/fonts/IosevkaFixedSS03-Regular.woff2',
  '/fonts/IosevkaFixedSS03-SemiBold.woff2',
]

// Pre-cache all known routes + critical assets on install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll([...ROUTES, ...CRITICAL_ASSETS])
    ).then(() => self.skipWaiting())
  )
})

// Clean up old caches on activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Enable navigation preload for faster cold navigations
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable()
      }
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE)
          .map((cacheName) => caches.delete(cacheName))
      )
      await self.clients.claim()
    })()
  )
})

// Cache-first: serve instantly from cache, update in background
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)
  if (url.protocol === 'chrome-extension:' || url.origin !== self.location.origin) return

  event.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(event.request).then((cached) => {
        const fetched = fetch(event.request).then((response) => {
          if (response.ok) {
            cache.put(event.request, response.clone())
          }
          return response
        })

        if (cached) {
          // Update cache in background (don't block response)
          event.waitUntil(fetched)
          return cached
        }

        return fetched
      })
    )
  )
})
