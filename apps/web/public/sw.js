const CACHE_NAME = "weather-app-shell-v6";
const SHELL_ASSETS = ["/", "/manifest.webmanifest", "/pwa-icons/icon.svg", "/weather-icons/fallback/weather.svg"];

const putInCache = async (request, response) => {
  if (!response || response.status !== 200 || response.type === "opaque") return;
  const responseToCache = response.clone();
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, responseToCache);
};

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }

  if (event.request.mode === "navigate" || url.origin === self.location.origin) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          putInCache(event.request, response).catch(() => undefined);
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached ?? caches.match("/")))
    );
  }
});
