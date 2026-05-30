// Guardly service worker — network-first so deploys are always fresh.
// We never cache API calls; we only fall back to cache when offline.
const CACHE = 'guardly-v1'

self.addEventListener('install', (e) => {
  self.skipWaiting() // activate immediately on new deploy
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (e) => {
  const { request } = e
  // Never touch API or non-GET — always go to network.
  if (request.method !== 'GET' || request.url.includes('/api/')) return

  // Network-first: try the network, fall back to cache only if offline.
  e.respondWith(
    fetch(request)
      .then(res => {
        const copy = res.clone()
        caches.open(CACHE).then(c => c.put(request, copy)).catch(() => {})
        return res
      })
      .catch(() => caches.match(request).then(r => r || caches.match('/')))
  )
})
