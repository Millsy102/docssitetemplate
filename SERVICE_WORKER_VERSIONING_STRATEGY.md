# Service Worker Versioning Strategy

## Overview

This document outlines the comprehensive service worker versioning strategy implemented for the BeamFlow documentation site. The strategy ensures reliable caching, seamless updates, and optimal user experience with proper version management.

## Architecture

### Core Components

1. **Service Worker Version Generator** (`scripts/generate-sw-version.js`)
   - Generates unique version hashes based on build content
   - Integrates Git information for traceability
   - Creates version-specific cache names

2. **Enhanced Service Worker** (`public/sw.js`)
   - Multi-strategy caching (Cache First, Network First, Stale While Revalidate)
   - Automatic cache cleanup and expiration
   - Background sync and push notification support

3. **Service Worker Manager** (`src/components/ServiceWorkerManager.tsx`)
   - React component for service worker lifecycle management
   - Update detection and user notification
   - Cache management and debugging tools

4. **Build Integration** (`scripts/build-with-sw.js`)
   - Automated build process with service worker generation
   - Asset discovery and cache manifest creation
   - Version-specific file updates

## Versioning Strategy

### Version Generation

```javascript
// Version format: packageVersion-buildHash
// Example: 1.0.0-a1b2c3d4
const version = `${packageVersion}-${buildHash}`;
```

**Build Hash Generation:**
- Combines content of all source files
- Includes package.json, vite.config.ts, and source code
- Adds timestamp for uniqueness
- Uses SHA-256 hash (first 8 characters)

### Cache Naming Convention

```javascript
const cacheNames = {
  static: `static-${buildHash}`,      // Static assets (CSS, JS, images)
  dynamic: `dynamic-${buildHash}`,    // Dynamic content
  api: `api-${buildHash}`,           // API responses
  runtime: `runtime-${buildHash}`     // Runtime files (offline, error pages)
};
```

### Cache Strategies

| Cache Type | Strategy | Max Age | Max Entries | Use Case |
|------------|----------|---------|-------------|----------|
| Static | Cache First | 7 days | 100 | CSS, JS, images, fonts |
| Dynamic | Network First | 24 hours | 50 | User-generated content |
| API | Network First | 5 minutes | 20 | API responses |
| Runtime | Stale While Revalidate | 1 hour | 30 | Offline/error pages |

## Implementation Details

### 1. Service Worker Registration

```typescript
// Automatic registration with update detection
const swRegistration = await navigator.serviceWorker.register('/sw.js', {
  scope: '/',
  updateViaCache: 'none' // Always check for updates
});
```

### 2. Update Detection

```typescript
// Listen for service worker updates
swRegistration.addEventListener('updatefound', () => {
  const newWorker = swRegistration.installing;
  newWorker.addEventListener('statechange', () => {
    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
      // New version available
      showUpdateNotification();
    }
  });
});
```

### 3. Cache Management

```javascript
// Automatic cache cleanup
async function cleanOldCaches() {
  const cacheNames = await caches.keys();
  const currentCaches = Object.values(VERSION_INFO.cache);
  
  return Promise.all(
    cacheNames
      .filter(cacheName => !currentCaches.includes(cacheName))
      .map(cacheName => caches.delete(cacheName))
  );
}
```

### 4. Expiration Management

```javascript
// Clean up expired entries
async function cleanExpiredEntries() {
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    const config = CACHE_CONFIG[cacheName.split('-')[0]];
    
    for (const request of keys) {
      const response = await cache.match(request);
      const age = Date.now() - new Date(response.headers.get('date')).getTime();
      
      if (age > config.maxAge) {
        await cache.delete(request);
      }
    }
  }
}
```

## Build Process

### Automated Build Flow

1. **Vite Build**: Standard Vite build process
2. **Service Worker Generation**: Create versioned service worker
3. **Asset Discovery**: Scan built assets for caching
4. **File Copying**: Copy offline/error pages
5. **Manifest Generation**: Create build manifest

### Build Commands

```bash
# Standard build with service worker
npm run build

# Development build with source maps
npm run build:sw:dev

# Clean build directory
npm run build:sw:clean
```

## Update Flow

### 1. Update Detection
- Service worker checks for updates on page load
- Compares current version with server version
- Triggers update notification if new version available

### 2. User Notification
- Shows update banner with version information
- Provides "Update Now" and "Dismiss" options
- Auto-update option available

### 3. Update Process
- New service worker installs in background
- Caches new assets
- Waits for user confirmation or auto-update
- Activates new service worker
- Reloads page to use new version

### 4. Rollback Capability
- Previous version remains available
- Automatic fallback if new version fails
- Manual rollback through cache management

## Monitoring and Debugging

### Version Information

```javascript
// Get current version info
const versionInfo = await getVersionInfo();
console.log('Current version:', versionInfo.version);
console.log('Build hash:', versionInfo.buildHash);
console.log('Git commit:', versionInfo.git.commit);
```

### Cache Information

```javascript
// Get cache statistics
const cacheInfo = await getCacheInfo();
console.log('Total cache size:', cacheInfo.totalSize);
console.log('Cache entries:', cacheInfo.caches);
```

### Debug Panel (Development)

The ServiceWorkerManager component includes a debug panel in development mode that shows:
- Service worker registration status
- Current version information
- Cache size and entries
- Online/offline status
- Manual cache management controls

## Performance Optimizations

### 1. Efficient Caching
- Separate caches for different content types
- Configurable cache sizes and expiration
- Automatic cleanup of old entries

### 2. Background Updates
- Service worker updates in background
- Non-blocking cache operations
- Parallel asset caching

### 3. Smart Prefetching
- Cache critical assets on install
- Dynamic caching based on user behavior
- Intelligent cache invalidation

## Security Considerations

### 1. Content Security Policy
```javascript
// Service worker respects CSP headers
// No eval() or inline scripts
// Secure cache storage
```

### 2. Cache Validation
- Validate cached responses
- Check for tampering
- Secure cache keys

### 3. Update Integrity
- Hash-based version verification
- Git commit tracking
- Build integrity checks

## Testing Strategy

### 1. Unit Tests
```bash
# Test service worker functionality
npm run test:sw

# Test cache management
npm run test:cache-management
```

### 2. Integration Tests
```bash
# Test update flow
npm run test:sw-updates

# Test offline functionality
npm run test:offline
```

### 3. Manual Testing
- Test update notifications
- Verify cache cleanup
- Check offline functionality
- Validate version tracking

## Deployment Considerations

### 1. GitHub Pages
- Service worker works with GitHub Pages hosting
- Proper base path configuration
- Cache busting through versioning

### 2. CDN Integration
- Cache headers optimization
- Service worker cache coordination
- Version-specific asset serving

### 3. Monitoring
- Version deployment tracking
- Cache hit/miss metrics
- Update success rates

## Troubleshooting

### Common Issues

1. **Service Worker Not Updating**
   - Check `updateViaCache` setting
   - Verify service worker scope
   - Clear browser cache

2. **Cache Not Clearing**
   - Check cache names
   - Verify cleanup logic
   - Manual cache clearing

3. **Version Mismatch**
   - Check build hash generation
   - Verify file content changes
   - Clear service worker cache

### Debug Commands

```bash
# Generate service worker manually
node scripts/generate-sw-version.js

# Check cache status
node scripts/test-cache-management.js

# Clear all caches
node scripts/clear-sw-cache.js
```

## Future Enhancements

### 1. Advanced Caching
- Predictive caching based on user patterns
- Adaptive cache strategies
- Machine learning optimization

### 2. Enhanced Monitoring
- Real-time cache analytics
- Performance metrics
- User experience tracking

### 3. Progressive Enhancement
- Background sync improvements
- Push notification enhancements
- Offline-first features

## Conclusion

This service worker versioning strategy provides a robust foundation for reliable caching, seamless updates, and optimal user experience. The implementation is production-ready and includes comprehensive monitoring, debugging, and testing capabilities.

The strategy ensures that users always have access to the latest content while maintaining excellent performance and offline functionality. The automated build process and version management make deployment straightforward and reliable.
