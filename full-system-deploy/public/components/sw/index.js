/* ===== SERVICE WORKER MAIN COMPONENT ===== */

// Development flag - set to false in production
const DEBUG_MODE = false;

// Debug logging function
function debugLog(...args) {
    if (DEBUG_MODE) {
        console.log(...args);
    }
}

// Import service worker components
importScripts('./cache-manager.js');
importScripts('./network-handler.js');

// Initialize service worker components
const cacheManager = new CacheManager();
const networkHandler = new NetworkHandler(cacheManager);

// Service Worker lifecycle events
self.addEventListener('install', (event) => {
    debugLog('Service Worker: Installing...');
    
    event.waitUntil(
        cacheManager.install()
            .then(() => {
                debugLog('Service Worker: Installation complete');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Installation failed', error);
            })
    );
});

self.addEventListener('activate', (event) => {
    debugLog('Service Worker: Activating...');
    
    event.waitUntil(
        cacheManager.activate()
            .then(() => {
                debugLog('Service Worker: Activation complete');
                return self.clients.claim();
            })
            .catch((error) => {
                console.error('Service Worker: Activation failed', error);
            })
    );
});

// Fetch event - handle all network requests
self.addEventListener('fetch', (event) => {
    networkHandler.handleFetch(event);
});

// Background sync event
self.addEventListener('sync', (event) => {
    networkHandler.handleBackgroundSync(event);
});

// Push notification event
self.addEventListener('push', (event) => {
    debugLog('Service Worker: Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'New notification',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View'
            },
            {
                action: 'close',
                title: 'Close'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Project Name', options)
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    debugLog('Service Worker: Notification clicked');
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Message event - handle communication from main thread
self.addEventListener('message', (event) => {
    debugLog('Service Worker: Message received', event.data);
    
    switch (event.data.type) {
        case 'GET_CACHE_STATS':
            cacheManager.getCacheStats()
                .then(stats => {
                    event.ports[0].postMessage({ type: 'CACHE_STATS', stats });
                });
            break;
            
        case 'CLEAR_CACHES':
            cacheManager.clearAllCaches()
                .then(success => {
                    event.ports[0].postMessage({ type: 'CACHES_CLEARED', success });
                });
            break;
            
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        default:
            debugLog('Service Worker: Unknown message type', event.data.type);
    }
});

// Error handling
self.addEventListener('error', (event) => {
    console.error('Service Worker: Error', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('Service Worker: Unhandled rejection', event.reason);
});
