# Performance Guide

This guide covers performance optimization techniques, best practices, and monitoring strategies for Project Name applications.

## Table of Contents

- [Performance Metrics](#performance-metrics)
- [Frontend Optimization](#frontend-optimization)
- [Backend Optimization](#backend-optimization)
- [Database Optimization](#database-optimization)
- [Caching Strategies](#caching-strategies)
- [Monitoring and Profiling](#monitoring-and-profiling)
- [Performance Testing](#performance-testing)

## Performance Metrics

### Key Performance Indicators (KPIs)

| Metric | Target | Measurement |
|--------|--------|-------------|
| **First Contentful Paint (FCP)** | < 1.5s | Time to first meaningful content |
| **Largest Contentful Paint (LCP)** | < 2.5s | Time to largest content element |
| **First Input Delay (FID)** | < 100ms | Time to interactive |
| **Cumulative Layout Shift (CLS)** | < 0.1 | Visual stability |
| **Time to Interactive (TTI)** | < 3.8s | Full interactivity |
| **API Response Time** | < 200ms | Backend response time |
| **Database Query Time** | < 50ms | Database performance |

### Core Web Vitals

```javascript
// Monitor Core Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  const body = JSON.stringify(metric);
  const url = '/analytics';

  // Use `navigator.sendBeacon()` if available, fall back to `fetch()`.
  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, body);
  } else {
    fetch(url, { body, method: 'POST', keepalive: true });
  }
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

## Frontend Optimization

### Code Splitting

```javascript
// Dynamic imports for code splitting
const ProjectList = React.lazy(() => import('./components/ProjectList'));
const UserProfile = React.lazy(() => import('./components/UserProfile'));
const Analytics = React.lazy(() => import('./components/Analytics'));

// Route-based code splitting
const routes = [
  {
    path: '/projects',
    component: React.lazy(() => import('./pages/Projects'))
  },
  {
    path: '/users/:id',
    component: React.lazy(() => import('./pages/UserProfile'))
  }
];
```

### Bundle Optimization

```javascript
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          enforce: true
        }
      }
    }
  }
};
```

### Image Optimization

```javascript
// Lazy loading images
const LazyImage = ({ src, alt, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
    };
  }, [src]);

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={`lazy-image ${isLoaded ? 'loaded' : ''}`}
      {...props}
    />
  );
};

// Responsive images
<picture>
  <source media="(min-width: 800px)" srcSet="large.jpg" />
  <source media="(min-width: 400px)" srcSet="medium.jpg" />
  <img src="small.jpg" alt="Responsive image" />
</picture>
```

### CSS Optimization

```css
/* Critical CSS inlining */
.critical {
  /* Above-the-fold styles */
  display: block;
  font-size: 16px;
  line-height: 1.5;
}

/* Non-critical CSS loading */
<link rel="preload" href="non-critical.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="non-critical.css"></noscript>

/* CSS optimization */
.optimized {
  /* Use transform instead of top/left for animations */
  transform: translateX(100px);
  
  /* Use will-change for animations */
  will-change: transform;
  
  /* Use contain for layout isolation */
  contain: layout style paint;
}
```

### JavaScript Optimization

```javascript
// Debounce expensive operations
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle scroll events
const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Virtual scrolling for large lists
const VirtualList = ({ items, itemHeight, containerHeight }) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleItems = items.slice(
    Math.floor(scrollTop / itemHeight),
    Math.floor(scrollTop / itemHeight) + Math.ceil(containerHeight / itemHeight)
  );
  
  return (
    <div 
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={(e) => setScrollTop(e.target.scrollTop)}
    >
      <div style={{ height: items.length * itemHeight }}>
        <div style={{ transform: `translateY(${Math.floor(scrollTop / itemHeight) * itemHeight}px)` }}>
          {visibleItems.map(item => (
            <div key={item.id} style={{ height: itemHeight }}>
              {item.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

## Backend Optimization

### API Response Optimization

```javascript
// Response compression
import compression from 'compression';

app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Response caching
app.use((req, res, next) => {
  // Cache static assets for 1 year
  if (req.url.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
  // Cache API responses for 5 minutes
  else if (req.url.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'private, max-age=300');
  }
  next();
});

// Pagination optimization
app.get('/api/items', async (req, res) => {
  const { page = 1, limit = 20, cursor } = req.query;
  
  // Use cursor-based pagination for better performance
  const query = cursor 
    ? { _id: { $gt: cursor } }
    : {};
    
  const items = await Item.find(query)
    .limit(parseInt(limit) + 1) // Get one extra to check if there's more
    .lean(); // Return plain objects for better performance
    
  const hasMore = items.length > limit;
  const results = hasMore ? items.slice(0, -1) : items;
  
  res.json({
    data: results,
    pagination: {
      hasMore,
      nextCursor: hasMore ? results[results.length - 1]._id : null
    }
  });
});
```

### Database Query Optimization

```javascript
// Index optimization
// Create compound indexes for common queries
db.items.createIndex({ 
  projectId: 1, 
  status: 1, 
  createdAt: -1 
});

// Use projection to limit returned fields
const items = await Item.find(
  { projectId: 'proj_123' },
  { name: 1, status: 1, createdAt: 1 } // Only return needed fields
).lean();

// Use aggregation for complex queries
const stats = await Item.aggregate([
  { $match: { projectId: 'proj_123' } },
  { $group: {
    _id: '$status',
    count: { $sum: 1 },
    avgSize: { $avg: '$size' }
  }},
  { $sort: { count: -1 } }
]);

// Use bulk operations for multiple updates
const bulkOps = items.map(item => ({
  updateOne: {
    filter: { _id: item._id },
    update: { $set: { status: 'processed' } }
  }
}));

await Item.bulkWrite(bulkOps);
```

### Memory Management

```javascript
// Stream large datasets
app.get('/api/export', async (req, res) => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=export.csv');
  
  const stream = Item.find({ projectId: req.query.projectId })
    .cursor()
    .pipe(csvTransform());
    
  stream.pipe(res);
});

// Memory-efficient processing
const processLargeDataset = async (items) => {
  const batchSize = 1000;
  const results = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const processed = await processBatch(batch);
    results.push(...processed);
    
    // Allow garbage collection
    await new Promise(resolve => setImmediate(resolve));
  }
  
  return results;
};
```

## Database Optimization

### Indexing Strategy

```sql
-- Primary indexes
CREATE INDEX idx_items_project_id ON items(project_id);
CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_items_created_at ON items(created_at);

-- Compound indexes for common queries
CREATE INDEX idx_items_project_status_created 
ON items(project_id, status, created_at DESC);

CREATE INDEX idx_items_user_type_status 
ON items(user_id, type, status);

-- Partial indexes for filtered queries
CREATE INDEX idx_items_active_status 
ON items(project_id, created_at) 
WHERE status = 'active';

-- Text search indexes
CREATE INDEX idx_items_search 
ON items USING gin(to_tsvector('english', name || ' ' || description));
```

### Query Optimization

```sql
-- Use EXPLAIN to analyze query performance
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM items 
WHERE project_id = 'proj_123' 
AND status = 'active' 
ORDER BY created_at DESC 
LIMIT 20;

-- Optimize joins
SELECT i.*, p.name as project_name
FROM items i
INNER JOIN projects p ON i.project_id = p.id
WHERE i.user_id = 'user_123'
AND i.created_at > NOW() - INTERVAL '30 days';

-- Use window functions for pagination
SELECT * FROM (
  SELECT *, 
         ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn
  FROM items 
  WHERE project_id = 'proj_123'
) t 
WHERE rn BETWEEN 1 AND 20;
```

### Connection Pooling

```javascript
// Database connection pooling
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20, // Maximum number of connections
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Use connection pooling in queries
const getItems = async (projectId) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM items WHERE project_id = $1',
      [projectId]
    );
    return result.rows;
  } finally {
    client.release();
  }
};
```

## Caching Strategies

### Redis Caching

```javascript
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
});

// Cache middleware
const cacheMiddleware = (ttl = 300) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    
    try {
      const cached = await redis.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
      
      // Store original send method
      const originalSend = res.json;
      
      // Override send method to cache response
      res.json = function(data) {
        redis.setex(key, ttl, JSON.stringify(data));
        return originalSend.call(this, data);
      };
      
      next();
    } catch (error) {
      next();
    }
  };
};

// Cache invalidation
const invalidateCache = async (pattern) => {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
};

// Usage
app.get('/api/projects/:id', cacheMiddleware(600), async (req, res) => {
  const project = await Project.findById(req.params.id);
  res.json(project);
});
```

### Application-Level Caching

```javascript
// In-memory caching with TTL
class Cache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }
  
  set(key, value, ttl = 300000) {
    this.cache.set(key, value);
    
    // Clear existing timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }
    
    // Set new timer
    const timer = setTimeout(() => {
      this.cache.delete(key);
      this.timers.delete(key);
    }, ttl);
    
    this.timers.set(key, timer);
  }
  
  get(key) {
    return this.cache.get(key);
  }
  
  delete(key) {
    this.cache.delete(key);
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
  }
  
  clear() {
    this.cache.clear();
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
  }
}

const cache = new Cache();

// Cached function wrapper
const cached = (fn, ttl = 300000) => {
  return async (...args) => {
    const key = `${fn.name}:${JSON.stringify(args)}`;
    const cached = cache.get(key);
    
    if (cached) {
      return cached;
    }
    
    const result = await fn(...args);
    cache.set(key, result, ttl);
    return result;
  };
};
```

## Monitoring and Profiling

### Performance Monitoring

```javascript
// Custom performance monitoring
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
  }
  
  startTimer(name) {
    this.metrics.set(name, {
      start: performance.now(),
      measurements: []
    });
  }
  
  endTimer(name) {
    const metric = this.metrics.get(name);
    if (metric) {
      const duration = performance.now() - metric.start;
      metric.measurements.push(duration);
      
      // Keep only last 100 measurements
      if (metric.measurements.length > 100) {
        metric.measurements.shift();
      }
    }
  }
  
  getStats(name) {
    const metric = this.metrics.get(name);
    if (!metric || metric.measurements.length === 0) {
      return null;
    }
    
    const measurements = metric.measurements;
    const avg = measurements.reduce((a, b) => a + b, 0) / measurements.length;
    const min = Math.min(...measurements);
    const max = Math.max(...measurements);
    
    return { avg, min, max, count: measurements.length };
  }
}

const monitor = new PerformanceMonitor();

// Usage
app.get('/api/items', async (req, res) => {
  monitor.startTimer('getItems');
  
  try {
    const items = await Item.find({ projectId: req.query.projectId });
    res.json(items);
  } finally {
    monitor.endTimer('getItems');
  }
});
```

### Error Tracking

```javascript
// Error monitoring
class ErrorTracker {
  constructor() {
    this.errors = [];
    this.maxErrors = 1000;
  }
  
  track(error, context = {}) {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date(),
      context
    };
    
    this.errors.push(errorInfo);
    
    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }
    
    // Send to external service
    this.sendToService(errorInfo);
  }
  
  async sendToService(errorInfo) {
    try {
      await fetch('https://error-tracking.service.com/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorInfo)
      });
    } catch (e) {
      console.error('Failed to send error to tracking service:', e);
    }
  }
  
  getStats() {
    const now = new Date();
    const lastHour = this.errors.filter(
      e => now - e.timestamp < 60 * 60 * 1000
    );
    
    return {
      total: this.errors.length,
      lastHour: lastHour.length,
      recent: this.errors.slice(-10)
    };
  }
}

const errorTracker = new ErrorTracker();

// Global error handler
process.on('uncaughtException', (error) => {
  errorTracker.track(error, { type: 'uncaughtException' });
});

process.on('unhandledRejection', (reason, promise) => {
  errorTracker.track(reason, { type: 'unhandledRejection', promise });
});
```

## Performance Testing

### Load Testing

```javascript
// Load testing with Artillery
// artillery.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 50
    - duration: 60
      arrivalRate: 100
  defaults:
    headers:
      Authorization: 'Bearer {{ $randomString() }}'

scenarios:
  - name: 'API Load Test'
    requests:
      - get:
          url: '/api/projects'
      - post:
          url: '/api/projects'
          json:
            name: 'Test Project'
            description: 'Load test project'
      - get:
          url: '/api/projects/{{ projectId }}/items'
```

### Benchmark Testing

```javascript
// Benchmark testing
import { performance } from 'perf_hooks';

class Benchmark {
  constructor(name) {
    this.name = name;
    this.tests = [];
  }
  
  addTest(name, fn) {
    this.tests.push({ name, fn });
  }
  
  async run(iterations = 1000) {
    console.log(`\nRunning benchmark: ${this.name}`);
    console.log('='.repeat(50));
    
    for (const test of this.tests) {
      const times = [];
      
      // Warm up
      for (let i = 0; i < 10; i++) {
        await test.fn();
      }
      
      // Benchmark
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        await test.fn();
        const end = performance.now();
        times.push(end - start);
      }
      
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      const min = Math.min(...times);
      const max = Math.max(...times);
      
      console.log(`${test.name}:`);
      console.log(`  Average: ${avg.toFixed(2)}ms`);
      console.log(`  Min: ${min.toFixed(2)}ms`);
      console.log(`  Max: ${max.toFixed(2)}ms`);
      console.log(`  Total: ${(times.reduce((a, b) => a + b, 0)).toFixed(2)}ms`);
    }
  }
}

// Usage
const benchmark = new Benchmark('Database Queries');

benchmark.addTest('Find by ID', async () => {
  await Item.findById('item_123');
});

benchmark.addTest('Find with filter', async () => {
  await Item.find({ projectId: 'proj_123', status: 'active' });
});

benchmark.addTest('Aggregation', async () => {
  await Item.aggregate([
    { $match: { projectId: 'proj_123' } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
});

benchmark.run(1000);
```

### Performance Budgets

```javascript
// Performance budget checking
class PerformanceBudget {
  constructor(budgets) {
    this.budgets = budgets;
  }
  
  checkMetrics(metrics) {
    const violations = [];
    
    for (const [metric, budget] of Object.entries(this.budgets)) {
      if (metrics[metric] > budget) {
        violations.push({
          metric,
          actual: metrics[metric],
          budget,
          overage: metrics[metric] - budget
        });
      }
    }
    
    return violations;
  }
  
  generateReport(metrics) {
    const violations = this.checkMetrics(metrics);
    
    console.log('\nPerformance Budget Report');
    console.log('='.repeat(40));
    
    for (const [metric, budget] of Object.entries(this.budgets)) {
      const actual = metrics[metric];
      const status = actual <= budget ? '✅' : '❌';
      console.log(`${status} ${metric}: ${actual}ms (budget: ${budget}ms)`);
    }
    
    if (violations.length > 0) {
      console.log('\n❌ Budget Violations:');
      violations.forEach(v => {
        console.log(`  - ${v.metric}: ${v.actual}ms (${v.overage}ms over budget)`);
      });
    }
  }
}

// Usage
const budget = new PerformanceBudget({
  'First Contentful Paint': 1500,
  'Largest Contentful Paint': 2500,
  'First Input Delay': 100,
  'API Response Time': 200
});

// Check performance after page load
window.addEventListener('load', () => {
  const metrics = {
    'First Contentful Paint': performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
    'Largest Contentful Paint': performance.getEntriesByName('largest-contentful-paint')[0]?.startTime,
    'First Input Delay': performance.getEntriesByName('first-input-delay')[0]?.processingStart,
    'API Response Time': averageApiResponseTime
  };
  
  budget.generateReport(metrics);
});
```

This performance guide provides comprehensive strategies for optimizing Project Name applications. Regular monitoring and testing are essential to maintain optimal performance as your application grows.
