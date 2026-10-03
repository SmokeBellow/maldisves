const VERSION = 'v8';
const SHELL = `shell-${VERSION}`;
const IMGS = 'imgs';
const FILES = ['./', 'index.html', 'config.js', 'manifest.webmanifest', 'css/style.css', 'icons/icon.svg',
  'js/app.js', 'js/data.js', 'js/store.js', 'js/sync.js', 'js/game.js', 'js/images.js', 'js/art.js', 'js/scenes.js', 'js/chars.js', 'js/px.js',
  'fonts/nunito-cyrillic-wght-normal.woff2', 'fonts/nunito-latin-wght-normal.woff2',
  'icons/icon-192.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('shell-') && k !== SHELL).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (url.hostname === 'upload.wikimedia.org') {
    // фото: из кэша, иначе из сети с сохранением
    e.respondWith(caches.open(IMGS).then(async c => {
      const hit = await c.match(e.request);
      if (hit) return hit;
      const res = await fetch(e.request);
      if (res.ok || res.type === 'opaque') c.put(e.request, res.clone());
      return res;
    }));
  } else if (url.origin === location.origin) {
    // приложение: сначала сеть (свежая версия), при отсутствии сети — кэш
    e.respondWith(fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(SHELL).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true })));
  }
});
