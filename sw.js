/* Service Worker — Cobranza en Campo
   Cachea el app shell + librerías para que la app cargue y
   opere sin conexión una vez instalada. */
const CACHE = 'cobranza-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  'https://cdnjs.cloudflare.com/ajax/libs/lz-string/1.5.0/lz-string.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

/* Estrategia: cache-first para assets, network-first para el resto */
self.addEventListener('fetch', e=>{
  const req = e.request;
  if(req.method!=='GET') return;
  e.respondWith(
    caches.match(req).then(cached=>{
      if(cached) return cached;
      return fetch(req).then(res=>{
        const copy = res.clone();
        caches.open(CACHE).then(c=>c.put(req, copy)).catch(()=>{});
        return res;
      }).catch(()=> cached);
    })
  );
});
