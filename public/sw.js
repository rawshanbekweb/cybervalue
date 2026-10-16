// Cybervalue service worker: the public site and labs keep opening offline.
// Private areas (admin, student portal, Junior, live quiz, reports) and every
// API always go to the network and are never cached.
const VERSION = "v1";
const STATIC = `cv-static-${VERSION}`;
const PAGES = `cv-pages-${VERSION}`;
const OFFLINE = "/offline";
const PRIVATE =
  /^\/(admin|student|junior|live|report|api|downloads|sertifikat)(\/|$)/;
const MAX_PAGES = 60;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGES)
      .then((cache) => cache.addAll([OFFLINE, "/icons/icon-192.png"]))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) => key.startsWith("cv-") && ![STATIC, PAGES].includes(key),
            )
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

async function trim(cache) {
  const keys = await cache.keys();
  for (const key of keys.slice(0, Math.max(0, keys.length - MAX_PAGES)))
    await cache.delete(key);
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || PRIVATE.test(url.pathname)) return;

  // Build output never changes under the same name: cache first.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.open(STATIC).then(async (cache) => {
        const hit = await cache.match(request);
        if (hit) return hit;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      }),
    );
    return;
  }

  // Pages: the network first, the last copy when offline, then /offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          if (response.ok && !response.redirected) {
            const cache = await caches.open(PAGES);
            await cache.put(request, response.clone());
            trim(cache);
          }
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(PAGES);
          return (
            (await cache.match(request)) ||
            (await cache.match(OFFLINE)) ||
            Response.error()
          );
        }),
    );
  }
});
