// Script to clear service worker cache
// Run this in the browser console to clear existing caches

console.log('Clearing service worker caches...');

// Clear all caches
caches.keys().then(cacheNames => {
    return Promise.all(
        cacheNames.map(cacheName => {
            console.log('Deleting cache:', cacheName);
            return caches.delete(cacheName);
        })
    );
}).then(() => {
    console.log('All caches cleared successfully');
    
    // Unregister service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
            for (let registration of registrations) {
                registration.unregister();
                console.log('Service worker unregistered');
            }
        });
    }
}).catch(error => {
    console.error('Error clearing caches:', error);
});

// Instructions for manual cache clearing:
console.log('\n=== Manual Cache Clearing Instructions ===');
console.log('1. Open Developer Tools (F12)');
console.log('2. Go to Application tab');
console.log('3. Click on "Storage" in the left sidebar');
console.log('4. Click "Clear site data"');
console.log('5. Refresh the page');
console.log('6. The service worker will reinstall with correct cache files');
