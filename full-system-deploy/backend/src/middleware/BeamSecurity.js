const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const xss = require('xss-clean');
const { securityHeadersConfig, customHeaders, corsConfig, rateLimitConfig } = require('../config/security-headers');

class BeamSecurity {
    constructor() {
        this.apiLimiter = rateLimit(rateLimitConfig.api);
        this.generalLimiter = rateLimit(rateLimitConfig.general);
    }

    applySecurityMiddleware(app) {
        // Enhanced Helmet.js configuration with centralized security headers
        app.use(helmet(securityHeadersConfig));

        // Additional custom security headers
        app.use((req, res, next) => {
            // Remove server information
            customHeaders.removeHeaders.forEach(header => {
                res.removeHeader(header);
            });
            
            // Set additional security headers
            Object.entries(customHeaders.additionalHeaders).forEach(([key, value]) => {
                res.setHeader(key, value);
            });
            
            // Cache control for sensitive pages
            if (req.path.startsWith('/api/') || req.path.startsWith('/admin/')) {
                Object.entries(customHeaders.sensitivePageCache).forEach(([key, value]) => {
                    res.setHeader(key, value);
                });
            }
            
            // Feature Policy (for older browsers)
            res.setHeader('Feature-Policy', customHeaders.featurePolicy);
            
            next();
        });

        // Enhanced CORS configuration
        app.use(cors(corsConfig));

        // XSS protection
        app.use(xss());

        // Request size limiting
        app.use(express.json({ limit: '10mb' }));
        app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Apply rate limiters
        app.use('/api', this.apiLimiter);
        app.use('/', this.generalLimiter);
    }

    getApiLimiter() {
        return this.apiLimiter;
    }

    getGeneralLimiter() {
        return this.generalLimiter;
    }

    sanitizeInput(input) {
        if (typeof input === 'string') {
            // Remove HTML tags and scripts
            return input.replace(/<[^>]*>/g, '').replace(/javascript:/gi, '');
        }
        return input;
    }

    sanitizeObject(obj) {
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'object' && value !== null) {
                sanitized[key] = this.sanitizeObject(value);
            } else {
                sanitized[key] = this.sanitizeInput(value);
            }
        }
        return sanitized;
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validateUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
}

module.exports = BeamSecurity;
