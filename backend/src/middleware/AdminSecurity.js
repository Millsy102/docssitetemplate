const rateLimit = require('express-rate-limit');
const Redis = require('ioredis');
const ipRangeCheck = require('ip-range-check');

/**
 * Admin Security Middleware
 * Provides rate limiting and IP whitelist protection for admin routes
 */
class AdminSecurity {
    constructor() {
        this.redis = null;
        this.initializeRedis();
        this.setupRateLimiters();
    }

    /**
     * Initialize Redis connection for distributed rate limiting
     */
    initializeRedis() {
        try {
            if (process.env.REDIS_URI) {
                this.redis = new Redis(process.env.REDIS_URI, {
                    retryDelayOnFailover: 100,
                    maxRetriesPerRequest: 3,
                    lazyConnect: true
                });

                this.redis.on('error', (err) => {
                    console.warn('Redis connection failed, falling back to memory storage:', err.message);
                    this.redis = null;
                });

                this.redis.on('connect', () => {
                    console.log('Redis connected for admin rate limiting');
                });
            }
        } catch (error) {
            console.warn('Redis initialization failed, using memory storage:', error.message);
            this.redis = null;
        }
    }

    /**
     * Setup rate limiters with different configurations
     */
    setupRateLimiters() {
        // Strict rate limiter for admin authentication attempts
        this.authLimiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 5, // 5 attempts per 15 minutes
            message: {
                error: 'Too many authentication attempts. Please try again later.',
                retryAfter: '15 minutes'
            },
            standardHeaders: true,
            legacyHeaders: false,
            store: this.redis ? new (require('rate-limit-redis'))({
                sendCommand: (...args) => this.redis.call(...args),
            }) : undefined,
            keyGenerator: (req) => {
                return `admin_auth:${req.ip}`;
            },
            skip: (req) => {
                return this.isWhitelistedIP(req.ip);
            }
        });

        // General admin API rate limiter
        this.adminApiLimiter = rateLimit({
            windowMs: 5 * 60 * 1000, // 5 minutes
            max: 100, // 100 requests per 5 minutes
            message: {
                error: 'Too many admin API requests. Please try again later.',
                retryAfter: '5 minutes'
            },
            standardHeaders: true,
            legacyHeaders: false,
            store: this.redis ? new (require('rate-limit-redis'))({
                sendCommand: (...args) => this.redis.call(...args),
            }) : undefined,
            keyGenerator: (req) => {
                return `admin_api:${req.ip}`;
            },
            skip: (req) => {
                return this.isWhitelistedIP(req.ip);
            }
        });

        // Critical admin operations rate limiter
        this.criticalOpsLimiter = rateLimit({
            windowMs: 60 * 60 * 1000, // 1 hour
            max: 10, // 10 critical operations per hour
            message: {
                error: 'Too many critical operations. Please try again later.',
                retryAfter: '1 hour'
            },
            standardHeaders: true,
            legacyHeaders: false,
            store: this.redis ? new (require('rate-limit-redis'))({
                sendCommand: (...args) => this.redis.call(...args),
            }) : undefined,
            keyGenerator: (req) => {
                return `admin_critical:${req.ip}`;
            },
            skip: (req) => {
                return this.isWhitelistedIP(req.ip);
            }
        });
    }

    /**
     * Check if IP is whitelisted
     */
    isWhitelistedIP(ip) {
        const whitelist = this.getWhitelistedIPs();
        
        // Always allow localhost/127.0.0.1 in development
        if (process.env.NODE_ENV === 'development' && 
            (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost')) {
            return true;
        }

        return whitelist.some(allowedIP => {
            if (allowedIP.includes('/')) {
                // CIDR notation
                return ipRangeCheck(ip, allowedIP);
            } else if (allowedIP.includes('-')) {
                // IP range notation
                return ipRangeCheck(ip, allowedIP);
            } else {
                // Single IP
                return ip === allowedIP;
            }
        });
    }

    /**
     * Get whitelisted IPs from environment variables
     */
    getWhitelistedIPs() {
        const whitelist = process.env.ADMIN_IP_WHITELIST;
        if (!whitelist) {
            return [];
        }

        return whitelist.split(',').map(ip => ip.trim()).filter(ip => ip);
    }

    /**
     * IP whitelist middleware
     */
    requireWhitelistedIP(req, res, next) {
        const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
        
        if (this.isWhitelistedIP(clientIP)) {
            return next();
        }

        // Log unauthorized access attempt
        console.warn(`Unauthorized admin access attempt from IP: ${clientIP}`);
        
        return res.status(403).json({
            error: 'Access denied. Your IP is not authorized for admin access.',
            code: 'IP_NOT_WHITELISTED'
        });
    }

    /**
     * Combined admin security middleware
     */
    protectAdminRoutes(req, res, next) {
        // First check IP whitelist
        if (!this.isWhitelistedIP(req.ip)) {
            return res.status(403).json({
                error: 'Access denied. Your IP is not authorized for admin access.',
                code: 'IP_NOT_WHITELISTED'
            });
        }

        // Then apply rate limiting based on route
        if (req.path.includes('/auth') || req.path.includes('/login')) {
            return this.authLimiter(req, res, next);
        } else if (req.path.includes('/critical') || req.path.includes('/system')) {
            return this.criticalOpsLimiter(req, res, next);
        } else {
            return this.adminApiLimiter(req, res, next);
        }
    }

    /**
     * Get rate limit info for debugging
     */
    async getRateLimitInfo(ip) {
        if (!this.redis) {
            return { message: 'Redis not available, using memory storage' };
        }

        try {
            const authKey = `admin_auth:${ip}`;
            const apiKey = `admin_api:${ip}`;
            const criticalKey = `admin_critical:${ip}`;

            const [authCount, apiCount, criticalCount] = await Promise.all([
                this.redis.get(authKey),
                this.redis.get(apiKey),
                this.redis.get(criticalKey)
            ]);

            return {
                ip,
                whitelisted: this.isWhitelistedIP(ip),
                authAttempts: parseInt(authCount) || 0,
                apiRequests: parseInt(apiCount) || 0,
                criticalOperations: parseInt(criticalCount) || 0
            };
        } catch (error) {
            console.error('Error getting rate limit info:', error);
            return { error: 'Failed to get rate limit info' };
        }
    }

    /**
     * Reset rate limits for an IP (admin function)
     */
    async resetRateLimits(ip) {
        if (!this.redis) {
            return { message: 'Redis not available' };
        }

        try {
            const keys = [
                `admin_auth:${ip}`,
                `admin_api:${ip}`,
                `admin_critical:${ip}`
            ];

            await Promise.all(keys.map(key => this.redis.del(key)));

            return { message: 'Rate limits reset successfully' };
        } catch (error) {
            console.error('Error resetting rate limits:', error);
            return { error: 'Failed to reset rate limits' };
        }
    }

    /**
     * Add IP to whitelist (temporary, for development)
     */
    addToWhitelist(ip) {
        const currentWhitelist = this.getWhitelistedIPs();
        if (!currentWhitelist.includes(ip)) {
            const newWhitelist = [...currentWhitelist, ip];
            process.env.ADMIN_IP_WHITELIST = newWhitelist.join(',');
            console.log(`Added ${ip} to admin IP whitelist`);
        }
    }

    /**
     * Remove IP from whitelist
     */
    removeFromWhitelist(ip) {
        const currentWhitelist = this.getWhitelistedIPs();
        const newWhitelist = currentWhitelist.filter(allowedIP => allowedIP !== ip);
        process.env.ADMIN_IP_WHITELIST = newWhitelist.join(',');
        console.log(`Removed ${ip} from admin IP whitelist`);
    }
}

module.exports = new AdminSecurity();
