// Service Worker لتشغيل Clinical Atlas بدون إنترنت (يلزم استضافة الملفات عبر HTTPS)
const CACHE = 'clinical-atlas-v2';

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png']).catch(() => {})));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// تخزين كل ما يُطلب (بما فيه Tailwind والخطوط) والرجوع إليه عند انقطاع الإنترنت
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const hit = await cache.match(e.request);
      const net = fetch(e.request)
        .then((res) => {
          if (res && (res.ok || res.type === 'opaque')) cache.put(e.request, res.clone());
          return res;
        })
        .catch(() => hit);
      return hit || net;
    })
  );
});
