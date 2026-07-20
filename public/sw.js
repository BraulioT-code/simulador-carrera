/* Service worker mínimo: cachea el shell y sirve offline */
const CACHE = "carrera-v1";
const SHELL = ["/", "/index.html", "/logo.svg", "/favicon.svg", "/manifest.webmanifest"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;

  // Navegación: red primero, cache de respaldo (para funcionar offline)
  if (request.mode === "navigate") {
    e.respondWith(fetch(request).catch(() => caches.match("/index.html")));
    return;
  }

  // Recursos propios: cache primero
  if (new URL(request.url).origin === self.location.origin) {
    e.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy));
            return res;
          })
      )
    );
  }
});
