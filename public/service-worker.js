/*
 * @license
 * Your First PWA Codelab (https://g.co/codelabs/pwa)
 * Copyright 2019 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License
 */
"use strict";

// CODELAB: Update cache names any time any of the cached files change.
const CACHE_NAME = "static-cache-v4-3";
const DATA_CACHE_NAME = "data-cache-v3-2";
const IMAGE_CACHE_NAME = "image-cache-v1-0";

// CODELAB: Add list of files to cache here.
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/scripts/app.js",
  "/scripts/install.js",
  "/scripts/luxon-1.11.4.js",
  "/styles/styles.css",
  "/styles/inline.css",
  "/images/add.svg",
  "/images/clear-day.svg",
  "/images/clear-night.svg",
  "/images/cloudy.svg",
  "/images/fog.svg",
  "/images/hail.svg",
  "/images/install.svg",
  "/images/locate.svg",
  "/images/partly-cloudy-day.svg",
  "/images/partly-cloudy-night.svg",
  "/images/rain.svg",
  "/images/refresh.svg",
  "/images/sleet.svg",
  "/images/snow.svg",
  "/images/thunderstorm.svg",
  "/images/tornado.svg",
  "/images/wind.svg",
  "/images/menu.svg",
  "/images/icons/wilderness-weather.svg"
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
  // CODELAB: Remove previous cached data from disk.
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

  // if no internet use the cached data
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
        return response || fetch(evt.request);
      });
    })
  );
});
