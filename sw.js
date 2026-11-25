/* Service worker de la app de coches.
   Siempre intenta descargar la versión nueva de GitHub (así los cambios se ven al momento);
   solo usa la copia guardada si no hay conexión. Las llamadas a Google (reservas, llaves) no se tocan. */
const C = 'coches-v2';
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(C).then(c => c.addAll(['./', './manifest.webmanifest', './icon-192.png', './icon-512.png'])).catch(() => {}));
});
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x)))).then(() => self.clients.claim())
));
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;   // Google Apps Script: directo, sin caché
  e.respondWith(
    (r.mode === 'navigate' ? fetch(r.url, { cache: 'no-cache' }) : fetch(r, { cache: 'no-cache' })).then(res => { if (res.ok) { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)); } return res; })
      .catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || caches.match('./')))
  );
});
