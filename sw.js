const CACHE_VERSION = 'davet-evi-takip-v4';
const APP_SHELL = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './firebase-init.js',
  './manifest.json',
  './icon-48.png',
  './icon-72.png',
  './icon-96.png',
  './icon-128.png',
  './icon-144.png',
  './icon-152.png',
  './icon-192.png',
  './icon-384.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// App-shell (kendi dosyalarımız) için: cache-first, ağ yoksa önbellekten sun.
// Diğer istekler (ör. Google Fonts) için: ağı dene, olmazsa önbelleğe düş, hem de arka planda önbelleği güncelle.
const PASSTHROUGH_HOSTS = [
  'firestore.googleapis.com',
  'firebaseapp.com',
  'firebaseio.com',
  'googleapis.com'
];

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if(request.method !== 'GET') return;

  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isPassthrough = PASSTHROUGH_HOSTS.some((h) => url.hostname.endsWith(h));

  if(isPassthrough){
    // Firebase/Firestore'un canlı bağlantılarına karışmadan doğrudan ağa bırak
    return;
  }

  if(isSameOrigin){
    event.respondWith(
      caches.match(request).then((cached) => {
        if(cached) return cached;
        return fetch(request).then((response) => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          return response;
        }).catch(() => caches.match('./index.html'));
      })
    );
  }else{
    event.respondWith(
      fetch(request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
        return response;
      }).catch(() => caches.match(request))
    );
  }
});
