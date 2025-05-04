const CACHE_NAME = 'herbal-tea-cache-v1';
const urlsToCache = [
  '/',
  '/main.html',
  '/shop.html',
  '/about.html',
  '/contact.html',
  '/checkout.html',
  '/assets/css/styles.css',
  '/assets/images/tea_logo2.png',
  '/scripts/script.js',
  '/scripts/cart.js',
  '/scripts/indexedDB.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
