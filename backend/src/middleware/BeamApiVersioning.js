const express = require('express');

/**
 * BeamFlow API Versioning Middleware
 * Handles API version detection, routing, and deprecation warnings
 */
class BeamApiVersioning {
    constructor() {
        this.supportedVersions = ['v1', 'v2', 'v3'];
        this.currentVersion = 'v3';
        this.deprecatedVersions = ['v1'];
        this.versionExpiryDates = {
            'v1': '2024-12-31',
            'v2': '2025-06-30'
        };
    }

    /**
     * Middleware to detect and validate API version
     */
    detectVersion() {
        return (req, res, next) => {
            // Extract version from URL path
            const urlVersion = this.extractVersionFromUrl(req.path);
            
            // Extract version from headers
            const headerVersion = req.headers['x-api-version'] || req.headers['accept-version'];
            
            // Extract version from query parameter
            const queryVersion = req.query.version;
            
            // Determine the version to use (priority: URL > Header > Query > Default)
            let version = urlVersion || headerVersion || queryVersion || this.currentVersion;
            
            // Normalize version format
            version = this.normalizeVersion(version);
            
            // Validate version
            if (!this.supportedVersions.includes(version)) {
                return res.status(400).json({
                    error: 'Unsupported API Version',
                    message: `Version '${version}' is not supported. Supported versions: ${this.supportedVersions.join(', ')}`,
                    supportedVersions: this.supportedVersions,
                    currentVersion: this.currentVersion
                });
            }
            
            // Add version info to request object
            req.apiVersion = version;
            req.isDeprecatedVersion = this.deprecatedVersions.includes(version);
            req.versionExpiryDate = this.versionExpiryDates[version];
            
            // Add deprecation warning header if using deprecated version
            if (req.isDeprecatedVersion) {
                res.set('X-API-Deprecation-Warning', `Version ${version} is deprecated and will be removed on ${req.versionExpiryDate}`);
            }
            
            next();
        };
    }

    /**
     * Extract version from URL path
     */
    extractVersionFromUrl(path) {
        const versionMatch = path.match(/^\/api\/(v\d+)\//);
        return versionMatch ? versionMatch[1] : null;
    }

    /**
     * Normalize version format
     */
    normalizeVersion(version) {
        // Remove 'v' prefix if present and add it back
        const cleanVersion = version.replace(/^v/, '');
        return `v${cleanVersion}`;
    }

    /**
     * Create versioned router
     */
    createVersionedRouter() {
        const router = express.Router();
        
        // Apply version detection middleware
        router.use(this.detectVersion());
        
        return router;
    }

    /**
     * Route handler for versioned endpoints
     */
    route(version, path, handler) {
        return (req, res, next) => {
            if (req.apiVersion === version) {
                return handler(req, res, next);
            }
            next();
        };
    }

    /**
     * Get version-specific response wrapper
     */
    getResponseWrapper(version) {
        const wrappers = {
            'v1': this.v1ResponseWrapper,
            'v2': this.v2ResponseWrapper,
            'v3': this.v3ResponseWrapper
        };
        
        return wrappers[version] || this.v3ResponseWrapper;
    }

    /**
     * V1 Response Wrapper (legacy format)
     */
    v1ResponseWrapper(data, message = 'Success') {
        return {
            success: true,
            message,
            data,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * V2 Response Wrapper (enhanced format)
     */
    v2ResponseWrapper(data, message = 'Success', meta = {}) {
        return {
            success: true,
            message,
            data,
            meta: {
                version: 'v2',
                timestamp: new Date().toISOString(),
                ...meta
            }
        };
    }

    /**
     * V3 Response Wrapper (current format)
     */
    v3ResponseWrapper(data, message = 'Success', meta = {}) {
        return {
            success: true,
            message,
            data,
            meta: {
                version: 'v3',
                timestamp: new Date().toISOString(),
                requestId: meta.requestId,
                ...meta
            }
        };
    }

    /**
     * Get version-specific error wrapper
     */
    getErrorWrapper(version) {
        const wrappers = {
            'v1': this.v1ErrorWrapper,
            'v2': this.v2ErrorWrapper,
            'v3': this.v3ErrorWrapper
        };
        
        return wrappers[version] || this.v3ErrorWrapper;
    }

    /**
     * V1 Error Wrapper (legacy format)
     */
    v1ErrorWrapper(error, message = 'Error') {
        return {
            success: false,
            message,
            error: error.message || error,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * V2 Error Wrapper (enhanced format)
     */
    v2ErrorWrapper(error, message = 'Error', code = null) {
        return {
            success: false,
            message,
            error: {
                code: code || 'UNKNOWN_ERROR',
                message: error.message || error,
                details: error.details || null
            },
            timestamp: new Date().toISOString()
        };
    }

    /**
     * V3 Error Wrapper (current format)
     */
    v3ErrorWrapper(error, message = 'Error', code = null, requestId = null) {
        return {
            success: false,
            message,
            error: {
                code: code || 'UNKNOWN_ERROR',
                message: error.message || error,
                details: error.details || null,
                requestId
            },
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Middleware to add version-specific response formatting
     */
    formatResponse() {
        return (req, res, next) => {
            const originalJson = res.json;
            
            res.json = function(data) {
                const wrapper = BeamApiVersioning.prototype.getResponseWrapper(req.apiVersion);
                const wrappedData = wrapper(data, data.message || 'Success', {
                    requestId: req.id,
                    version: req.apiVersion
                });
                
                return originalJson.call(this, wrappedData);
            };
            
            next();
        };
    }

    /**
     * Middleware to add version-specific error formatting
     */
    formatError() {
        return (error, req, res, next) => {
            const wrapper = BeamApiVersioning.prototype.getErrorWrapper(req.apiVersion);
            const wrappedError = wrapper(error, error.message || 'Internal Server Error', error.code, req.id);
            
            res.status(error.status || 500).json(wrappedError);
        };
    }

    /**
     * Get API version information
     */
    getVersionInfo() {
        return {
            currentVersion: this.currentVersion,
            supportedVersions: this.supportedVersions,
            deprecatedVersions: this.deprecatedVersions,
            versionExpiryDates: this.versionExpiryDates
        };
    }
}

module.exports = new BeamApiVersioning();
