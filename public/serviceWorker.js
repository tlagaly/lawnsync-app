/**
 * LawnSync Service Worker
 * Handles offline resource caching and background synchronization
 */

// Cache name versions
const STATIC_CACHE_NAME = 'lawnsync-static-v1';
const DYNAMIC_CACHE_NAME = 'lawnsync-dynamic-v1';
const IMAGE_CACHE_NAME = 'lawnsync-images-v1';
const API_CACHE_NAME = 'lawnsync-api-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/assets/main.js',
  '/assets/styles.css',
  '/assets/logo.svg',
  '/assets/icons/favicon.ico',
  '/assets/icons/icon-72x72.png',
  '/assets/icons/icon-96x96.png',
  '/assets/icons/icon-128x128.png',
  '/assets/icons/icon-144x144.png',
  '/assets/icons/icon-152x152.png',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-384x384.png',
  '/assets/icons/icon-512x512.png',
];

// API endpoints to cache with network-first strategy
const API_ENDPOINTS = [
  '/api/weather',
  '/api/recommendations',
  '/api/tasks',
  '/api/profile',
];

// Maximum age for cached responses
const MAX_AGE = {
  images: 30 * 24 * 60 * 60, // 30 days
  api: 30 * 60, // 30 minutes
  dynamic: 7 * 24 * 60 * 60, // 7 days
};

/**
 * Install event - Pre-cache static assets
 */
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker...');
  
  // Skip waiting to activate immediately
  self.skipWaiting();
  
  // Precache static assets
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Pre-caching app shell');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch(err => {
        console.error('[Service Worker] Pre-cache error:', err);
      })
  );
});

/**
 * Activate event - Clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker...');
  
  // Clean up old caches
  event.waitUntil(
    caches.keys()
      .then((keyList) => {
        return Promise.all(keyList.map((key) => {
          // If the cache name doesn't match current versions, delete it
          if (
            key !== STATIC_CACHE_NAME &&
            key !== DYNAMIC_CACHE_NAME &&
            key !== IMAGE_CACHE_NAME &&
            key !== API_CACHE_NAME
          ) {
            console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        }));
      })
      .then(() => {
        console.log('[Service Worker] Claiming clients for immediate control');
        return self.clients.claim();
      })
  );
});

/**
 * Fetch event - Handle network requests with appropriate strategies
 */
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip browser extensions or Chrome-specific URLs
  if (!(url.protocol === 'http:' || url.protocol === 'https:')) {
    return;
  }
  
  // Handle API requests (network-first with cache fallback)
  if (isApiRequest(event.request)) {
    event.respondWith(handleApiRequest(event.request));
    return;
  }
  
  // Handle image requests (cache-first with network fallback)
  if (isImageRequest(event.request)) {
    event.respondWith(handleImageRequest(event.request));
    return;
  }
  
  // Handle navigation requests (network-first with offline fallback)
  if (event.request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(event.request));
    return;
  }
  
  // Default: cache-first strategy for static assets
  event.respondWith(handleStaticRequest(event.request));
});

/**
 * Handle API requests with network-first strategy
 */
async function handleApiRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // If successful, clone the response and cache it
    if (networkResponse.ok) {
      const clonedResponse = networkResponse.clone();
      caches.open(API_CACHE_NAME).then((cache) => {
        cache.put(request, clonedResponse);
      });
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If no cache, return generic API error response
    return new Response(
      JSON.stringify({
        error: 'Network error. App is running in offline mode.',
        offline: true,
        timestamp: new Date().toISOString()
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Handle image requests with cache-first strategy
 */
async function handleImageRequest(request) {
  // Try cache first
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // If not in cache, fetch from network
  try {
    const networkResponse = await fetch(request);
    
    // Cache the new response
    const cache = await caches.open(IMAGE_CACHE_NAME);
    cache.put(request, networkResponse.clone());
    
    return networkResponse;
  } catch (error) {
    // If both cache and network fail, return placeholder image
    return caches.match('/assets/images/placeholder.png');
  }
}

/**
 * Handle navigation requests with network-first strategy
 */
async function handleNavigationRequest(request) {
  try {
    // Try network first for HTML
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    // If network fails, try cache
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If no cache, return offline page
    return caches.match('/offline.html');
  }
}

/**
 * Handle static asset requests with cache-first strategy
 */
async function handleStaticRequest(request) {
  // Try cache first
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // If not in cache, fetch from network
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // If it's not an HTML request, we can't do much if both cache and network fail
    console.error('[Service Worker] Fetch failed:', error);
    return new Response('Network error', { status: 503 });
  }
}

/**
 * Check if request is for an API endpoint
 */
function isApiRequest(request) {
  const url = new URL(request.url);
  
  // Check if the URL path matches any of our API endpoints
  return API_ENDPOINTS.some(endpoint => 
    url.pathname.startsWith(endpoint) || url.pathname.includes('/api/')
  );
}

/**
 * Check if request is for an image
 */
function isImageRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname.toLowerCase();
  
  return (
    path.endsWith('.jpg') ||
    path.endsWith('.jpeg') ||
    path.endsWith('.png') ||
    path.endsWith('.gif') ||
    path.endsWith('.svg') ||
    path.endsWith('.webp') ||
    request.destination === 'image'
  );
}

/**
 * Background sync event handler
 */
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background Sync event:', event.tag);
  
  if (event.tag === 'sync-pending-operations') {
    event.waitUntil(syncPendingOperations());
  }
});

/**
 * Sync pending operations from IndexedDB
 */
async function syncPendingOperations() {
  try {
    // Notify clients that sync is happening
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'SYNC_STARTED',
          timestamp: new Date().toISOString()
        });
      });
    });
    
    // Get pending operations from client code via message
    // The actual sync logic happens in the offlineService.ts
    // The service worker just initiates the process
    
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'REQUEST_SYNC',
          timestamp: new Date().toISOString()
        });
      });
    });
    
    return true;
  } catch (error) {
    console.error('[Service Worker] Sync error:', error);
    return false;
  }
}

/**
 * Message event handler for client communication
 */
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);
  
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SYNC_RESULT':
        // Forward sync result to all clients
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage(event.data);
          });
        });
        break;
        
      case 'SKIP_WAITING':
        // Force the service worker to activate immediately
        self.skipWaiting();
        break;
        
      case 'CACHE_NEW_VERSION':
        // When a new version of the app is deployed, cache the new files
        event.waitUntil(
          caches.open(STATIC_CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
        );
        break;
    }
  }
});

/**
 * Push notification event handler
 */
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Notification received:', event);
  
  let data = {};
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        title: 'LawnSync Update',
        body: event.data.text(),
        icon: '/assets/icons/icon-192x192.png'
      };
    }
  }
  
  const options = {
    body: data.body || 'New update from LawnSync',
    icon: data.icon || '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/badge-72x72.png',
    data: data.data || {},
    actions: data.actions || [],
    vibrate: [100, 50, 100]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'LawnSync', options)
  );
});

/**
 * Notification click event handler
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click:', event);
  
  event.notification.close();
  
  // Handle notification click (e.g., open specific page)
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  } else {
    // Default: open the app
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(windowClients => {
        // Check if there is already a window/tab open with the target URL
        for (let client of windowClients) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        // If no window/tab is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

// Log service worker lifecycle events
console.log('[Service Worker] Service Worker registered successfully');