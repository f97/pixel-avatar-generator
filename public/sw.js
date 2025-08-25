// public/sw.js

self.addEventListener("install", (event) => {
  console.log("[SW] Installed");
  // Cache sẵn gì đó nếu muốn:
  event.waitUntil(
    caches.open("app-cache").then((cache) => {
      return cache.addAll(["/"]);
    })
  );
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Activated");
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Nếu có cache thì trả cache, không thì fetch
      return response || fetch(event.request);
    })
  );
});
