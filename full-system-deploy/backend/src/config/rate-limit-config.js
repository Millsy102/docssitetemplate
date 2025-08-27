/**
 * Rate Limiting Configuration
 * 
 * This file contains all rate limiting settings for the BeamFlow API.
 * Adjust these values based on your application's needs and server capacity.
 */

module.exports = {
    // Global rate limiting settings
    global: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 1000, // 1000 requests per 15 minutes
        message: {
            error: 'Too many requests from this IP, please try again later.',
            retryAfter: '15 minutes'
        }
    },

    // API rate limiting settings
    api: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 500, // 500 requests per 15 minutes
        message: {
            error: 'API rate limit exceeded. Please try again later.',
            retryAfter: '15 minutes'
        }
    },

    // Authentication rate limiting settings
    auth: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5, // 5 login attempts per 15 minutes
        message: {
            error: 'Too many authentication attempts. Please try again later.',
            retryAfter: '15 minutes'
        },
        skipSuccessfulRequests: true // Don't count successful logins
    },

    // Admin rate limiting settings
    admin: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 2000, // 2000 requests per 15 minutes for admins
        message: {
            error: 'Admin rate limit exceeded.',
            retryAfter: '15 minutes'
        }
    },

    // File upload rate limiting settings
    upload: {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 10, // 10 uploads per hour
        message: {
            error: 'Too many file uploads. Please try again later.',
            retryAfter: '1 hour'
        }
    },

    // Search rate limiting settings
    search: {
        windowMs: 5 * 60 * 1000, // 5 minutes
        max: 100, // 100 searches per 5 minutes
        message: {
            error: 'Too many search requests. Please try again later.',
            retryAfter: '5 minutes'
        }
    },

    // Speed limiting settings (gradual slowdown instead of hard blocking)
    speedLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        delayAfter: 50, // Allow 50 requests per 15 minutes, then...
        delayMs: 500, // Add 500ms delay per request after limit
        maxDelayMs: 20000 // Maximum delay of 20 seconds
    },

    // Redis configuration (optional)
    redis: {
        enabled: process.env.REDIS_URL ? true : false,
        url: process.env.REDIS_URL || null,
        keyPrefix: 'rate-limit:',
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3
    },

    // Environment-specific overrides
    environments: {
        development: {
            global: { max: 2000 }, // More permissive in development
            api: { max: 1000 },
            auth: { max: 10 }
        },
        production: {
            // Use default values defined above
        },
        testing: {
            global: { max: 10000 }, // Very permissive for testing
            api: { max: 5000 },
            auth: { max: 50 }
        }
    },

    // Custom rate limit rules for specific endpoints
    customRules: {
        '/api/admin/users': {
            windowMs: 5 * 60 * 1000, // 5 minutes
            max: 50, // 50 requests per 5 minutes
            message: {
                error: 'Too many user management requests.',
                retryAfter: '5 minutes'
            }
        },
        '/api/admin/system': {
            windowMs: 60 * 60 * 1000, // 1 hour
            max: 20, // 20 system operations per hour
            message: {
                error: 'Too many system operations.',
                retryAfter: '1 hour'
            }
        }
    },

    // IP whitelist (IPs that bypass rate limiting)
    whitelist: process.env.RATE_LIMIT_WHITELIST ? 
        process.env.RATE_LIMIT_WHITELIST.split(',') : [],

    // IP blacklist (IPs that are completely blocked)
    blacklist: process.env.RATE_LIMIT_BLACKLIST ? 
        process.env.RATE_LIMIT_BLACKLIST.split(',') : [],

    // Rate limiting headers configuration
    headers: {
        enabled: true,
        limitHeader: 'X-RateLimit-Limit',
        remainingHeader: 'X-RateLimit-Remaining',
        resetHeader: 'X-RateLimit-Reset',
        retryAfterHeader: 'Retry-After'
    },

    // Logging configuration
    logging: {
        enabled: process.env.RATE_LIMIT_LOGGING === 'true',
        level: process.env.RATE_LIMIT_LOG_LEVEL || 'warn',
        logBlockedRequests: true,
        logWhitelistedRequests: false
    }
};
