const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');

// Import strengthened system components
const BeamSecurity = require('./middleware/BeamSecurity');
const BeamAuth = require('./middleware/BeamAuth');
const BeamPerformanceMonitor = require('./utils/BeamPerformanceMonitor');
const BeamCache = require('./utils/BeamCache');
const BeamErrorHandler = require('./utils/BeamErrorHandler');
const BeamHealthCheckAggregator = require('./utils/BeamHealthCheckAggregator');
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
        this.app = express();
        this.server = null;
        this.port = process.env.PORT || 3000;
        this.isProduction = process.env.NODE_ENV === 'production';
        
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
        // Apply security middleware
        BeamSecurity.applySecurityMiddleware(this.app);

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
            // Health check endpoints
    this.app.get('/health', async (req, res) => {
        try {
            const detailed = req.query.detailed === 'true';
            const health = await BeamHealthCheckAggregator.getHealthStatus(detailed);
            res.json(health);
        } catch (error) {
            res.status(500).json({
                status: 'error',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    });

    // Quick health check (cached)
    this.app.get('/health/quick', (req, res) => {
        const cachedHealth = BeamHealthCheckAggregator.getCachedHealthStatus();
        if (cachedHealth) {
            res.json(cachedHealth);
        } else {
            res.status(503).json({
                status: 'unavailable',
                message: 'Health check data not available',
                timestamp: new Date().toISOString()
            });
        }
    });

    // Individual health checks
    this.app.get('/health/:check', async (req, res) => {
        try {
            const checkName = req.params.check;
            const result = await BeamHealthCheckAggregator.runCheck(checkName);
            res.json(result);
        } catch (error) {
            res.status(404).json({
                status: 'error',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    });

        // Metrics endpoint (admin only)
        this.app.get('/metrics', this.requireAdminApiKey, (req, res) => {
            const metrics = {
                performance: BeamPerformanceMonitor.getStats(),
                cache: BeamCache.getStats(),
                errors: BeamErrorHandler.getErrorStats(),
                health: BeamHealthCheckAggregator.getStats()
            };
            res.json(metrics);
        });

        // Admin dashboard routes
        this.app.use('/admin', BeamAdminDashboard.getRouter());
        
        // Health dashboard routes
        const BeamHealthDashboard = require('./admin/BeamHealthDashboard');
        const healthDashboard = new BeamHealthDashboard();
        this.app.use('/health-dashboard', healthDashboard.getRouter());
        
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

        // Import authentication routes
        const authRoutes = require('./routes/auth');
        this.app.use('/api/auth', authRoutes);

        // Import protected routes
        const protectedRoutes = require('./routes/protected');
        this.app.use('/api/protected', protectedRoutes);

        // Admin routes
        this.app.get('/admin', this.requireAdmin, (req, res) => {
            res.sendFile(path.join(__dirname, '../dist/admin.html'));
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
        return new Promise((resolve) => {
            if (this.server) {
                this.server.close(() => {
                    console.log('Server stopped');
                    resolve();
                });
            } else {
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
