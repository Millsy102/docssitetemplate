/* ===== SERVICE WORKER MAIN COMPONENT ===== */

// Import service worker components
importScripts('./cache-manager.js');
importScripts('./network-handler.js');

// Initialize service worker components
const cacheManager = new CacheManager();
const networkHandler = new NetworkHandler(cacheManager);

// Service Worker lifecycle events
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        cacheManager.install()
            .then(() => {
                console.log('Service Worker: Installation complete');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Installation failed', error);
            })
    );
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        cacheManager.activate()
            .then(() => {
                console.log('Service Worker: Activation complete');
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
    console.log('Service Worker: Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'New notification',
        icon: '/favicon-32x32.png',
        badge: '/favicon-16x16.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View',
                icon: '/favicon-32x32.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/favicon-16x16.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Project Name', options)
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked');
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Message event - handle communication from main thread
self.addEventListener('message', (event) => {
    console.log('Service Worker: Message received', event.data);
    
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
            console.log('Service Worker: Unknown message type', event.data.type);
    }
});

// Error handling
self.addEventListener('error', (event) => {
    console.error('Service Worker: Error', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('Service Worker: Unhandled rejection', event.reason);
});
