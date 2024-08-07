import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { CacheFirst } from "workbox-strategies";

declare let self: ServiceWorkerGlobalScope;

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

// self.__WB_MANIFEST is default injection point
precacheAndRoute(self.__WB_MANIFEST);

// clean old assets
cleanupOutdatedCaches();

registerRoute(
  /https:\/\/.+\.tile\.openstreetmap\.org\/.+\/.+\/.+\..+$/,
  // /(?:openstreetmap|nginx-cache\.fly\.dev).*\.png$/,
  new CacheFirst({ cacheName: "map-tiles" }),
);
registerRoute(/\.(?:wasm|png)$/, new CacheFirst({ cacheName: "map-assets" }));

// to allow work offline
registerRoute(new NavigationRoute(createHandlerBoundToURL("index.html")));

// Register the new route
