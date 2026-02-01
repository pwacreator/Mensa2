const CORE_CACHE = "menu-cache-v11";
const IMAGE_CACHE = "menu-images-v11";

const FILES_TO_CACHE = [
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./theme-switch.js",
  "./menu.json",
  "./assets/images/pizza.jpg",
];

//Install: Core-Dateien vorab cachen
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CORE_CACHE).then((cache) => cache.addAll(FILES_TO_CACHE)),
  );
});

//Fetch: Bilder automatisch cachen
self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.destination === "image") {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;

          return fetch(request).then((response) => {
            // iOS-Schutz
            if (!response || response.status !== 200) {
              return response;
            }
            cache.put(request, response.clone());
            return response;
          });
        }),
      ),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((response) => {
      return (
        response ||
        fetch(request).catch(() => {
          if (request.destination === "document") {
            return caches.match("./index.html");
          }
        })
      );
    }),
  );
});

//Alte Caches löschen
self.addEventListener("activate", (event) => {
  self.clients.claim();
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => ![CORE_CACHE, IMAGE_CACHE].includes(key))
            .map((key) => caches.delete(key)),
        ),
      ),
  );
});
