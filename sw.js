/* Glamoura service worker: offline-first for site files, network-first for pages */
const V = 'glamoura-v1';
const FILES = ['./', 'index.html', 'calc.html', 'price.html', 'reconcile.html', 'split.html', 'lot.html', 'messages.html',
  'checklist.html', 'guide.html', 'links.json', 'manifest.webmanifest', 'assets/style.css', 'assets/common.js',
  'assets/pathao.js', 'assets/icon.svg', 'assets/icon-192.png', 'assets/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  if (u.origin !== location.origin) return;           // fonts etc. go straight to network
  e.respondWith(fetch(e.request).then(r => {
    const copy = r.clone(); caches.open(V).then(c => c.put(e.request, copy)); return r;
  }).catch(() => caches.match(e.request).then(m => m || caches.match('index.html'))));
});
