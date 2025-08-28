const vm = require('vm');
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const { EventEmitter } = require('events');
const BeamErrorHandler = require('../utils/BeamErrorHandler');
const BeamPerformanceMonitor = require('../utils/BeamPerformanceMonitor');

class BeamPluginSandbox extends EventEmitter {
    constructor() {
        super();
        this.sandboxes = new Map();
        this.resourceLimits = {
            maxMemoryMB: 100,
            maxExecutionTimeMs: 5000,
            maxFileSizeKB: 1024,
            maxNetworkRequests: 10,
            maxDatabaseQueries: 50
        };
        this.allowedModules = new Set([
            'path',
            'url',
            'querystring',
            'crypto',
            'buffer',
            'util',
            'events',
            'stream',
            'string_decoder'
        ]);
        this.blockedModules = new Set([
            'fs',
            'child_process',
            'cluster',
            'crypto',
            'dgram',
            'dns',
            'domain',
            'http',
            'https',
            'net',
            'os',
            'process',
            'querystring',
            'readline',
            'repl',
            'tls',
            'tty',
            'url',
            'util',
            'v8',
            'vm',
            'zlib'
        ]);
        this.permissionLevels = {
            'readonly': ['read'],
            'basic': ['read', 'write'],
            'advanced': ['read', 'write', 'network', 'database'],
            'admin': ['read', 'write', 'network', 'database', 'system']
        };
    }

    /**
     * Create a new sandboxed environment for a plugin
     * @param {string} pluginId - Plugin identifier
     * @param {Object} manifest - Plugin manifest
     * @param {string} permissionLevel - Plugin permission level
     * @returns {Object} Sandboxed environment
     */
    createSandbox(pluginId, manifest, permissionLevel = 'basic') {
        try {
            // Validate permission level
            if (!this.permissionLevels[permissionLevel]) {
                throw new Error(`Invalid permission level: ${permissionLevel}`);
            }

            // Create sandbox context
            const context = {
                // Basic utilities
                console: this.createSafeConsole(pluginId),
                Buffer: Buffer,
                setTimeout: setTimeout,
                clearTimeout: clearTimeout,
                setInterval: setInterval,
                clearInterval: clearInterval,
                
                // Safe modules
                path: this.createSafePath(),
                url: this.createSafeUrl(),
                querystring: this.createSafeQuerystring(),
                util: this.createSafeUtil(),
                events: this.createSafeEvents(),
                stream: this.createSafeStream(),
                string_decoder: this.createSafeStringDecoder(),
                
                // Plugin-specific APIs
                plugin: this.createPluginAPI(pluginId, manifest, permissionLevel),
                
                // Global error handler
                __errorHandler: (error) => {
                    BeamErrorHandler.logError(`Plugin Sandbox Error: ${pluginId}`, error);
                }
            };

            // Create VM context
            const vmContext = vm.createContext(context);
            
            // Add resource monitoring
            const sandbox = {
                id: pluginId,
                context: vmContext,
                manifest: manifest,
                permissionLevel: permissionLevel,
                permissions: this.permissionLevels[permissionLevel],
                resourceUsage: {
                    memoryUsage: 0,
                    executionTime: 0,
                    fileOperations: 0,
                    networkRequests: 0,
                    databaseQueries: 0
                },
                limits: { ...this.resourceLimits },
                startTime: Date.now(),
                isActive: true
            };

            this.sandboxes.set(pluginId, sandbox);
            
            console.log(`Created sandbox for plugin: ${pluginId} (${permissionLevel})`);
            BeamPerformanceMonitor.recordSandboxCreation(pluginId);
            
            return sandbox;

        } catch (error) {
            BeamErrorHandler.logError(`Sandbox Creation Error: ${pluginId}`, error);
            throw error;
        }
    }

    /**
     * Execute code in a sandboxed environment
     * @param {string} pluginId - Plugin identifier
     * @param {string} code - Code to execute
     * @param {Object} options - Execution options
     * @returns {Promise<any>} Execution result
     */
    async executeInSandbox(pluginId, code, options = {}) {
        const sandbox = this.sandboxes.get(pluginId);
        if (!sandbox) {
            throw new Error(`Sandbox not found for plugin: ${pluginId}`);
        }

        try {
            // Validate code before execution
            this.validateCode(code, sandbox.permissions);

            // Set up execution timeout
            const timeout = options.timeout || sandbox.limits.maxExecutionTimeMs;
            const startTime = Date.now();

            // Create execution promise with timeout
            const executionPromise = new Promise((resolve, reject) => {
                try {
                    const script = new vm.Script(code, {
                        filename: `plugin-${pluginId}.js`,
                        lineOffset: 0,
                        columnOffset: 0
                    });

                    const result = script.runInContext(sandbox.context, {
                        timeout: timeout,
                        displayErrors: false
                    });

                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            });

            // Execute with timeout
            const result = await Promise.race([
                executionPromise,
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Execution timeout')), timeout)
                )
            ]);

            // Update resource usage
            sandbox.resourceUsage.executionTime = Date.now() - startTime;
            sandbox.resourceUsage.memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;

            // Check resource limits
            this.checkResourceLimits(sandbox);

            return result;

        } catch (error) {
            BeamErrorHandler.logError(`Sandbox Execution Error: ${pluginId}`, error);
            this.emit('executionError', { pluginId, error });
            throw error;
        }
    }

    /**
     * Load and execute a plugin file in sandbox
     * @param {string} pluginId - Plugin identifier
     * @param {string} filePath - Plugin file path
     * @returns {Promise<any>} Plugin module
     */
    async loadPluginFile(pluginId, filePath) {
        try {
            const sandbox = this.sandboxes.get(pluginId);
            if (!sandbox) {
                throw new Error(`Sandbox not found for plugin: ${pluginId}`);
            }

            // Read and validate file
            const code = await fs.readFile(filePath, 'utf8');
            this.validateCode(code, sandbox.permissions);

            // Execute in sandbox
            const result = await this.executeInSandbox(pluginId, code, {
                timeout: 10000 // 10 second timeout for file loading
            });

            return result;

        } catch (error) {
            BeamErrorHandler.logError(`Plugin File Load Error: ${pluginId}`, error);
            throw error;
        }
    }

    /**
     * Validate code for security and permissions
     * @param {string} code - Code to validate
     * @param {Array} permissions - Plugin permissions
     */
    validateCode(code, permissions) {
        // Check for blocked modules
        for (const blockedModule of this.blockedModules) {
            const regex = new RegExp(`require\\s*\\(\\s*['"]${blockedModule}['"]\\s*\\)`, 'gi');
            if (regex.test(code)) {
                throw new Error(`Blocked module access: ${blockedModule}`);
            }
        }

        // Check for dangerous patterns
        const dangerousPatterns = [
            /eval\s*\(/gi,
            /Function\s*\(/gi,
            /process\./gi,
            /global\./gi,
            /__dirname/gi,
            /__filename/gi,
            /require\s*\(/gi,
            /module\./gi,
            /exports\./gi
        ];

        for (const pattern of dangerousPatterns) {
            if (pattern.test(code)) {
                throw new Error(`Dangerous code pattern detected: ${pattern.source}`);
            }
        }

        // Check for file system access if not permitted
        if (!permissions.includes('write')) {
            const fsPatterns = [
                /fs\./gi,
                /path\./gi,
                /readFile/gi,
                /writeFile/gi
            ];

            for (const pattern of fsPatterns) {
                if (pattern.test(code)) {
                    throw new Error(`File system access not permitted`);
                }
            }
        }

        // Check for network access if not permitted
        if (!permissions.includes('network')) {
            const networkPatterns = [
                /http\./gi,
                /https\./gi,
                /fetch/gi,
                /axios/gi,
                /request/gi
            ];

            for (const pattern of networkPatterns) {
                if (pattern.test(code)) {
                    throw new Error(`Network access not permitted`);
                }
            }
        }
    }

    /**
     * Check resource limits for a sandbox
     * @param {Object} sandbox - Sandbox to check
     */
    checkResourceLimits(sandbox) {
        const { resourceUsage, limits } = sandbox;

        if (resourceUsage.memoryUsage > limits.maxMemoryMB) {
            throw new Error(`Memory limit exceeded: ${resourceUsage.memoryUsage}MB > ${limits.maxMemoryMB}MB`);
        }

        if (resourceUsage.executionTime > limits.maxExecutionTimeMs) {
            throw new Error(`Execution time limit exceeded: ${resourceUsage.executionTime}ms > ${limits.maxExecutionTimeMs}ms`);
        }

        if (resourceUsage.fileOperations > limits.maxFileSizeKB) {
            throw new Error(`File operation limit exceeded: ${resourceUsage.fileOperations} > ${limits.maxFileSizeKB}`);
        }

        if (resourceUsage.networkRequests > limits.maxNetworkRequests) {
            throw new Error(`Network request limit exceeded: ${resourceUsage.networkRequests} > ${limits.maxNetworkRequests}`);
        }

        if (resourceUsage.databaseQueries > limits.maxDatabaseQueries) {
            throw new Error(`Database query limit exceeded: ${resourceUsage.databaseQueries} > ${limits.maxDatabaseQueries}`);
        }
    }

    /**
     * Create safe console for plugins
     * @param {string} pluginId - Plugin identifier
     * @returns {Object} Safe console object
     */
    createSafeConsole(pluginId) {
        return {
            log: (...args) => {
                console.log(`[Plugin:${pluginId}]`, ...args);
            },
            error: (...args) => {
                console.error(`[Plugin:${pluginId}]`, ...args);
            },
            warn: (...args) => {
                console.warn(`[Plugin:${pluginId}]`, ...args);
            },
            info: (...args) => {
                console.info(`[Plugin:${pluginId}]`, ...args);
            }
        };
    }

    /**
     * Create safe path module
     * @returns {Object} Safe path module
     */
    createSafePath() {
        return {
            join: (...args) => path.join(...args),
            resolve: (...args) => path.resolve(...args),
            dirname: (p) => path.dirname(p),
            basename: (p, ext) => path.basename(p, ext),
            extname: (p) => path.extname(p),
            parse: (p) => path.parse(p),
            format: (p) => path.format(p),
            isAbsolute: (p) => path.isAbsolute(p),
            relative: (from, to) => path.relative(from, to),
            normalize: (p) => path.normalize(p)
        };
    }

    /**
     * Create safe URL module
     * @returns {Object} Safe URL module
     */
    createSafeUrl() {
        return {
            parse: (urlString, parseQueryString, slashesDenoteHost) => 
                require('url').parse(urlString, parseQueryString, slashesDenoteHost),
            format: (urlObject) => require('url').format(urlObject),
            resolve: (from, to) => require('url').resolve(from, to)
        };
    }

    /**
     * Create safe querystring module
     * @returns {Object} Safe querystring module
     */
    createSafeQuerystring() {
        return {
            parse: (str, sep, eq, options) => 
                require('querystring').parse(str, sep, eq, options),
            stringify: (obj, sep, eq, options) => 
                require('querystring').stringify(obj, sep, eq, options),
            escape: (str) => require('querystring').escape(str),
            unescape: (str) => require('querystring').unescape(str)
        };
    }

    /**
     * Create safe util module
     * @returns {Object} Safe util module
     */
    createSafeUtil() {
        return {
            format: (...args) => require('util').format(...args),
            inspect: (obj, options) => require('util').inspect(obj, options),
            isArray: (obj) => require('util').isArray(obj),
            isBoolean: (obj) => require('util').isBoolean(obj),
            isNull: (obj) => require('util').isNull(obj),
            isNullOrUndefined: (obj) => require('util').isNullOrUndefined(obj),
            isNumber: (obj) => require('util').isNumber(obj),
            isObject: (obj) => require('util').isObject(obj),
            isPrimitive: (obj) => require('util').isPrimitive(obj),
            isString: (obj) => require('util').isString(obj),
            isSymbol: (obj) => require('util').isSymbol(obj),
            isUndefined: (obj) => require('util').isUndefined(obj),
            deprecate: (fn, msg) => require('util').deprecate(fn, msg)
        };
    }

    /**
     * Create safe events module
     * @returns {Object} Safe events module
     */
    createSafeEvents() {
        return {
            EventEmitter: require('events').EventEmitter,
            once: (emitter, name) => require('events').once(emitter, name),
            on: (emitter, event) => require('events').on(emitter, event)
        };
    }

    /**
     * Create safe stream module
     * @returns {Object} Safe stream module
     */
    createSafeStream() {
        return {
            Readable: require('stream').Readable,
            Writable: require('stream').Writable,
            Duplex: require('stream').Duplex,
            Transform: require('stream').Transform,
            PassThrough: require('stream').PassThrough,
            finished: (stream, callback) => require('stream').finished(stream, callback),
            pipeline: (...streams) => require('stream').pipeline(...streams)
        };
    }

    /**
     * Create safe string_decoder module
     * @returns {Object} Safe string_decoder module
     */
    createSafeStringDecoder() {
        return {
            StringDecoder: require('string_decoder').StringDecoder
        };
    }

    /**
     * Create plugin-specific API
     * @param {string} pluginId - Plugin identifier
     * @param {Object} manifest - Plugin manifest
     * @param {string} permissionLevel - Permission level
     * @returns {Object} Plugin API
     */
    createPluginAPI(pluginId, manifest, permissionLevel) {
        const api = {
            id: pluginId,
            name: manifest.name,
            version: manifest.version,
            description: manifest.description,
            author: manifest.author,
            permissions: this.permissionLevels[permissionLevel],
            
            // Plugin data storage
            getData: async (key) => {
                try {
                    const dataPath = path.join(__dirname, '../plugins/installed/active', pluginId, 'data', `${key}.json`);
                    if (await fs.pathExists(dataPath)) {
                        return await fs.readJson(dataPath);
                    }
                    return null;
                } catch (error) {
                    BeamErrorHandler.logError(`Plugin GetData Error: ${pluginId}`, error);
                    return null;
                }
            },

            setData: async (key, value) => {
                try {
                    const dataDir = path.join(__dirname, '../plugins/installed/active', pluginId, 'data');
                    await fs.ensureDir(dataDir);
                    const dataPath = path.join(dataDir, `${key}.json`);
                    await fs.writeJson(dataPath, value, { spaces: 2 });
                    return true;
                } catch (error) {
                    BeamErrorHandler.logError(`Plugin SetData Error: ${pluginId}`, error);
                    return false;
                }
            },

            // Plugin configuration
            getConfig: () => {
                return manifest.settings || {};
            },

            // Plugin logging
            log: (level, message, data = {}) => {
                const logEntry = {
                    timestamp: new Date().toISOString(),
                    level,
                    message,
                    data,
                    pluginId
                };
                
                // Log to plugin-specific log file
                const logPath = path.join(__dirname, '../plugins/installed/active', pluginId, 'logs', 'plugin.log');
                fs.appendFile(logPath, JSON.stringify(logEntry) + '\n').catch(console.error);
                
                // Also log to main system
                console.log(`[Plugin:${pluginId}:${level}]`, message, data);
            },

            // Plugin events
            emit: (event, data) => {
                this.emit('pluginEvent', { pluginId, event, data });
            },

            // Resource monitoring
            getResourceUsage: () => {
                const sandbox = this.sandboxes.get(pluginId);
                return sandbox ? { ...sandbox.resourceUsage } : null;
            }
        };

        // Add permission-specific APIs
        if (this.permissionLevels[permissionLevel].includes('network')) {
            api.http = this.createHttpAPI(pluginId);
        }

        if (this.permissionLevels[permissionLevel].includes('database')) {
            api.database = this.createDatabaseAPI(pluginId);
        }

        if (this.permissionLevels[permissionLevel].includes('system')) {
            api.system = this.createSystemAPI(pluginId);
        }

        return api;
    }

    /**
     * Create HTTP API for plugins with network permission
     * @param {string} pluginId - Plugin identifier
     * @returns {Object} HTTP API
     */
    createHttpAPI(pluginId) {
        return {
            get: async (url, options = {}) => {
                const sandbox = this.sandboxes.get(pluginId);
                if (sandbox) {
                    sandbox.resourceUsage.networkRequests++;
                    this.checkResourceLimits(sandbox);
                }
                
                // Implement safe HTTP client
                // This would use a restricted HTTP client
                throw new Error('HTTP API not yet implemented');
            },

            post: async (url, data, options = {}) => {
                const sandbox = this.sandboxes.get(pluginId);
                if (sandbox) {
                    sandbox.resourceUsage.networkRequests++;
                    this.checkResourceLimits(sandbox);
                }
                
                throw new Error('HTTP API not yet implemented');
            }
        };
    }

    /**
     * Create database API for plugins with database permission
     * @param {string} pluginId - Plugin identifier
     * @returns {Object} Database API
     */
    createDatabaseAPI(pluginId) {
        return {
            query: async (sql, params = []) => {
                const sandbox = this.sandboxes.get(pluginId);
                if (sandbox) {
                    sandbox.resourceUsage.databaseQueries++;
                    this.checkResourceLimits(sandbox);
                }
                
                // Implement safe database client
                throw new Error('Database API not yet implemented');
            }
        };
    }

    /**
     * Create system API for plugins with system permission
     * @param {string} pluginId - Plugin identifier
     * @returns {Object} System API
     */
    createSystemAPI(pluginId) {
        return {
            getSystemInfo: () => {
                return {
                    platform: process.platform,
                    arch: process.arch,
                    nodeVersion: process.version,
                    uptime: process.uptime()
                };
            }
        };
    }

    /**
     * Destroy a sandbox
     * @param {string} pluginId - Plugin identifier
     */
    destroySandbox(pluginId) {
        const sandbox = this.sandboxes.get(pluginId);
        if (sandbox) {
            sandbox.isActive = false;
            this.sandboxes.delete(pluginId);
            console.log(`Destroyed sandbox for plugin: ${pluginId}`);
            BeamPerformanceMonitor.recordSandboxDestruction(pluginId);
        }
    }

    /**
     * Get sandbox information
     * @param {string} pluginId - Plugin identifier
     * @returns {Object} Sandbox information
     */
    getSandboxInfo(pluginId) {
        const sandbox = this.sandboxes.get(pluginId);
        if (!sandbox) {
            return null;
        }

        return {
            id: sandbox.id,
            permissionLevel: sandbox.permissionLevel,
            permissions: sandbox.permissions,
            resourceUsage: { ...sandbox.resourceUsage },
            limits: { ...sandbox.limits },
            isActive: sandbox.isActive,
            uptime: Date.now() - sandbox.startTime
        };
    }

    /**
     * Get all sandbox information
     * @returns {Array} Array of sandbox information
     */
    getAllSandboxInfo() {
        return Array.from(this.sandboxes.keys()).map(pluginId => 
            this.getSandboxInfo(pluginId)
        ).filter(info => info !== null);
    }

    /**
     * Update resource limits for a sandbox
     * @param {string} pluginId - Plugin identifier
     * @param {Object} limits - New limits
     */
    updateResourceLimits(pluginId, limits) {
        const sandbox = this.sandboxes.get(pluginId);
        if (sandbox) {
            sandbox.limits = { ...sandbox.limits, ...limits };
            console.log(`Updated resource limits for plugin: ${pluginId}`);
        }
    }

    /**
     * Update global resource limits
     * @param {Object} limits - New global limits
     */
    updateGlobalResourceLimits(limits) {
        this.resourceLimits = { ...this.resourceLimits, ...limits };
        console.log('Updated global resource limits');
    }
}

module.exports = new BeamPluginSandbox();
