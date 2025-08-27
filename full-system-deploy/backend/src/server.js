const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');

// Import environment validation
const { enforceEnvironmentValidation, getEnvVar, getIntegerEnvVar } = require('./config/env-validator');

// Import strengthened system components
const BeamSecurity = require('./middleware/BeamSecurity');
const BeamAuth = require('./middleware/BeamAuth');
const BeamRateLimiter = require('./middleware/BeamRateLimiter');
const BeamPerformanceMonitor = require('./utils/BeamPerformanceMonitor');
const BeamRequestTracker = require('./utils/BeamRequestTracker');
const BeamCache = require('./utils/BeamCache');
const BeamErrorHandler = require('./utils/BeamErrorHandler');
const BeamValidator = require('./utils/BeamValidator');

// Import database and services
const beamDatabase = require('./database/BeamDatabase');
const BeamUserService = require('./services/BeamUserService');
const BeamFileService = require('./services/BeamFileService');

// Import new private system components
const BeamFtpServer = require('./ftp-server');
const BeamSshServer = require('./ssh-server');
const BeamPluginManager = require('./plugins/BeamPluginManager');
const BeamAdminDashboard = require('./admin/BeamAdminDashboard');
const BeamPCLinkService = require('./services/BeamPCLinkService');
const BeamPCLinkDashboard = require('./admin/BeamPCLinkDashboard');

class BeamServer {
    constructor() {
        // Enforce environment validation before initializing
        enforceEnvironmentValidation();
        
        this.app = express();
        this.server = null;
        this.port = getIntegerEnvVar('PORT', 3000);
        this.isProduction = getEnvVar('NODE_ENV', 'development') === 'production';
        
        // Initialize rate limiter
        this.rateLimiter = new BeamRateLimiter();
        
        this.initializeSystem();
    }

    /**
     * Initialize the entire system
     */
    async initializeSystem() {
        try {
            console.log(' Initializing BeamFlow System...');
            
            // Connect to databases
            await beamDatabase.connect();
            console.log(' Database connections established');
            
            // Setup middleware and routes
            this.setupMiddleware();
            this.setupRoutes();
            this.setupErrorHandling();
            
                    // Initialize private services
        await this.initializePrivateServices();
        
        // Initialize PC Link service
        this.pcLinkService = new BeamPCLinkService();
            
            console.log(' BeamFlow System initialized successfully');
            
        } catch (error) {
            console.error(' System initialization failed:', error);
            process.exit(1);
        }
    }

    // Setup middleware
    setupMiddleware() {
        // Apply security middleware (without rate limiting - we'll use our own)
        BeamSecurity.applySecurityMiddleware(this.app);

        // Apply comprehensive rate limiting
        this.rateLimiter.applyRateLimiting(this.app);

        // Request tracking (must be early in middleware chain)
        this.app.use(BeamRequestTracker.createTrackingMiddleware());

        // Performance monitoring
        this.app.use(BeamPerformanceMonitor.recordRequest.bind(BeamPerformanceMonitor));

        // Compression
        this.app.use(compression());

        // Static file serving with caching
        this.app.use(express.static(path.join(__dirname, '../dist'), {
            maxAge: this.isProduction ? '1y' : '0',
            etag: true,
            lastModified: true
        }));

        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Request logging
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
            next();
        });

        // Authentication configuration endpoint
        this.app.get('/api/auth/config', (req, res) => {
            const hasCredentials = !!(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD);
            res.json({
                useEnvironmentCredentials: hasCredentials,
                hasOAuth: !!(process.env.GH_CLIENT_ID && process.env.GH_CLIENT_SECRET),
                // Don't send actual credentials to client
                adminUsername: hasCredentials ? process.env.ADMIN_USERNAME : null,
                adminPassword: null // Never send password to client
            });
        });

        // Execute plugin hooks for requests
        this.app.use(async (req, res, next) => {
            try {
                await BeamPluginManager.executeHook('onRequest', req, res);
                next();
            } catch (error) {
                next(error);
            }
        });
    }

    // Setup routes
    setupRoutes() {
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            const health = BeamPerformanceMonitor.getHealthStatus();
            res.json({
                status: health.status,
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                version: process.env.npm_package_version || '1.0.0'
            });
        });

        // Metrics endpoint (admin only)
        this.app.get('/metrics', this.requireAdminApiKey, (req, res) => {
            const metrics = {
                performance: BeamPerformanceMonitor.getStats(),
                cache: BeamCache.getStats(),
                errors: BeamErrorHandler.getErrorStats(),
                rateLimiting: this.rateLimiter.getStats()
            };
            res.json(metrics);
        });

        // Admin dashboard routes
        this.app.use('/admin', BeamAdminDashboard.getRouter());
        
        // PC Link dashboard routes
        const pcLinkDashboard = new BeamPCLinkDashboard(this.pcLinkService);
        this.app.use('/', pcLinkDashboard.getRouter());

        // Cache management endpoints (admin only)
        this.app.get('/api/cache/stats', this.requireAdminApiKey, (req, res) => {
            res.json(BeamCache.getStats());
        });

        this.app.post('/api/cache/clear', this.requireAdminApiKey, (req, res) => {
            const clearedCount = BeamCache.clear();
            res.json({
                success: true,
                message: `Cache cleared. ${clearedCount} entries removed.`
            });
        });

        // Rate limiting management endpoints (admin only)
        this.app.get('/api/rate-limit/stats', this.requireAdminApiKey, (req, res) => {
            res.json(this.rateLimiter.getStats());
        });

        this.app.get('/api/rate-limit/status/:key/:type', this.requireAdminApiKey, async (req, res) => {
            try {
                const { key, type } = req.params;
                const status = await this.rateLimiter.getRateLimitStatus(key, type);
                res.json(status);
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        this.app.post('/api/rate-limit/reset/:key/:type', this.requireAdminApiKey, async (req, res) => {
            try {
                const { key, type } = req.params;
                const success = await this.rateLimiter.resetRateLimit(key, type);
                res.json({
                    success,
                    message: success ? 'Rate limit reset successfully' : 'Failed to reset rate limit'
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Request tracking endpoints (admin only)
        this.app.get('/api/requests/stats', this.requireAdminApiKey, (req, res) => {
            try {
                const stats = BeamRequestTracker.getRequestStats();
                res.json({
                    success: true,
                    stats
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        this.app.get('/api/requests/logs', this.requireAdminApiKey, (req, res) => {
            try {
                const filters = {
                    method: req.query.method,
                    status: req.query.status ? parseInt(req.query.status) : undefined,
                    path: req.query.path,
                    completed: req.query.completed === 'true',
                    since: req.query.since ? parseInt(req.query.since) : undefined,
                    until: req.query.until ? parseInt(req.query.until) : undefined
                };

                const logs = BeamRequestTracker.getAllRequestLogs(filters);
                const limit = req.query.limit ? parseInt(req.query.limit) : 100;
                const offset = req.query.offset ? parseInt(req.query.offset) : 0;

                res.json({
                    success: true,
                    logs: logs.slice(offset, offset + limit),
                    total: logs.length,
                    limit,
                    offset
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        this.app.get('/api/requests/logs/:requestId', this.requireAdminApiKey, (req, res) => {
            try {
                const { requestId } = req.params;
                const log = BeamRequestTracker.getRequestLog(requestId);
                
                if (!log) {
                    return res.status(404).json({
                        success: false,
                        error: 'Request log not found'
                    });
                }

                res.json({
                    success: true,
                    log
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        this.app.post('/api/requests/logs/clear', this.requireAdminApiKey, (req, res) => {
            try {
                BeamRequestTracker.clearAllLogs();
                res.json({
                    success: true,
                    message: 'All request logs cleared successfully'
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        this.app.get('/api/requests/export', this.requireAdminApiKey, (req, res) => {
            try {
                const { requestId } = req.query;
                const exportData = BeamRequestTracker.exportLogs(requestId);
                
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', `attachment; filename="request-logs-${Date.now()}.json"`);
                res.json(exportData);
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Authentication routes - Secure admin authentication
        this.app.post('/api/auth/login', BeamErrorHandler.asyncHandler(async (req, res) => {
            const { username, password, email } = req.body;
            
            // Support both username/password and email/password for compatibility
            const loginUsername = username || email;
            
            // Validate input
            if (!loginUsername || !password) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Username/email and password are required' 
                });
            }
            
            // Get admin credentials from environment variables
            const adminUsername = process.env.ADMIN_USERNAME || 'admin';
            const adminPassword = process.env.ADMIN_PASSWORD;
            
            // Check if admin password is configured
            if (!adminPassword) {
                console.error('ADMIN_PASSWORD environment variable not set');
                return res.status(500).json({ 
                    success: false, 
                    error: 'Server configuration error' 
                });
            }
            
            // Verify credentials
            if (loginUsername === adminUsername && password === adminPassword) {
                // Generate JWT token
                const token = BeamAuth.generateToken({
                    username: loginUsername,
                    role: 'admin'
                });
                
                return res.json({
                    success: true,
                    message: 'Login successful',
                    token,
                    user: { username: loginUsername, role: 'admin' }
                });
            }
            
            // Invalid credentials
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid username or password' 
            });
        }));

        this.app.post('/api/auth/register', BeamErrorHandler.asyncHandler(async (req, res) => {
            try {
                const result = await BeamUserService.createUser(req.body);
                res.json(result);
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        }));



        this.app.get('/api/auth/me', BeamAuth.authenticateToken, (req, res) => {
            res.json({
                success: true,
                user: req.user
            });
        });

        // Admin routes
        this.app.get('/admin', this.requireAdmin, (req, res) => {
            res.sendFile(path.join(__dirname, '../dist/admin.html'));
        });

        // Authentication routes
        this.app.post('/api/auth/login', async (req, res) => {
            try {
                const { username, password } = req.body;
                const result = await BeamUserService.authenticateUser(username, password);
                
                if (result.success) {
                    const token = BeamUserService.generateToken(result.user);
                    const sessionId = await BeamUserService.createSession(
                        result.user._id,
                        req.headers['user-agent'],
                        req.ip
                    );
                    
                    res.json({
                        success: true,
                        token,
                        sessionId,
                        user: result.user,
                        message: 'Login successful'
                    });
                } else {
                    res.status(401).json({
                        success: false,
                        error: 'Invalid credentials'
                    });
                }
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });



        this.app.post('/api/auth/logout', this.requireAuth, async (req, res) => {
            try {
                const sessionId = req.headers['x-session-id'];
                if (sessionId) {
                    await BeamUserService.invalidateSession(sessionId);
                }
                res.json({ success: true, message: 'Logout successful' });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // User management routes
        this.app.get('/api/users', this.requireAuth, this.requireAdmin, async (req, res) => {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const filters = {
                    role: req.query.role,
                    status: req.query.status,
                    search: req.query.search
                };
                
                const result = await BeamUserService.getUsers(page, limit, filters);
                res.json({ success: true, data: result });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        this.app.get('/api/users/:id', this.requireAuth, async (req, res) => {
            try {
                const user = await BeamUserService.getUserById(req.params.id);
                if (!user) {
                    return res.status(404).json({
                        success: false,
                        error: 'User not found'
                    });
                }
                res.json({ success: true, data: user });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // File management routes
        this.app.get('/api/files', this.requireAuth, async (req, res) => {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 20;
                const filters = {
                    mimeType: req.query.mimeType,
                    search: req.query.search,
                    tags: req.query.tags ? req.query.tags.split(',') : undefined
                };
                
                const result = await BeamFileService.getUserFiles(req.user.userId, page, limit, filters);
                res.json({ success: true, data: result });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        this.app.get('/api/files/:id', this.requireAuth, async (req, res) => {
            try {
                const file = await BeamFileService.getFileById(req.params.id, req.user.userId);
                res.json({ success: true, data: file });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // API routes with caching
        this.app.get('/api/data', this.cacheMiddleware('data', 300000), (req, res) => {
            const data = {
                message: 'Hello from BeamFlow API',
                timestamp: new Date().toISOString(),
                cached: true,
                system: {
                    version: process.env.npm_package_version || '1.0.0',
                    uptime: process.uptime(),
                    memory: process.memoryUsage(),
                    platform: process.platform
                }
            };

            // Cache the response
            BeamCache.set('api:data', data, 300000);

            res.json(data);
        });

        // Serve main application
        this.app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, '../dist/index.html'));
        });
    }

    // Setup error handling
    setupErrorHandling() {
        // Global error handler
        this.app.use(BeamErrorHandler.globalErrorHandler());
    }

    // Middleware to require admin API key
    requireAdminApiKey(req, res, next) {
        const apiKey = req.headers['x-api-key'];
        const expectedKey = process.env.ADMIN_API_KEY;

        if (!apiKey || apiKey !== expectedKey) {
            return res.status(401).json({
                error: true,
                message: 'Admin API key required'
            });
        }

        next();
    }

    // Middleware to require authentication
    requireAuth(req, res, next) {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Authentication token required'
            });
        }

        const decoded = BeamUserService.verifyToken(token);
        if (!decoded) {
            return res.status(403).json({
                success: false,
                error: 'Invalid or expired token'
            });
        }

        req.user = decoded;
        next();
    }

    // Middleware to require admin role
    requireAdmin(req, res, next) {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Admin access required'
            });
        }

        next();
    }

    // Cache middleware
    cacheMiddleware(key, ttl = 300000) {
        return (req, res, next) => {
            const cacheKey = `api:${key}:${req.query ? JSON.stringify(req.query) : ''}`;
            const cached = BeamCache.get(cacheKey);

            if (cached) {
                return res.json(cached);
            }

            // Override res.json to cache the response
            const originalJson = res.json;
            res.json = function(data) {
                BeamCache.set(cacheKey, data, ttl);
                return originalJson.call(this, data);
            };

            next();
        };
    }

    // Initialize private services
    async initializePrivateServices() {
        try {
            console.log(' Initializing BeamFlow Private Services...');

            // Load plugins
            await BeamPluginManager.loadPlugins();
            BeamPluginManager.startWatching();

            // Start FTP server if enabled
            if (process.env.FTP_ENABLED === 'true') {
                await BeamFtpServer.start();
                console.log(' FTP Server initialized');
            }

            // Start SSH server if enabled
            if (process.env.SSH_ENABLED === 'true') {
                await BeamSshServer.start();
                console.log(' SSH Server initialized');
            }

            // Execute system start hooks
            await BeamPluginManager.executeHook('onSystemStart');

            console.log(' All private services initialized successfully');

        } catch (error) {
            BeamErrorHandler.logError('Private Services Initialization Error', error);
            console.error(' Failed to initialize private services:', error.message);
        }
    }

    // Start server
    async start() {
        return new Promise((resolve, reject) => {
            try {
                this.server = this.app.listen(this.port, () => {
                    console.log(` BeamFlow Server started on port ${this.port}`);
                    console.log(` Health check: http://localhost:${this.port}/health`);
                    console.log(` Metrics: http://localhost:${this.port}/metrics`);
                    console.log(` Admin panel: http://localhost:${this.port}/admin`);
                    console.log(` PC Link Dashboard: http://localhost:${this.port}/pc-link`);
                    console.log(` FTP server: ftp://localhost:${process.env.FTP_PORT || 21}`);
                    console.log(` SSH server: ssh://localhost:${process.env.SSH_PORT || 22}`);
                    
                    // Attach WebSocket server for PC Link
                    this.pcLinkService.attachWebSocketServer(this.server);
                    
                    // Setup graceful shutdown
                    BeamErrorHandler.setupGracefulShutdown(this.server);
                    
                    resolve();
                });

                this.server.on('error', (error) => {
                    console.error('Server error:', error);
                    reject(error);
                });

            } catch (error) {
                console.error('Failed to start server:', error);
                reject(error);
            }
        });
    }

    // Stop server
    async stop() {
        return new Promise(async (resolve) => {
            try {
                // Cleanup rate limiter
                if (this.rateLimiter) {
                    await this.rateLimiter.cleanup();
                }

                if (this.server) {
                    this.server.close(() => {
                        console.log('Server stopped');
                        resolve();
                    });
                } else {
                    resolve();
                }
            } catch (error) {
                console.error('Error during server shutdown:', error);
                resolve();
            }
        });
    }

    // Get server instance
    getApp() {
        return this.app;
    }

    // Get server instance
    getServer() {
        return this.server;
    }
}

// Create and export server instance
const server = new BeamServer();

// Export for direct use
module.exports = server;

// Start server if this file is run directly
if (require.main === module) {
    server.start()
        .then(() => {
            console.log(' Server started successfully');
        })
        .catch((error) => {
            console.error(' Server failed to start:', error);
            process.exit(1);
        });
}
