const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

class BeamRequestTracker {
    constructor() {
        this.requestLogs = new Map();
        this.maxLogSize = parseInt(process.env.MAX_REQUEST_LOG_SIZE) || 10000;
        this.logRetentionMs = parseInt(process.env.REQUEST_LOG_RETENTION_MS) || 24 * 60 * 60 * 1000; // 24 hours
        this.debugMode = process.env.DEBUG_MODE === 'true';
        
        // Clean up old logs periodically
        this.startCleanupInterval();
    }

    /**
     * Generate a unique request identifier
     * @returns {string} Unique request ID
     */
    generateRequestId() {
        return uuidv4();
    }

    /**
     * Generate a shorter request ID for logging
     * @returns {string} Short request ID
     */
    generateShortRequestId() {
        return crypto.randomBytes(8).toString('hex');
    }

    /**
     * Create request tracking middleware
     * @returns {Function} Express middleware function
     */
    createTrackingMiddleware() {
        return (req, res, next) => {
            const requestId = this.generateRequestId();
            const shortId = this.generateShortRequestId();
            const timestamp = Date.now();

            // Add request ID to request object
            req.requestId = requestId;
            req.shortRequestId = shortId;
            req.requestStartTime = timestamp;

            // Add request ID to response headers
            res.setHeader('X-Request-ID', requestId);
            res.setHeader('X-Request-ID-Short', shortId);

            // Create request log entry
            const requestLog = {
                id: requestId,
                shortId: shortId,
                timestamp: timestamp,
                method: req.method,
                url: req.url,
                path: req.path,
                query: req.query,
                headers: this.sanitizeHeaders(req.headers),
                ip: req.ip || req.connection.remoteAddress,
                userAgent: req.get('User-Agent'),
                body: this.sanitizeBody(req.body),
                status: null,
                responseTime: null,
                error: null,
                completed: false
            };

            // Store request log
            this.requestLogs.set(requestId, requestLog);

            // Log request start
            if (this.debugMode) {
                console.log(`[${shortId}] ${req.method} ${req.path} - Request started`);
            }

            // Override res.send to capture response data
            const originalSend = res.send;
            res.send = function(data) {
                const responseTime = Date.now() - timestamp;
                
                // Update request log
                this.updateRequestLog(requestId, {
                    status: res.statusCode,
                    responseTime: responseTime,
                    completed: true,
                    responseBody: this.sanitizeResponse(data)
                });

                // Log request completion
                if (this.debugMode) {
                    const statusColor = res.statusCode < 400 ? '\x1b[32m' : '\x1b[31m'; // Green for success, red for error
                    console.log(`${statusColor}[${shortId}] ${req.method} ${req.path} - ${res.statusCode} (${responseTime}ms)\x1b[0m`);
                }

                // Call original send
                originalSend.call(this, data);
            }.bind(this);

            // Override res.json to capture JSON responses
            const originalJson = res.json;
            res.json = function(data) {
                const responseTime = Date.now() - timestamp;
                
                // Update request log
                this.updateRequestLog(requestId, {
                    status: res.statusCode,
                    responseTime: responseTime,
                    completed: true,
                    responseBody: this.sanitizeResponse(data)
                });

                // Call original json
                originalJson.call(this, data);
            }.bind(this);

            // Handle errors
            res.on('error', (error) => {
                this.updateRequestLog(requestId, {
                    error: {
                        message: error.message,
                        stack: error.stack,
                        timestamp: Date.now()
                    }
                });
            });

            next();
        };
    }

    /**
     * Update request log with additional data
     * @param {string} requestId - Request ID
     * @param {Object} updates - Data to update
     */
    updateRequestLog(requestId, updates) {
        const log = this.requestLogs.get(requestId);
        if (log) {
            Object.assign(log, updates);
            this.requestLogs.set(requestId, log);
        }
    }

    /**
     * Get request log by ID
     * @param {string} requestId - Request ID
     * @returns {Object|null} Request log or null if not found
     */
    getRequestLog(requestId) {
        return this.requestLogs.get(requestId) || null;
    }

    /**
     * Get all request logs
     * @param {Object} filters - Optional filters
     * @returns {Array} Array of request logs
     */
    getAllRequestLogs(filters = {}) {
        let logs = Array.from(this.requestLogs.values());

        // Apply filters
        if (filters.method) {
            logs = logs.filter(log => log.method === filters.method);
        }
        if (filters.status) {
            logs = logs.filter(log => log.status === filters.status);
        }
        if (filters.path) {
            logs = logs.filter(log => log.path.includes(filters.path));
        }
        if (filters.completed !== undefined) {
            logs = logs.filter(log => log.completed === filters.completed);
        }
        if (filters.since) {
            logs = logs.filter(log => log.timestamp >= filters.since);
        }
        if (filters.until) {
            logs = logs.filter(log => log.timestamp <= filters.until);
        }

        // Sort by timestamp (newest first)
        return logs.sort((a, b) => b.timestamp - a.timestamp);
    }

    /**
     * Get request statistics
     * @returns {Object} Request statistics
     */
    getRequestStats() {
        const logs = Array.from(this.requestLogs.values());
        const completed = logs.filter(log => log.completed);
        const errors = logs.filter(log => log.error || (log.status && log.status >= 400));

        return {
            total: logs.length,
            completed: completed.length,
            pending: logs.length - completed.length,
            errors: errors.length,
            averageResponseTime: completed.length > 0 
                ? completed.reduce((sum, log) => sum + (log.responseTime || 0), 0) / completed.length 
                : 0,
            statusCodes: this.getStatusCodeDistribution(completed),
            methods: this.getMethodDistribution(logs),
            endpoints: this.getEndpointDistribution(logs)
        };
    }

    /**
     * Get status code distribution
     * @param {Array} logs - Request logs
     * @returns {Object} Status code counts
     */
    getStatusCodeDistribution(logs) {
        const distribution = {};
        logs.forEach(log => {
            if (log.status) {
                distribution[log.status] = (distribution[log.status] || 0) + 1;
            }
        });
        return distribution;
    }

    /**
     * Get method distribution
     * @param {Array} logs - Request logs
     * @returns {Object} Method counts
     */
    getMethodDistribution(logs) {
        const distribution = {};
        logs.forEach(log => {
            distribution[log.method] = (distribution[log.method] || 0) + 1;
        });
        return distribution;
    }

    /**
     * Get endpoint distribution
     * @param {Array} logs - Request logs
     * @returns {Object} Endpoint counts
     */
    getEndpointDistribution(logs) {
        const distribution = {};
        logs.forEach(log => {
            distribution[log.path] = (distribution[log.path] || 0) + 1;
        });
        return distribution;
    }

    /**
     * Clear old request logs
     */
    clearOldLogs() {
        const cutoffTime = Date.now() - this.logRetentionMs;
        for (const [requestId, log] of this.requestLogs.entries()) {
            if (log.timestamp < cutoffTime) {
                this.requestLogs.delete(requestId);
            }
        }
    }

    /**
     * Start cleanup interval
     */
    startCleanupInterval() {
        setInterval(() => {
            this.clearOldLogs();
        }, 60 * 60 * 1000); // Clean up every hour
    }

    /**
     * Sanitize headers for logging (remove sensitive data)
     * @param {Object} headers - Request headers
     * @returns {Object} Sanitized headers
     */
    sanitizeHeaders(headers) {
        const sanitized = { ...headers };
        const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];
        
        sensitiveHeaders.forEach(header => {
            if (sanitized[header]) {
                sanitized[header] = '[REDACTED]';
            }
        });
        
        return sanitized;
    }

    /**
     * Sanitize request body for logging
     * @param {any} body - Request body
     * @returns {any} Sanitized body
     */
    sanitizeBody(body) {
        if (!body) return body;
        
        const sanitized = { ...body };
        const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];
        
        sensitiveFields.forEach(field => {
            if (sanitized[field]) {
                sanitized[field] = '[REDACTED]';
            }
        });
        
        return sanitized;
    }

    /**
     * Sanitize response body for logging
     * @param {any} data - Response data
     * @returns {any} Sanitized response data
     */
    sanitizeResponse(data) {
        if (!data) return data;
        
        // For large responses, just log the first 1000 characters
        const stringData = typeof data === 'string' ? data : JSON.stringify(data);
        return stringData.length > 1000 ? stringData.substring(0, 1000) + '...' : stringData;
    }

    /**
     * Clear all request logs
     */
    clearAllLogs() {
        this.requestLogs.clear();
    }

    /**
     * Export request logs for debugging
     * @param {string} requestId - Optional specific request ID
     * @returns {Object} Exported logs
     */
    exportLogs(requestId = null) {
        if (requestId) {
            return this.getRequestLog(requestId);
        }
        
        return {
            stats: this.getRequestStats(),
            logs: this.getAllRequestLogs(),
            timestamp: Date.now()
        };
    }
}

// Create singleton instance
const requestTracker = new BeamRequestTracker();

module.exports = requestTracker;
