const BeamPluginSandbox = require('../plugins/BeamPluginSandbox');
const BeamErrorHandler = require('../utils/BeamErrorHandler');
const BeamPerformanceMonitor = require('../utils/BeamPerformanceMonitor');

class BeamPluginSecurity {
    constructor() {
        this.securityRules = {
            // Rate limiting for plugin API calls
            rateLimits: {
                default: { windowMs: 15 * 60 * 1000, max: 100 }, // 15 minutes, 100 requests
                pluginApi: { windowMs: 60 * 1000, max: 50 }, // 1 minute, 50 requests
                pluginExecution: { windowMs: 60 * 1000, max: 10 } // 1 minute, 10 executions
            },
            
            // Allowed origins for plugin API calls
            allowedOrigins: process.env.PLUGIN_ALLOWED_ORIGINS ? 
                process.env.PLUGIN_ALLOWED_ORIGINS.split(',') : 
                ['http://localhost:3000', 'http://localhost:3001'],
            
            // Required headers for plugin API calls
            requiredHeaders: ['Content-Type', 'X-Plugin-ID', 'X-Plugin-Version'],
            
            // Blocked patterns in plugin requests
            blockedPatterns: [
                /\.\.\//g, // Path traversal
                /<script>/gi, // XSS
                /javascript:/gi, // JavaScript injection
                /data:text\/html/gi, // HTML injection
                /eval\s*\(/gi, // Code evaluation
                /Function\s*\(/gi // Function constructor
            ]
        };
        
        this.requestCounts = new Map();
        this.executionCounts = new Map();
    }

    /**
     * Apply plugin security middleware
     * @param {Object} app - Express app instance
     */
    applyPluginSecurityMiddleware(app) {
        // Plugin API routes security
        app.use('/api/plugins/*', this.validatePluginRequest.bind(this));
        app.use('/api/plugins/*', this.rateLimitPluginRequests.bind(this));
        app.use('/api/plugins/*', this.sanitizePluginInput.bind(this));
        app.use('/api/plugins/*', this.validatePluginPermissions.bind(this));
        
        // Plugin execution security
        app.use('/api/plugins/execute/*', this.validatePluginExecution.bind(this));
        app.use('/api/plugins/execute/*', this.rateLimitPluginExecution.bind(this));
        
        // Plugin installation security
        app.use('/api/plugins/install', this.validatePluginInstallation.bind(this));
        app.use('/api/plugins/install', this.scanPluginPackage.bind(this));
        
        console.log('Plugin security middleware applied');
    }

    /**
     * Validate plugin request headers and basic security
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    validatePluginRequest(req, res, next) {
        try {
            // Check origin
            const origin = req.get('Origin');
            if (origin && !this.securityRules.allowedOrigins.includes(origin)) {
                return res.status(403).json({
                    error: 'PluginSecurityError',
                    message: 'Origin not allowed for plugin API access',
                    code: 'PLUGIN_SECURITY_001'
                });
            }

            // Check required headers
            const pluginId = req.get('X-Plugin-ID');
            const pluginVersion = req.get('X-Plugin-Version');
            
            if (!pluginId) {
                return res.status(400).json({
                    error: 'PluginSecurityError',
                    message: 'X-Plugin-ID header required',
                    code: 'PLUGIN_SECURITY_002'
                });
            }

            if (!pluginVersion) {
                return res.status(400).json({
                    error: 'PluginSecurityError',
                    message: 'X-Plugin-Version header required',
                    code: 'PLUGIN_SECURITY_003'
                });
            }

            // Validate plugin ID format
            if (!/^[a-z0-9-]+$/.test(pluginId)) {
                return res.status(400).json({
                    error: 'PluginSecurityError',
                    message: 'Invalid plugin ID format',
                    code: 'PLUGIN_SECURITY_004'
                });
            }

            // Add plugin info to request
            req.pluginInfo = {
                id: pluginId,
                version: pluginVersion,
                timestamp: Date.now()
            };

            next();

        } catch (error) {
            BeamErrorHandler.logError('Plugin Request Validation Error', error);
            return res.status(500).json({
                error: 'PluginSecurityError',
                message: 'Internal security validation error',
                code: 'PLUGIN_SECURITY_005'
            });
        }
    }

    /**
     * Rate limit plugin API requests
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    rateLimitPluginRequests(req, res, next) {
        try {
            const pluginId = req.pluginInfo.id;
            const now = Date.now();
            const windowMs = this.securityRules.rateLimits.pluginApi.windowMs;
            const max = this.securityRules.rateLimits.pluginApi.max;

            // Get or create request count for this plugin
            if (!this.requestCounts.has(pluginId)) {
                this.requestCounts.set(pluginId, []);
            }

            const requests = this.requestCounts.get(pluginId);
            
            // Remove old requests outside the window
            const validRequests = requests.filter(timestamp => now - timestamp < windowMs);
            
            // Check if limit exceeded
            if (validRequests.length >= max) {
                return res.status(429).json({
                    error: 'PluginSecurityError',
                    message: 'Plugin API rate limit exceeded',
                    code: 'PLUGIN_SECURITY_006',
                    retryAfter: Math.ceil(windowMs / 1000)
                });
            }

            // Add current request
            validRequests.push(now);
            this.requestCounts.set(pluginId, validRequests);

            next();

        } catch (error) {
            BeamErrorHandler.logError('Plugin Rate Limit Error', error);
            next();
        }
    }

    /**
     * Sanitize plugin input data
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    sanitizePluginInput(req, res, next) {
        try {
            // Sanitize request body
            if (req.body) {
                req.body = this.sanitizeObject(req.body);
            }

            // Sanitize query parameters
            if (req.query) {
                req.query = this.sanitizeObject(req.query);
            }

            // Sanitize URL parameters
            if (req.params) {
                req.params = this.sanitizeObject(req.params);
            }

            next();

        } catch (error) {
            BeamErrorHandler.logError('Plugin Input Sanitization Error', error);
            return res.status(400).json({
                error: 'PluginSecurityError',
                message: 'Invalid input data detected',
                code: 'PLUGIN_SECURITY_007'
            });
        }
    }

    /**
     * Validate plugin permissions
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    validatePluginPermissions(req, res, next) {
        try {
            const pluginId = req.pluginInfo.id;
            
            // Get sandbox info
            const sandboxInfo = BeamPluginSandbox.getSandboxInfo(pluginId);
            if (!sandboxInfo) {
                return res.status(403).json({
                    error: 'PluginSecurityError',
                    message: 'Plugin sandbox not found',
                    code: 'PLUGIN_SECURITY_008'
                });
            }

            // Check if plugin is active
            if (!sandboxInfo.isActive) {
                return res.status(403).json({
                    error: 'PluginSecurityError',
                    message: 'Plugin is not active',
                    code: 'PLUGIN_SECURITY_009'
                });
            }

            // Check resource limits
            const { resourceUsage, limits } = sandboxInfo;
            
            if (resourceUsage.memoryUsage > limits.maxMemoryMB) {
                return res.status(429).json({
                    error: 'PluginSecurityError',
                    message: 'Plugin memory limit exceeded',
                    code: 'PLUGIN_SECURITY_010'
                });
            }

            if (resourceUsage.networkRequests > limits.maxNetworkRequests) {
                return res.status(429).json({
                    error: 'PluginSecurityError',
                    message: 'Plugin network request limit exceeded',
                    code: 'PLUGIN_SECURITY_011'
                });
            }

            // Add sandbox info to request
            req.sandboxInfo = sandboxInfo;

            next();

        } catch (error) {
            BeamErrorHandler.logError('Plugin Permission Validation Error', error);
            return res.status(500).json({
                error: 'PluginSecurityError',
                message: 'Internal permission validation error',
                code: 'PLUGIN_SECURITY_012'
            });
        }
    }

    /**
     * Validate plugin execution requests
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    validatePluginExecution(req, res, next) {
        try {
            const pluginId = req.pluginInfo.id;
            const { code } = req.body;

            if (!code || typeof code !== 'string') {
                return res.status(400).json({
                    error: 'PluginSecurityError',
                    message: 'Code execution requires valid code string',
                    code: 'PLUGIN_SECURITY_013'
                });
            }

            // Validate code length
            if (code.length > 10000) { // 10KB limit
                return res.status(400).json({
                    error: 'PluginSecurityError',
                    message: 'Code execution size limit exceeded',
                    code: 'PLUGIN_SECURITY_014'
                });
            }

            // Check for dangerous patterns
            for (const pattern of this.securityRules.blockedPatterns) {
                if (pattern.test(code)) {
                    return res.status(400).json({
                        error: 'PluginSecurityError',
                        message: 'Dangerous code pattern detected',
                        code: 'PLUGIN_SECURITY_015'
                    });
                }
            }

            // Validate against plugin permissions
            const sandboxInfo = req.sandboxInfo;
            try {
                BeamPluginSandbox.validateCode(code, sandboxInfo.permissions);
            } catch (error) {
                return res.status(403).json({
                    error: 'PluginSecurityError',
                    message: error.message,
                    code: 'PLUGIN_SECURITY_016'
                });
            }

            next();

        } catch (error) {
            BeamErrorHandler.logError('Plugin Execution Validation Error', error);
            return res.status(500).json({
                error: 'PluginSecurityError',
                message: 'Internal execution validation error',
                code: 'PLUGIN_SECURITY_017'
            });
        }
    }

    /**
     * Rate limit plugin execution
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    rateLimitPluginExecution(req, res, next) {
        try {
            const pluginId = req.pluginInfo.id;
            const now = Date.now();
            const windowMs = this.securityRules.rateLimits.pluginExecution.windowMs;
            const max = this.securityRules.rateLimits.pluginExecution.max;

            // Get or create execution count for this plugin
            if (!this.executionCounts.has(pluginId)) {
                this.executionCounts.set(pluginId, []);
            }

            const executions = this.executionCounts.get(pluginId);
            
            // Remove old executions outside the window
            const validExecutions = executions.filter(timestamp => now - timestamp < windowMs);
            
            // Check if limit exceeded
            if (validExecutions.length >= max) {
                return res.status(429).json({
                    error: 'PluginSecurityError',
                    message: 'Plugin execution rate limit exceeded',
                    code: 'PLUGIN_SECURITY_018',
                    retryAfter: Math.ceil(windowMs / 1000)
                });
            }

            // Add current execution
            validExecutions.push(now);
            this.executionCounts.set(pluginId, validExecutions);

            next();

        } catch (error) {
            BeamErrorHandler.logError('Plugin Execution Rate Limit Error', error);
            next();
        }
    }

    /**
     * Validate plugin installation
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    validatePluginInstallation(req, res, next) {
        try {
            // Check if user has admin privileges
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({
                    error: 'PluginSecurityError',
                    message: 'Admin privileges required for plugin installation',
                    code: 'PLUGIN_SECURITY_019'
                });
            }

            // Validate plugin package
            if (!req.files || !req.files.plugin) {
                return res.status(400).json({
                    error: 'PluginSecurityError',
                    message: 'Plugin package file required',
                    code: 'PLUGIN_SECURITY_020'
                });
            }

            const pluginFile = req.files.plugin;
            
            // Check file size (max 10MB)
            if (pluginFile.size > 10 * 1024 * 1024) {
                return res.status(400).json({
                    error: 'PluginSecurityError',
                    message: 'Plugin package size limit exceeded',
                    code: 'PLUGIN_SECURITY_021'
                });
            }

            // Check file type
            if (!pluginFile.mimetype.includes('zip') && !pluginFile.mimetype.includes('application/octet-stream')) {
                return res.status(400).json({
                    error: 'PluginSecurityError',
                    message: 'Invalid plugin package format',
                    code: 'PLUGIN_SECURITY_022'
                });
            }

            next();

        } catch (error) {
            BeamErrorHandler.logError('Plugin Installation Validation Error', error);
            return res.status(500).json({
                error: 'PluginSecurityError',
                message: 'Internal installation validation error',
                code: 'PLUGIN_SECURITY_023'
            });
        }
    }

    /**
     * Scan plugin package for security issues
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    async scanPluginPackage(req, res, next) {
        try {
            const pluginFile = req.files.plugin;
            
            // This would implement actual security scanning
            // For now, we'll do basic validation
            
            const scanResult = {
                isValid: true,
                threats: [],
                warnings: [],
                recommendations: []
            };

            // Add scan result to request
            req.pluginScanResult = scanResult;

            next();

        } catch (error) {
            BeamErrorHandler.logError('Plugin Package Scan Error', error);
            return res.status(500).json({
                error: 'PluginSecurityError',
                message: 'Plugin package scanning failed',
                code: 'PLUGIN_SECURITY_024'
            });
        }
    }

    /**
     * Sanitize object recursively
     * @param {any} obj - Object to sanitize
     * @returns {any} Sanitized object
     */
    sanitizeObject(obj) {
        if (typeof obj === 'string') {
            return this.sanitizeString(obj);
        } else if (Array.isArray(obj)) {
            return obj.map(item => this.sanitizeObject(item));
        } else if (obj && typeof obj === 'object') {
            const sanitized = {};
            for (const [key, value] of Object.entries(obj)) {
                sanitized[key] = this.sanitizeObject(value);
            }
            return sanitized;
        }
        return obj;
    }

    /**
     * Sanitize string
     * @param {string} str - String to sanitize
     * @returns {string} Sanitized string
     */
    sanitizeString(str) {
        let sanitized = str;

        // Remove HTML tags
        sanitized = sanitized.replace(/<[^>]*>/g, '');

        // Remove script tags
        sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

        // Remove dangerous patterns
        for (const pattern of this.securityRules.blockedPatterns) {
            sanitized = sanitized.replace(pattern, '');
        }

        // Remove null bytes
        sanitized = sanitized.replace(/\0/g, '');

        return sanitized;
    }

    /**
     * Get security statistics
     * @returns {Object} Security statistics
     */
    getSecurityStats() {
        return {
            requestCounts: Object.fromEntries(this.requestCounts),
            executionCounts: Object.fromEntries(this.executionCounts),
            securityRules: this.securityRules,
            timestamp: Date.now()
        };
    }

    /**
     * Reset rate limit counters
     * @param {string} pluginId - Optional plugin ID to reset
     */
    resetRateLimits(pluginId = null) {
        if (pluginId) {
            this.requestCounts.delete(pluginId);
            this.executionCounts.delete(pluginId);
        } else {
            this.requestCounts.clear();
            this.executionCounts.clear();
        }
    }
}

module.exports = new BeamPluginSecurity();
