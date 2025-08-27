const express = require('express');
const router = express.Router();
const BeamApiVersioning = require('../middleware/BeamApiVersioning');

// Import versioned route handlers
const v1Users = require('./v1/users');
const v2Users = require('./v2/users');
const v3Users = require('./v3/users');

// Import other versioned routes (files, auth, etc.)
const v1Files = require('./v1/files');
const v2Files = require('./v2/files');
const v3Files = require('./v3/files');

const v1Auth = require('./v1/auth');
const v2Auth = require('./v2/auth');
const v3Auth = require('./v3/auth');

const v1Admin = require('./v1/admin');
const v2Admin = require('./v2/admin');
const v3Admin = require('./v3/admin');

const v1Analytics = require('./v1/analytics');
const v2Analytics = require('./v2/analytics');
const v3Analytics = require('./v3/analytics');

/**
 * Versioned API Router
 * Routes requests to appropriate version-specific handlers
 */
class VersionedApiRouter {
    constructor() {
        this.router = express.Router();
        this.setupRoutes();
    }

    setupRoutes() {
        // Apply version detection middleware
        this.router.use(BeamApiVersioning.detectVersion());
        
        // Apply response formatting middleware
        this.router.use(BeamApiVersioning.formatResponse());
        
        // API version information endpoint
        this.router.get('/version', (req, res) => {
            const versionInfo = BeamApiVersioning.getVersionInfo();
            res.json({
                success: true,
                message: 'API version information',
                data: versionInfo,
                meta: {
                    version: req.apiVersion,
                    timestamp: new Date().toISOString(),
                    requestId: req.id
                }
            });
        });

        // Users routes
        this.setupVersionedRoutes('/users', {
            'v1': v1Users,
            'v2': v2Users,
            'v3': v3Users
        });

        // Files routes
        this.setupVersionedRoutes('/files', {
            'v1': v1Files,
            'v2': v2Files,
            'v3': v3Files
        });

        // Auth routes
        this.setupVersionedRoutes('/auth', {
            'v1': v1Auth,
            'v2': v2Auth,
            'v3': v3Auth
        });

        // Admin routes
        this.setupVersionedRoutes('/admin', {
            'v1': v1Admin,
            'v2': v2Admin,
            'v3': v3Admin
        });

        // Analytics routes
        this.setupVersionedRoutes('/analytics', {
            'v1': v1Analytics,
            'v2': v2Analytics,
            'v3': v3Analytics
        });

        // Handle unsupported routes
        this.router.use('*', (req, res) => {
            res.status(404).json({
                success: false,
                message: 'API endpoint not found',
                error: {
                    code: 'ENDPOINT_NOT_FOUND',
                    message: `Endpoint '${req.path}' not found for version '${req.apiVersion}'`,
                    details: {
                        path: req.path,
                        method: req.method,
                        version: req.apiVersion
                    },
                    requestId: req.id
                },
                timestamp: new Date().toISOString()
            });
        });

        // Apply error formatting middleware
        this.router.use(BeamApiVersioning.formatError());
    }

    setupVersionedRoutes(basePath, versionHandlers) {
        // Create a router for this base path
        const pathRouter = express.Router();

        // Add version-specific routes
        Object.keys(versionHandlers).forEach(version => {
            const handler = versionHandlers[version];
            
            // Apply version-specific middleware
            pathRouter.use(BeamApiVersioning.route(version, basePath, (req, res, next) => {
                // Add version info to request
                req.apiVersion = version;
                next();
            }));

            // Mount the version-specific router
            pathRouter.use('/', handler);
        });

        // Mount the path router
        this.router.use(basePath, pathRouter);
    }

    getRouter() {
        return this.router;
    }
}

module.exports = new VersionedApiRouter().getRouter();
