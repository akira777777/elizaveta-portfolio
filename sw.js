/* eslint-env serviceworker */
/* global swLogger */
// Enhanced Service Worker v3.0 - Elizaveta Portfolio (Browser Compatible)
// Import logger for conditional logging
importScripts('./modules/sw-logger.js');

const CACHE_NAME = 'elizaveta-portfolio-v3.0';
const STATIC_CACHE = 'static-v3.0';
const IMAGE_CACHE = 'images-v3.0';
const DYNAMIC_CACHE = 'dynamic-v3.0';

// Critical resources for caching (updated for browser modules)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles-minimalist.css',
  '/main-browser.js',
  '/modules/gallery-browser.js',
  '/modules/forms-browser.js',
  '/config/libraries.js'
];

// Image assets for caching
const IMAGE_ASSETS = [
  '/assets/images/elizaveta-profile.jpg',
  '/assets/images/elizaveta-profile_1200w.jpg',
  '/assets/images/portfolio/freepik__subtle-variation-of-the-previous-electronic-music-__38650-sm.webp',
  '/assets/images/portfolio/freepik__subtle-variation-of-the-previous-electronic-music-__38650.webp',
  '/assets/images/portfolio/freepik__subtle-variation-of-the-previous-electronic-music-__38650-sm.jpg',
  '/assets/images/portfolio/freepik__subtle-variation-of-the-previous-electronic-music-__38650.jpg',
  '/assets/images/portfolio/freepik__subtle-variation-of-the-previous-electronic-music-__38651-sm.webp',
  '/assets/images/portfolio/freepik__subtle-variation-of-the-previous-electronic-music-__38651.webp',
  '/assets/images/portfolio/freepik__subtle-variation-of-the-previous-electronic-music-__38651-sm.jpg',
  '/assets/images/portfolio/freepik__subtle-variation-of-the-previous-electronic-music-__38651.jpg',
  '/assets/images/portfolio/freepik__upload__96336-sm.webp',
  '/assets/images/portfolio/freepik__upload__96336.webp',
  '/assets/images/portfolio/freepik__upload__96336-sm.jpg',
  '/assets/images/portfolio/freepik__upload__96336.jpg',
  '/assets/images/portfolio/freepik__upload__96337-sm.webp',
  '/assets/images/portfolio/freepik__upload__96337.webp',
  '/assets/images/portfolio/freepik__upload__96337-sm.jpg',
  '/assets/images/portfolio/freepik__upload__96337.jpg',
  '/assets/images/portfolio/freepik__upload__96338-sm.webp',
  '/assets/images/portfolio/freepik__upload__96338.webp',
  '/assets/images/portfolio/freepik__upload__96338-sm.jpg',
  '/assets/images/portfolio/freepik__upload__96338.jpg',
  '/assets/images/portfolio/freepik__upload__96339-sm.webp',
  '/assets/images/portfolio/freepik__upload__96339.webp',
  '/assets/images/portfolio/freepik__upload__96339-sm.jpg',
  '/assets/images/portfolio/freepik__upload__96339.jpg',
  '/assets/images/portfolio/freepik__upload__96340-sm.webp',
  '/assets/images/portfolio/freepik__upload__96340.webp',
  '/assets/images/portfolio/freepik__upload__96340-sm.jpg',
  '/assets/images/portfolio/freepik__upload__96340.jpg',
  '/assets/images/portfolio/freepik__upload__96341-sm.webp',
  '/assets/images/portfolio/freepik__upload__96341.webp',
  '/assets/images/portfolio/freepik__upload__96341-sm.jpg',
  '/assets/images/portfolio/freepik__upload__96341.jpg',
  '/assets/images/portfolio/freepik__upload__96342-sm.webp',
  '/assets/images/portfolio/freepik__upload__96342.webp',
  '/assets/images/portfolio/freepik__upload__96342-sm.jpg',
  '/assets/images/portfolio/freepik__upload__96342.jpg',
  '/assets/images/portfolio/3d-composition-sm.webp',
  '/assets/images/portfolio/3d-composition.webp',
  '/assets/images/portfolio/3d-composition-sm.jpg',
  '/assets/images/portfolio/3d-composition.jpg'
];

// Cache expiration times
// eslint-disable-next-line no-unused-vars
const CACHE_EXPIRY = {
  static: 7 * 24 * 60 * 60 * 1000, // 7 days
  images: 30 * 24 * 60 * 60 * 1000, // 30 days
  dynamic: 24 * 60 * 60 * 1000 // 1 day
};

// Install event
self.addEventListener('install', event => {
  swLogger.swLog('Installing v3.0...');

  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then(cache => {
        swLogger.swLog('📦 Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),

      // Cache image assets
      caches.open(IMAGE_CACHE).then(cache => {
        swLogger.swLog('🖼️ Caching images');
        return Promise.allSettled(
          IMAGE_ASSETS.map(url =>
            cache
              .add(url)
              .catch(err => swLogger.swWarn(`Failed to cache: ${url}`, err))
          )
        );
      })
    ]).then(() => {
      swLogger.swLog('✅ Installation complete');
      return self.skipWaiting();
    })
  );
});

// Activate event
self.addEventListener('activate', event => {
  swLogger.swLog('⚡ Activating...');

  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (
              ![STATIC_CACHE, IMAGE_CACHE, DYNAMIC_CACHE].includes(cacheName)
            ) {
              swLogger.swLog('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        swLogger.swLog('✅ Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests from same origin
  if (request.method !== 'GET' || url.origin !== location.origin) {
    return;
  }

  event.respondWith(handleRequest(request));
});

// Request handling
async function handleRequest(request) {
  const url = new URL(request.url);

  try {
    // HTML pages: Network first
    if (request.destination === 'document' || url.pathname.endsWith('.html')) {
      return await networkFirst(request, STATIC_CACHE);
    }

    // Images: Cache first
    if (request.destination === 'image' || isImageRequest(url)) {
      return await cacheFirst(request, IMAGE_CACHE);
    }

    // CSS/JS: Stale while revalidate
    if (
      request.destination === 'script' ||
      request.destination === 'style' ||
      isStaticAsset(url)
    ) {
      return await staleWhileRevalidate(request, STATIC_CACHE);
    }

    // Videos: Network only (too large to cache)
    if (request.destination === 'video' || isVideoRequest(url)) {
      return await fetch(request);
    }

    // Default: Network first
    return await networkFirst(request, DYNAMIC_CACHE);
  } catch (error) {
    swLogger.swError('Request failed:', error);
    return await handleFallback(request);
  }
}

// Network first strategy
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      swLogger.swLog('📦 Serving from cache:', request.url);
      return cachedResponse;
    }
    throw error;
  }
}

// Cache first strategy
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    swLogger.swWarn('Network first strategy failed:', error);
    throw error;
  }
}

// Stale while revalidate strategy
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  // Update cache in background
  const networkResponsePromise = fetch(request)
    .then(response => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(err => swLogger.swWarn('Background update failed:', err));

  return cachedResponse || networkResponsePromise;
}

// Fallback handling
async function handleFallback(request) {
  if (request.destination === 'document') {
    const fallback = await caches.match('/index.html');
    if (fallback) return fallback;
  }

  return new Response('Offline - Content not available', {
    status: 503,
    statusText: 'Service Unavailable'
  });
}

// Helper functions
function isImageRequest(url) {
  return /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(url.pathname);
}

function isVideoRequest(url) {
  return /\.(mp4|webm|ogg|avi|mov)$/i.test(url.pathname);
}

function isStaticAsset(url) {
  return /\.(css|js|json|woff|woff2|ttf)$/i.test(url.pathname);
}

// Message handling
self.addEventListener('message', event => {
  // Verify origin for security
  if (event.origin !== self.origin && event.origin !== location.origin) {
    swLogger.swWarn('Ignoring message from untrusted origin:', event.origin);
    return;
  }

  const { type } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'GET_VERSION':
      event.ports[0].postMessage({
        version: '2.1.0',
        cacheName: CACHE_NAME
      });
      break;

    case 'CLEAR_CACHE':
      clearAllCaches()
        .then(() => {
          event.ports[0].postMessage({ success: true });
        })
        .catch(error => {
          event.ports[0].postMessage({ success: false, error: error.message });
        });
      break;
  }
});

// Clear all caches
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
  swLogger.swLog('🗑️ All caches cleared');
}

// Error handling
self.addEventListener('error', event => {
  swLogger.swError('Global error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  swLogger.swError('Unhandled rejection:', event.reason);
});

swLogger.swLog('🚀 v3.0 loaded successfully');
