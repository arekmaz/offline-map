import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from "workbox-precaching";
import { clientsClaim } from "workbox-core";
import { NavigationRoute, Route, registerRoute } from "workbox-routing";
import { StaleWhileRevalidate } from "workbox-strategies";

declare let self: ServiceWorkerGlobalScope;

const imageRoute = new Route(({ request, sameOrigin }) => {
  console.log({ request, sameOrigin, url: request.url });

  if (request.destination !== "image") {
    return false;
  }

  return request.url.endsWith("png");
}, new StaleWhileRevalidate({ cacheName: "map" }));

// Register the new route
registerRoute(imageRoute);

// self.__WB_MANIFEST is default injection point
precacheAndRoute(self.__WB_MANIFEST);

// clean old assets
cleanupOutdatedCaches();

let allowlist: undefined | RegExp[];
if (import.meta.env.DEV) allowlist = [/^\/$/];

// to allow work offline
registerRoute(
  new NavigationRoute(createHandlerBoundToURL("index.html"), { allowlist })
);

self.skipWaiting();
clientsClaim();
