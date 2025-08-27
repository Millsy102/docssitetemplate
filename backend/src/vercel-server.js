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
const BeamValidator = require('./utils/BeamValidator');
const BeamHealthCheckAggregator = require('./utils/BeamHealthCheckAggregator');

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

class BeamVercelServer {
    constructor() {
        this.app = express();
        this.isProduction = process.env.NODE_ENV === 'production';
        this.isVercel = process.env.VERCEL === '1';
        
        this.initializeSystem();
    }

    /**
     * Initialize the system for Vercel deployment
     */
    async initializeSystem() {
        try {
            console.log(' Initializing BeamFlow System for Vercel...');
            
            // Connect to databases (only if not in Vercel or if database is configured)
            if (!this.isVercel || process.env.DATABASE_URL) {
                await beamDatabase.connect();
                console.log(' Database connections established');
            }
            
            // Setup middleware and routes
            this.setupMiddleware();
            this.setupRoutes();
            this.setupErrorHandling();
            
            // Initialize services (skip private services in Vercel)
            if (!this.isVercel) {
                await this.initializePrivateServices();
                this.pcLinkService = new BeamPCLinkService();
            }
            
            console.log(' BeamFlow System initialized successfully for Vercel');
            
        } catch (error) {
            console.error(' System initialization failed:', error);
            // Don't exit in Vercel environment, just log the error
            if (!this.isVercel) {
                process.exit(1);
            }
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
                hasDatabase: !!(process.env.DATABASE_URL || process.env.MONGODB_URI),
                environment: process.env.NODE_ENV || 'development'
            });
        });

        // Analytics configuration endpoint
        this.app.get('/api/analytics/config', (req, res) => {
            res.json({
                ga_measurement_id: process.env.GA_MEASUREMENT_ID || null,
                analytics_enabled: !!(process.env.GA_MEASUREMENT_ID && process.env.GA_MEASUREMENT_ID !== 'your-google-analytics-measurement-id')
            });
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

        // Metrics endpoint
        this.app.get('/metrics', (req, res) => {
            const metrics = {
                performance: BeamPerformanceMonitor.getMetrics(),
                health: BeamHealthCheckAggregator.getStats()
            };
            res.json(metrics);
        });

        // Versioned API routes
        this.app.use('/api', require('./routes/versioned-api'));
        
        // Legacy API routes (for backward compatibility)
        this.app.use('/api/auth', require('./routes/auth'));
        this.app.use('/api/users', require('./routes/users'));
        this.app.use('/api/files', require('./routes/files'));
        this.app.use('/api/admin', require('./routes/admin'));
        this.app.use('/api/analytics', require('./routes/analytics'));

        // Serve React app for all other routes
        this.app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, '../dist/index.html'));
        });
    }

    // Setup error handling
    setupErrorHandling() {
        // 404 handler
        this.app.use((req, res, next) => {
            res.status(404).json({
                error: 'Not Found',
                message: 'The requested resource was not found',
                path: req.path
            });
        });

        // Global error handler
        this.app.use((error, req, res, next) => {
            BeamErrorHandler.handleError(error, req, res, next);
        });
    }

    // Initialize private services (skipped in Vercel)
    async initializePrivateServices() {
        try {
            console.log(' Initializing private services...');

            // Initialize plugin system
            await BeamPluginManager.initialize();
            console.log(' Plugin system initialized');

            // Initialize admin dashboard
            await BeamAdminDashboard.initialize();
            console.log(' Admin dashboard initialized');

            // Initialize PC Link dashboard
            await BeamPCLinkDashboard.initialize();
            console.log(' PC Link dashboard initialized');

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

    // Get Express app
    getApp() {
        return this.app;
    }
}

// Create server instance
const server = new BeamVercelServer();

// Export the Express app for Vercel
module.exports = server.getApp();
