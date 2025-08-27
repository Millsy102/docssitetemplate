// Script to clear service worker cache
// Run this in the browser console to clear existing caches

// Import logger for browser environment
const log = {
    info: (message) => console.log(`[INFO] ${message}`),
    error: (message) => console.error(`[ERROR] ${message}`)
};

log.info('Clearing service worker caches...');

// Clear all caches
caches.keys().then(cacheNames => {
    return Promise.all(
        cacheNames.map(cacheName => {
            log.info(`Deleting cache: ${cacheName}`);
            return caches.delete(cacheName);
        })
    );
}).then(() => {
    log.info('All caches cleared successfully');
    
    // Unregister service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
            for (let registration of registrations) {
                registration.unregister();
                log.info('Service worker unregistered');
            }
        });
    }
}).catch(error => {
    log.error(`Error clearing caches: ${error}`);
});

// Instructions for manual cache clearing:
log.info('\n=== Manual Cache Clearing Instructions ===');
log.info('1. Open Developer Tools (F12)');
log.info('2. Go to Application tab');
log.info('3. Click on "Storage" in the left sidebar');
log.info('4. Click "Clear site data"');
log.info('5. Refresh the page');
log.info('6. The service worker will reinstall with correct cache files');
