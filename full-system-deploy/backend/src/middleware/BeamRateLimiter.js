const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const Redis = require('ioredis');
const config = require('../config/rate-limit-config');

class BeamRateLimiter {
    constructor() {
        this.redis = null;
        this.initializeRedis();
        this.setupLimiters();
    }

    async initializeRedis() {
        try {
            // Use Redis for distributed rate limiting if available
            if (config.redis.enabled && config.redis.url) {
                this.redis = new Redis(config.redis.url, {
                    retryDelayOnFailover: config.redis.retryDelayOnFailover,
                    maxRetriesPerRequest: config.redis.maxRetriesPerRequest
                });
                console.log('Rate limiter using Redis for distributed limiting');
            } else {
                console.log('Rate limiter using in-memory storage');
            }
        } catch (error) {
            console.warn('Redis connection failed, using in-memory rate limiting:', error.message);
        }
    }

    setupLimiters() {
        // Get environment-specific configuration
        const env = process.env.NODE_ENV || 'development';
        const envConfig = config.environments[env] || {};
        
        // Global rate limiter - very permissive for general traffic
        this.globalLimiter = rateLimit({
            windowMs: config.global.windowMs,
            max: envConfig.global?.max || config.global.max,
            message: config.global.message,
            standardHeaders: config.headers.enabled,
            legacyHeaders: false,
            skipSuccessfulRequests: false,
            skipFailedRequests: false,
            keyGenerator: (req) => {
                const ip = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
                
                // Check whitelist
                if (config.whitelist.includes(ip)) {
                    return `whitelisted:${ip}`;
                }
                
                // Check blacklist
                if (config.blacklist.includes(ip)) {
                    return `blacklisted:${ip}`;
                }
                
                return ip;
            },
            handler: (req, res) => {
                const ip = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
                
                // Log blocked requests if enabled
                if (config.logging.enabled && config.logging.logBlockedRequests) {
                    console.warn(`Rate limit exceeded for IP: ${ip}, Path: ${req.path}`);
                }
                
                res.status(429).json({
                    error: config.global.message.error,
                    retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
                    limit: req.rateLimit.limit,
                    remaining: req.rateLimit.remaining
                });
            }
        });

        // API rate limiter - stricter for API endpoints
        this.apiLimiter = rateLimit({
            windowMs: config.api.windowMs,
            max: envConfig.api?.max || config.api.max,
            message: config.api.message,
            standardHeaders: config.headers.enabled,
            legacyHeaders: false,
            skipSuccessfulRequests: false,
            skipFailedRequests: false,
            keyGenerator: (req) => {
                const ip = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
                
                // Check whitelist
                if (config.whitelist.includes(ip)) {
                    return `whitelisted:${ip}`;
                }
                
                // Use API key if available, otherwise use IP
                return req.headers['x-api-key'] || 
                       req.headers['authorization'] || 
                       ip;
            },
            handler: (req, res) => {
                const ip = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
                
                if (config.logging.enabled && config.logging.logBlockedRequests) {
                    console.warn(`API rate limit exceeded for IP: ${ip}, Path: ${req.path}`);
                }
                
                res.status(429).json({
                    error: config.api.message.error,
                    retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
                    limit: req.rateLimit.limit,
                    remaining: req.rateLimit.remaining
                });
            }
        });

        // Authentication rate limiter - very strict for login attempts
        this.authLimiter = rateLimit({
            windowMs: config.auth.windowMs,
            max: envConfig.auth?.max || config.auth.max,
            message: config.auth.message,
            standardHeaders: config.headers.enabled,
            legacyHeaders: false,
            skipSuccessfulRequests: config.auth.skipSuccessfulRequests,
            skipFailedRequests: false,
            keyGenerator: (req) => {
                const ip = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
                
                // Check whitelist
                if (config.whitelist.includes(ip)) {
                    return `whitelisted:${ip}`;
                }
                
                return ip;
            },
            handler: (req, res) => {
                const ip = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
                
                if (config.logging.enabled && config.logging.logBlockedRequests) {
                    console.warn(`Auth rate limit exceeded for IP: ${ip}, Path: ${req.path}`);
                }
                
                res.status(429).json({
                    error: config.auth.message.error,
                    retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
                    limit: req.rateLimit.limit,
                    remaining: req.rateLimit.remaining
                });
            }
        });

        // Admin rate limiter - more permissive for admin users
        this.adminLimiter = rateLimit({
            windowMs: config.admin.windowMs,
            max: envConfig.admin?.max || config.admin.max,
            message: config.admin.message,
            standardHeaders: config.headers.enabled,
            legacyHeaders: false,
            skipSuccessfulRequests: false,
            skipFailedRequests: false,
            keyGenerator: (req) => {
                const ip = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
                
                // Check whitelist
                if (config.whitelist.includes(ip)) {
                    return `whitelisted:${ip}`;
                }
                
                return req.headers['x-admin-token'] || 
                       req.headers['x-api-key'] || 
                       req.headers['authorization'] || 
                       ip;
            },
            handler: (req, res) => {
                const ip = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
                
                if (config.logging.enabled && config.logging.logBlockedRequests) {
                    console.warn(`Admin rate limit exceeded for IP: ${ip}, Path: ${req.path}`);
                }
                
                res.status(429).json({
                    error: config.admin.message.error,
                    retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
                    limit: req.rateLimit.limit,
                    remaining: req.rateLimit.remaining
                });
            }
        });

        // File upload rate limiter - strict for file operations
        this.uploadLimiter = rateLimit({
            windowMs: config.upload.windowMs,
            max: envConfig.upload?.max || config.upload.max,
            message: config.upload.message,
            standardHeaders: config.headers.enabled,
            legacyHeaders: false,
            skipSuccessfulRequests: false,
            skipFailedRequests: false,
            keyGenerator: (req) => {
                const ip = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
                
                if (config.whitelist.includes(ip)) {
                    return `whitelisted:${ip}`;
                }
                
                return ip;
            },
            handler: (req, res) => {
                const ip = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
                
                if (config.logging.enabled && config.logging.logBlockedRequests) {
                    console.warn(`Upload rate limit exceeded for IP: ${ip}, Path: ${req.path}`);
                }
                
                res.status(429).json({
                    error: config.upload.message.error,
                    retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
                    limit: req.rateLimit.limit,
                    remaining: req.rateLimit.remaining
                });
            }
        });

        // Search rate limiter - moderate for search operations
        this.searchLimiter = rateLimit({
            windowMs: config.search.windowMs,
            max: envConfig.search?.max || config.search.max,
            message: config.search.message,
            standardHeaders: config.headers.enabled,
            legacyHeaders: false,
            skipSuccessfulRequests: false,
            skipFailedRequests: false,
            keyGenerator: (req) => {
                const ip = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
                
                if (config.whitelist.includes(ip)) {
                    return `whitelisted:${ip}`;
                }
                
                return ip;
            },
            handler: (req, res) => {
                const ip = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
                
                if (config.logging.enabled && config.logging.logBlockedRequests) {
                    console.warn(`Search rate limit exceeded for IP: ${ip}, Path: ${req.path}`);
                }
                
                res.status(429).json({
                    error: config.search.message.error,
                    retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
                    limit: req.rateLimit.limit,
                    remaining: req.rateLimit.remaining
                });
            }
        });

        // Speed limiter - slows down requests instead of blocking them
        this.speedLimiter = slowDown({
            windowMs: config.speedLimit.windowMs,
            delayAfter: config.speedLimit.delayAfter,
            delayMs: config.speedLimit.delayMs,
            maxDelayMs: config.speedLimit.maxDelayMs,
            keyGenerator: (req) => {
                const ip = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
                
                if (config.whitelist.includes(ip)) {
                    return `whitelisted:${ip}`;
                }
                
                return ip;
            }
        });
    }

    // Apply rate limiting middleware to the app
    applyRateLimiting(app) {
        // Global speed limiting
        app.use(this.speedLimiter);

        // Global rate limiting for all routes
        app.use(this.globalLimiter);

        // API-specific rate limiting
        app.use('/api', this.apiLimiter);

        // Authentication rate limiting
        app.use('/api/auth', this.authLimiter);

        // Admin rate limiting
        app.use('/admin', this.adminLimiter);
        app.use('/api/admin', this.adminLimiter);

        // File upload rate limiting
        app.use('/api/upload', this.uploadLimiter);
        app.use('/api/files', this.uploadLimiter);

        // Search rate limiting
        app.use('/api/search', this.searchLimiter);

        // Health check and metrics endpoints (no rate limiting)
        app.use('/health', (req, res, next) => next());
        app.use('/metrics', (req, res, next) => next());
    }

    // Get rate limit status for a specific key
    async getRateLimitStatus(key, limiterType = 'api') {
        if (!this.redis) {
            return null; // In-memory storage doesn't support status queries
        }

        try {
            const limiter = this.getLimiterByType(limiterType);
            if (!limiter) return null;

            // This is a simplified version - in practice you'd need to implement
            // the specific logic for each limiter type
            const keyPrefix = `rate-limit:${limiterType}:${key}`;
            const current = await this.redis.get(keyPrefix);
            
            return {
                key,
                type: limiterType,
                current: parseInt(current) || 0,
                limit: limiter.limit,
                windowMs: limiter.windowMs
            };
        } catch (error) {
            console.error('Error getting rate limit status:', error);
            return null;
        }
    }

    getLimiterByType(type) {
        const limiters = {
            'global': this.globalLimiter,
            'api': this.apiLimiter,
            'auth': this.authLimiter,
            'admin': this.adminLimiter,
            'upload': this.uploadLimiter,
            'search': this.searchLimiter
        };
        return limiters[type];
    }

    // Reset rate limit for a specific key (admin function)
    async resetRateLimit(key, limiterType = 'api') {
        if (!this.redis) {
            return false; // In-memory storage doesn't support resets
        }

        try {
            const keyPrefix = `rate-limit:${limiterType}:${key}`;
            await this.redis.del(keyPrefix);
            return true;
        } catch (error) {
            console.error('Error resetting rate limit:', error);
            return false;
        }
    }

    // Get rate limiting statistics
    getStats() {
        return {
            global: {
                windowMs: this.globalLimiter.windowMs,
                max: this.globalLimiter.max
            },
            api: {
                windowMs: this.apiLimiter.windowMs,
                max: this.apiLimiter.max
            },
            auth: {
                windowMs: this.authLimiter.windowMs,
                max: this.authLimiter.max
            },
            admin: {
                windowMs: this.adminLimiter.windowMs,
                max: this.adminLimiter.max
            },
            upload: {
                windowMs: this.uploadLimiter.windowMs,
                max: this.uploadLimiter.max
            },
            search: {
                windowMs: this.searchLimiter.windowMs,
                max: this.searchLimiter.max
            },
            speedLimiter: {
                windowMs: this.speedLimiter.windowMs,
                delayAfter: this.speedLimiter.delayAfter,
                delayMs: this.speedLimiter.delayMs,
                maxDelayMs: this.speedLimiter.maxDelayMs
            }
        };
    }

    // Cleanup method
    async cleanup() {
        if (this.redis) {
            await this.redis.quit();
        }
    }
}

module.exports = BeamRateLimiter;
