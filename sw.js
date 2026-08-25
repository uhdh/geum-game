const CACHE = 'geum-v6';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './js/palette.js',
  './js/sprites_a.js',
  './js/sprites_b.js',
  './js/audio.js',
  './js/engine.js',
  './js/puzzles_a.js',
  './js/puzzles_b.js',
  './js/puzzles_c.js',
  './js/puzzles_d.js',
  './js/rooms_a.js',
  './js/rooms_b.js',
  './js/main.js'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE)
      .then(function(c){ return c.addAll(ASSETS); })
      .then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(function(r){
      return r || fetch(e.request).then(function(resp){
        const copy = resp.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
        return resp;
      });
    })
  );
});
