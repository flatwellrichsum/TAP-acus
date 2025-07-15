const CACHE_NAME = 'abacus-pwa-v1';

const ASSETS = [
  './',
  './index.html',
  './abacus.css',
  './abacus.js',
  './calendar.css',
  './calendar.js',
  './default.css',
  './default.js',
  './menu.css',
  './menu.js',
  './opening.css',
  './opening.js',
  './result.css',
  './result.js',
  './audioPlayer.js',
  './images.json',
  './abacusSpec.json',
  './manifest.json',
  './img/icon.png',
  './se/',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});
