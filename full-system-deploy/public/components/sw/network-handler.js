/* ===== NETWORK HANDLER COMPONENT ===== */

// Network request handling for Service Worker
class NetworkHandler {
    constructor(cacheManager) {
        this.cacheManager = cacheManager;
        this.offlineFallback = '/offline.html';
    }
    
    // Main fetch handler
    async handleFetch(event) {
        const { request } = event;
        const url = new URL(request.url);
        
        // Skip non-GET requests
        if (request.method !== 'GET') {
            return;
        }
        
        // Handle different types of requests
        if (this.cacheManager.isStaticFile(request)) {
            event.respondWith(this.handleStaticFile(request));
        } else if (this.cacheManager.isAPIRequest(request)) {
            event.respondWith(this.handleAPIRequest(request));
        } else {
            event.respondWith(this.handleDynamicRequest(request));
        }
    }
    
    // Handle static file requests with cache-first strategy
    async handleStaticFile(request) {
        try {
            // Try cache first
            const cachedResponse = await caches.match(request);
            if (cachedResponse) {
                return cachedResponse;
            }
            
            // Fallback to network
            const networkResponse = await fetch(request);
            if (networkResponse.ok) {
                const cache = await caches.open(this.cacheManager.DYNAMIC_CACHE);
                cache.put(request, networkResponse.clone());
            }
            
            return networkResponse;
        } catch (error) {
            console.error('Network Handler: Error handling static file', error);
            return this.getOfflineResponse();
        }
    }
    
    // Handle API requests with network-first strategy
    async handleAPIRequest(request) {
        try {
            // Try network first
            const networkResponse = await fetch(request);
            if (networkResponse.ok) {
                const cache = await caches.open(this.cacheManager.API_CACHE);
                cache.put(request, networkResponse.clone());
                return networkResponse;
            }
            
            // Fallback to cache
            const cachedResponse = await caches.match(request);
            if (cachedResponse) {
                return cachedResponse;
            }
            
            return networkResponse;
        } catch (error) {
            console.error('Network Handler: Error handling API request', error);
            
            // Try cache as fallback
            const cachedResponse = await caches.match(request);
            if (cachedResponse) {
                return cachedResponse;
            }
            
            return this.getOfflineResponse();
        }
    }
    
    // Handle dynamic requests with stale-while-revalidate strategy
    async handleDynamicRequest(request) {
        try {
            // Try network first
            const networkPromise = fetch(request);
            
            // Also try cache
            const cachedResponse = await caches.match(request);
            
            try {
                const networkResponse = await networkPromise;
                if (networkResponse.ok) {
                    const cache = await caches.open(this.cacheManager.DYNAMIC_CACHE);
                    cache.put(request, networkResponse.clone());
                    return networkResponse;
                }
            } catch (networkError) {
                console.warn('Network Handler: Network failed, using cache', networkError);
            }
            
            // Return cached response if available
            if (cachedResponse) {
                return cachedResponse;
            }
            
            return this.getOfflineResponse();
        } catch (error) {
            console.error('Network Handler: Error handling dynamic request', error);
            return this.getOfflineResponse();
        }
    }
    
    // Get offline fallback response
    async getOfflineResponse() {
        try {
            const offlineResponse = await caches.match(this.offlineFallback);
            if (offlineResponse) {
                return offlineResponse;
            }
            
            // Create a simple offline response
            return new Response(
                `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Offline</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            text-align: center; 
                            padding: 50px; 
                            background: #f5f5f5; 
                        }
                        .offline-message { 
                            background: white; 
                            padding: 30px; 
                            border-radius: 8px; 
                            box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
                        }
                    </style>
                </head>
                <body>
                    <div class="offline-message">
                        <h1>You're Offline</h1>
                        <p>Please check your internet connection and try again.</p>
                        <button onclick="window.location.reload()">Retry</button>
                    </div>
                </body>
                </html>
                `,
                {
                    headers: { 'Content-Type': 'text/html' }
                }
            );
        } catch (error) {
            console.error('Network Handler: Error creating offline response', error);
            return new Response('Offline', { status: 503 });
        }
    }
    
    // Background sync for failed requests
    async handleBackgroundSync(syncEvent) {
        if (syncEvent.tag === 'background-sync') {
            try {
                const failedRequests = await this.getFailedRequests();
                for (const request of failedRequests) {
                    await this.retryRequest(request);
                }
            } catch (error) {
                console.error('Network Handler: Background sync failed', error);
            }
        }
    }
    
    // Store failed requests for background sync
    async storeFailedRequest(request) {
        try {
            const failedRequests = await this.getFailedRequests();
            failedRequests.push({
                url: request.url,
                method: request.method,
                headers: Object.fromEntries(request.headers.entries()),
                timestamp: Date.now()
            });
            
            await this.setFailedRequests(failedRequests);
        } catch (error) {
            console.error('Network Handler: Error storing failed request', error);
        }
    }
    
    // Get stored failed requests
    async getFailedRequests() {
        try {
            const cache = await caches.open('failed-requests');
            const response = await cache.match('failed-requests');
            return response ? await response.json() : [];
        } catch (error) {
            console.error('Network Handler: Error getting failed requests', error);
            return [];
        }
    }
    
    // Set failed requests
    async setFailedRequests(requests) {
        try {
            const cache = await caches.open('failed-requests');
            await cache.put('failed-requests', new Response(JSON.stringify(requests)));
        } catch (error) {
            console.error('Network Handler: Error setting failed requests', error);
        }
    }
    
    // Retry a failed request
    async retryRequest(requestData) {
        try {
            const request = new Request(requestData.url, {
                method: requestData.method,
                headers: requestData.headers
            });
            
            const response = await fetch(request);
            if (response.ok) {
                // Remove from failed requests
                const failedRequests = await this.getFailedRequests();
                const updatedRequests = failedRequests.filter(req => req.url !== requestData.url);
                await this.setFailedRequests(updatedRequests);
            }
        } catch (error) {
            console.error('Network Handler: Error retrying request', error);
        }
    }
}

// Export for use in service worker
if (typeof self !== 'undefined') {
    self.NetworkHandler = NetworkHandler;
}
