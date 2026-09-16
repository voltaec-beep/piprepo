/* Pip service worker.
   Precaches the app so it opens with no connection. Module JSON is read
   network-first so an instructor who edits the folder sees the change,
   with the cached copy as the offline fallback. */

var VERSION = 'pip-2026-10-12-2';
var CACHE = VERSION;

var PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png',
  './favicon-32.png',
  './modules.json',
  './amulet-of-samarkand.json',
  './the-tortoise-and-the-hare.json',
  './alice-in-wonderland.json',
  './avatars.json',
  './owl.svg',
  './fox.svg',
  './cat.svg',
  './whale.svg',
  './bee.svg',
  './mushroom.svg',
  './moon.svg',
  './rocket.svg'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      /* Added one at a time: a single missing file would otherwise fail
         the whole install and leave Pip with no offline copy at all. */
      return Promise.all(PRECACHE.map(function (url) {
        return c.add(new Request(url, { cache: 'reload' })).catch(function () { return null; });
      }));
    })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        return k === CACHE ? null : caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('message', function (e) {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

function isModuleData(url) {
  /* Catalogue and avatar data, now sitting alongside everything else.
     The PWA manifest is excluded: it is app shell, not content. */
  if (!/\.json$/.test(url.pathname)) return false;
  return !/\/manifest\.json$/.test(url.pathname);
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;

  var url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return;

  /* Navigations: try the network so a new deploy lands, fall back to cache. */
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put('./index.html', copy); });
        return res;
      }).catch(function () {
        return caches.match('./index.html').then(function (hit) {
          return hit || caches.match('./');
        });
      })
    );
    return;
  }

  /* Catalogue and avatar data: freshest wins, cache is the fallback. */
  if (isModuleData(url)) {
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () { return caches.match(req); })
    );
    return;
  }

  /* Everything else: cache first. */
  e.respondWith(
    caches.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        if (res && res.status === 200 && res.type === 'basic') {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      });
    })
  );
});
