"use strict";

// TODO: Update cache names any time any of the cached files change.
const CACHE_NAME = "static-cache-v5-0";
const DATA_CACHE_NAME = "data-cache-v4-0";
const IMAGE_CACHE_NAME = "image-cache-v2-0";

// Add a list of files to the cache here.
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/scripts/app.js",
  "/styles/styles.css",
  "/images/add.svg",
  "/images/locate.svg",
  "/images/menu.svg",
  "/images/icons/wilderness-weather.svg",
  "/images/icons/icon-128x128.png",
  "/images/icons/icon-144x144.png",
  "/images/icons/icon-152x152.png",
  "/images/icons/icon-192x192.png",
  "/images/icons/icon-256x256.png",
  "/images/icons/icon-512x512.png",
  "/images/meteocons/fill/svg/fahrenheit.svg",
  "/images/meteocons/fill/svg/not-available.svg",
  "/images/meteocons/fill/svg/extreme.svg",
  "/images/meteocons/fill/svg/extreme-day.svg",
  "/images/meteocons/fill/svg/extreme-night.svg",
  "/images/meteocons/fill/svg/extreme-day-fog.svg",
  "/images/meteocons/fill/svg/extreme-night-fog.svg",
  "/images/meteocons/fill/svg/extreme-fog.svg",
  "/images/meteocons/fill/svg/extreme-day-drizzle.svg",
  "/images/meteocons/fill/svg/extreme-night-drizzle.svg",
  "/images/meteocons/fill/svg/extreme-drizzle.svg",
  "/images/meteocons/fill/svg/extreme-day-rain.svg",
  "/images/meteocons/fill/svg/extreme-night-rain.svg",
  "/images/meteocons/fill/svg/extreme-rain.svg",
  "/images/meteocons/fill/svg/extreme-day-snow.svg",
  "/images/meteocons/fill/svg/extreme-night-snow.svg",
  "/images/meteocons/fill/svg/extreme-snow.svg",
  "/images/meteocons/fill/svg/thunderstorms-day-extreme.svg",
  "/images/meteocons/fill/svg/thunderstorms-night-extreme.svg",
  "/images/meteocons/fill/svg/thunderstorms-extreme.svg",
  "/images/meteocons/fill/svg/alert-avalanche-danger.svg",
  "/images/meteocons/fill/svg/code-green.svg",
  "/images/meteocons/fill/svg/code-orange.svg",
  "/images/meteocons/fill/svg/code-red.svg",
  "/images/meteocons/fill/svg/snowflake.svg",
  "/images/meteocons/fill/svg/snowman.svg",
  "/images/meteocons/fill/svg/thermometer-mercury-cold.svg",
  "/images/meteocons/fill/svg/wind-beaufort-0.svg",
  "/images/meteocons/fill/svg/wind-beaufort-1.svg",
  "/images/meteocons/fill/svg/wind-beaufort-2.svg",
  "/images/meteocons/fill/svg/wind-beaufort-3.svg",
  "/images/meteocons/fill/svg/wind-beaufort-4.svg",
  "/images/meteocons/fill/svg/wind-beaufort-5.svg",
  "/images/meteocons/fill/svg/wind-beaufort-6.svg",
  "/images/meteocons/fill/svg/wind-beaufort-7.svg",
  "/images/meteocons/fill/svg/wind-beaufort-8.svg",
  "/images/meteocons/fill/svg/wind-beaufort-9.svg",
  "/images/meteocons/fill/svg/wind-beaufort-10.svg",
  "/images/meteocons/fill/svg/wind-beaufort-11.svg",
  "/images/meteocons/fill/svg/wind-beaufort-12.svg"
];

self.addEventListener("install", evt => {
  console.log("[ServiceWorker] Install");
  // CODELAB: Precache static resources here.
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("[ServiceWorker] Pre-caching offline assets");
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", evt => {
  console.log("[ServiceWorker] Activate");
  // NOTE: Remove previously cached data from the disk.
  evt.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME && key !== IMAGE_CACHE_NAME) {
            console.log("[ServiceWorker] Removing old cache", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", evt => {
  console.log("[ServiceWorker] Fetch", evt.request.url);
  if (evt.request.method !== "GET") {
    return;
  }

  if (evt.request.mode === "navigate") {
    evt.respondWith(
      fetch(evt.request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(evt.request, responseClone));
          return response;
        })
        .catch(() => {
          return caches.open(CACHE_NAME).then(cache => {
            return cache.match(evt.request).then(cachedResponse => {
              return cachedResponse || cache.match("/index.html");
            });
          });
        })
    );
    return;
  }

  // if no internet uses the cached data
  if (evt.request.url.includes("/forecast/") || evt.request.url.includes("/forecast?")) {
    console.log("[Service Worker] Fetch (data)", evt.request.url);
    evt.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {
        return fetch(evt.request)
          .then(response => {
            // If the response was good, clone it and store it in the cache.
            if (response.status === 200) {
              cache.put(evt.request.url, response.clone());
            }
            return response;
          })
          .catch(err => {
            // Network request failed, try to get it from the cache.
            return cache.match(evt.request);
          });
      })
    );
    return;
  }

  if (evt.request.destination === "image") {
    evt.respondWith(
      caches.open(IMAGE_CACHE_NAME).then(cache => {
        return cache.match(evt.request).then(response => {
          return (
            response ||
            fetch(evt.request).then(fetchResponse => {
              cache.put(evt.request, fetchResponse.clone());
              return fetchResponse;
            })
          );
        });
      })
    );
    return;
  }

  evt.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(evt.request).then(response => {
        if (response) {
          return response;
        }
        return fetch(evt.request)
          .then(fetchResponse => {
            if (fetchResponse.status === 200) {
              cache.put(evt.request, fetchResponse.clone());
            }
            return fetchResponse;
          })
          .catch(() => cache.match(evt.request));
      });
    })
  );
});
