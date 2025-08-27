class BeamCache {
    constructor() {
        this.cache = new Map();
        this.tags = new Map();
        this.maxSize = parseInt(process.env.CACHE_MAX_SIZE) || 1000;
        this.defaultTTL = parseInt(process.env.CACHE_TTL) || 300000; // 5 minutes
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            evictions: 0
        };

        // Start cleanup interval
        this.startCleanup();
    }

    // Set cache entry with TTL
    set(key, value, ttl = this.defaultTTL) {
        const now = Date.now();
        const expiresAt = now + ttl;

        // Check if cache is full
        if (this.cache.size >= this.maxSize) {
            this.evictLRU();
        }

        this.cache.set(key, {
            value,
            expiresAt,
            createdAt: now,
            lastAccessed: now
        });

        this.stats.sets++;
        return true;
    }

    // Set cache entry with tags
    setWithTags(key, value, tags = [], ttl = this.defaultTTL) {
        const success = this.set(key, value, ttl);
        
        if (success) {
            // Add tags
            tags.forEach(tag => {
                if (!this.tags.has(tag)) {
                    this.tags.set(tag, new Set());
                }
                this.tags.get(tag).add(key);
            });
        }

        return success;
    }

    // Get cache entry
    get(key) {
        const entry = this.cache.get(key);
        
        if (!entry) {
            this.stats.misses++;
            return null;
        }

        // Check if expired
        if (Date.now() > entry.expiresAt) {
            this.delete(key);
            this.stats.misses++;
            return null;
        }

        // Update last accessed time
        entry.lastAccessed = Date.now();
        this.cache.set(key, entry);
        
        this.stats.hits++;
        return entry.value;
    }

    // Delete cache entry
    delete(key) {
        const deleted = this.cache.delete(key);
        if (deleted) {
            this.stats.deletes++;
            
            // Remove from all tags
            this.tags.forEach((keys, tag) => {
                keys.delete(key);
                if (keys.size === 0) {
                    this.tags.delete(tag);
                }
            });
        }
        return deleted;
    }

    // Invalidate by tag
    invalidateByTag(tag) {
        const keys = this.tags.get(tag);
        if (!keys) return 0;

        let deletedCount = 0;
        keys.forEach(key => {
            if (this.delete(key)) {
                deletedCount++;
            }
        });

        this.tags.delete(tag);
        return deletedCount;
    }

    // Invalidate by multiple tags
    invalidateByTags(tags) {
        let totalDeleted = 0;
        tags.forEach(tag => {
            totalDeleted += this.invalidateByTag(tag);
        });
        return totalDeleted;
    }

    // Clear all cache
    clear() {
        const size = this.cache.size;
        this.cache.clear();
        this.tags.clear();
        this.stats.deletes += size;
        return size;
    }

    // Get cache statistics
    getStats() {
        const now = Date.now();
        let expiredCount = 0;
        let totalSize = 0;

        // Count expired entries and calculate total size
        this.cache.forEach((entry, key) => {
            if (now > entry.expiresAt) {
                expiredCount++;
            }
            totalSize += this.estimateSize(entry.value);
        });

        const hitRate = this.stats.hits + this.stats.misses > 0 
            ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2) + '%'
            : '0%';

        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            usage: ((this.cache.size / this.maxSize) * 100).toFixed(2) + '%',
            expired: expiredCount,
            totalSize: this.formatBytes(totalSize),
            tags: this.tags.size,
            stats: {
                ...this.stats,
                hitRate
            }
        };
    }

    // Get cache keys
    keys() {
        return Array.from(this.cache.keys());
    }

    // Get cache entries by tag
    getByTag(tag) {
        const keys = this.tags.get(tag);
        if (!keys) return [];

        const entries = [];
        keys.forEach(key => {
            const value = this.get(key);
            if (value !== null) {
                entries.push({ key, value });
            }
        });

        return entries;
    }

    // Check if key exists
    has(key) {
        const entry = this.cache.get(key);
        if (!entry) return false;
        
        if (Date.now() > entry.expiresAt) {
            this.delete(key);
            return false;
        }
        
        return true;
    }

    // Get cache entry info
    getInfo(key) {
        const entry = this.cache.get(key);
        if (!entry) return null;

        const now = Date.now();
        if (now > entry.expiresAt) {
            this.delete(key);
            return null;
        }

        return {
            key,
            value: entry.value,
            createdAt: entry.createdAt,
            lastAccessed: entry.lastAccessed,
            expiresAt: entry.expiresAt,
            ttl: entry.expiresAt - now,
            size: this.estimateSize(entry.value)
        };
    }

    // Evict least recently used entry
    evictLRU() {
        let oldestKey = null;
        let oldestTime = Date.now();

        this.cache.forEach((entry, key) => {
            if (entry.lastAccessed < oldestTime) {
                oldestTime = entry.lastAccessed;
                oldestKey = key;
            }
        });

        if (oldestKey) {
            this.delete(oldestKey);
            this.stats.evictions++;
        }
    }

    // Start cleanup interval
    startCleanup() {
        setInterval(() => {
            this.cleanup();
        }, 60000); // Clean up every minute
    }

    // Clean up expired entries
    cleanup() {
        const now = Date.now();
        let cleanedCount = 0;

        this.cache.forEach((entry, key) => {
            if (now > entry.expiresAt) {
                this.delete(key);
                cleanedCount++;
            }
        });

        if (cleanedCount > 0) {
            console.log(`Cache cleanup: removed ${cleanedCount} expired entries`);
        }
    }

    // Estimate size of cached value
    estimateSize(value) {
        if (typeof value === 'string') {
            return value.length * 2; // UTF-16 characters
        } else if (typeof value === 'number') {
            return 8; // 64-bit number
        } else if (typeof value === 'boolean') {
            return 1;
        } else if (value === null || value === undefined) {
            return 0;
        } else if (typeof value === 'object') {
            return JSON.stringify(value).length * 2;
        }
        return 0;
    }

    // Format bytes
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Reset statistics
    resetStats() {
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            evictions: 0
        };
    }
}

module.exports = new BeamCache();
