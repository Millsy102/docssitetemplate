/* ===== CACHE MANAGER COMPONENT ===== */

// Cache management utilities for Service Worker
class CacheManager {
    constructor() {
        this.CACHE_NAME = 'docssitetemplate-v1.0.0';
        this.STATIC_CACHE = 'static-v1.0.0';
        this.DYNAMIC_CACHE = 'dynamic-v1.0.0';
        this.API_CACHE = 'api-v1.0.0';
        
        // Files to cache immediately - updated to match actual project structure
        this.STATIC_FILES = [
            '/',
            '/index.html',
            '/assets/main-Czr3l6Ap.js',
            '/assets/main-tn0RQdqM.css',
            '/assets/router-HvkchvHX.js',
            '/assets/utils-l0sNRNKZ.js',
            '/assets/vendor-gH-7aFTg.js',
            '/assets/manifest-ChRwKaLr.json',
        
            '/sw.js'
        ];
        
        // API endpoints to cache
        this.API_ENDPOINTS = [
            '/api/docs',
            '/api/examples',
            '/api/search'
        ];
    }
    
    // Install event - cache static files
    async install() {
        console.log('Cache Manager: Installing...');
        
        try {
            const cache = await caches.open(this.STATIC_CACHE);
            console.log('Cache Manager: Caching static files');
            await cache.addAll(this.STATIC_FILES);
            console.log('Cache Manager: Static files cached successfully');
            return true;
        } catch (error) {
            console.error('Cache Manager: Error caching static files', error);
            return false;
        }
    }
    
    // Activate event - clean up old caches
    async activate() {
        console.log('Cache Manager: Activating...');
        
        try {
            const cacheNames = await caches.keys();
            const deletePromises = cacheNames.map(cacheName => {
                if (cacheName !== this.STATIC_CACHE && 
                    cacheName !== this.DYNAMIC_CACHE && 
                    cacheName !== this.API_CACHE) {
                    console.log('Cache Manager: Deleting old cache', cacheName);
                    return caches.delete(cacheName);
                }
            });
            
            await Promise.all(deletePromises);
            console.log('Cache Manager: Activated successfully');
            return true;
        } catch (error) {
            console.error('Cache Manager: Error during activation', error);
            return false;
        }
    }
    
    // Handle static file requests
    async handleStaticFile(request) {
        try {
            const cachedResponse = await caches.match(request);
            if (cachedResponse) {
                return cachedResponse;
            }
            
            const networkResponse = await fetch(request);
            if (networkResponse.ok) {
                const cache = await caches.open(this.DYNAMIC_CACHE);
                cache.put(request, networkResponse.clone());
            }
            
            return networkResponse;
        } catch (error) {
            console.error('Cache Manager: Error handling static file', error);
            return new Response('Network error', { status: 503 });
        }
    }
    
    // Handle API requests
    async handleAPIRequest(request) {
        try {
            const cachedResponse = await caches.match(request);
            if (cachedResponse) {
                return cachedResponse;
            }
            
            const networkResponse = await fetch(request);
            if (networkResponse.ok) {
                const cache = await caches.open(this.API_CACHE);
                cache.put(request, networkResponse.clone());
            }
            
            return networkResponse;
        } catch (error) {
            console.error('Cache Manager: Error handling API request', error);
            return new Response('API error', { status: 503 });
        }
    }
    
    // Handle dynamic requests
    async handleDynamicRequest(request) {
        try {
            const networkResponse = await fetch(request);
            if (networkResponse.ok) {
                const cache = await caches.open(this.DYNAMIC_CACHE);
                cache.put(request, networkResponse.clone());
            }
            
            return networkResponse;
        } catch (error) {
            console.error('Cache Manager: Error handling dynamic request', error);
            return new Response('Network error', { status: 503 });
        }
    }
    
    // Check if request is for a static file
    isStaticFile(request) {
        const url = new URL(request.url);
        return this.STATIC_FILES.includes(url.pathname) ||
               request.destination === 'style' ||
               request.destination === 'script' ||
               request.destination === 'image' ||
               request.destination === 'font';
    }
    
    // Check if request is for an API endpoint
    isAPIRequest(request) {
        const url = new URL(request.url);
        return this.API_ENDPOINTS.some(endpoint => url.pathname.startsWith(endpoint));
    }
    
    // Clear all caches
    async clearAllCaches() {
        try {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
            console.log('Cache Manager: All caches cleared');
            return true;
        } catch (error) {
            console.error('Cache Manager: Error clearing caches', error);
            return false;
        }
    }
    
    // Get cache statistics
    async getCacheStats() {
        try {
            const cacheNames = await caches.keys();
            const stats = {};
            
            for (const cacheName of cacheNames) {
                const cache = await caches.open(cacheName);
                const keys = await cache.keys();
                stats[cacheName] = keys.length;
            }
            
            return stats;
        } catch (error) {
            console.error('Cache Manager: Error getting cache stats', error);
            return {};
        }
    }
}

// Export for use in service worker
if (typeof self !== 'undefined') {
    self.CacheManager = CacheManager;
}
