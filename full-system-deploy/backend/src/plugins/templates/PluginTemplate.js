/**
 * BeamFlow Plugin Template
 * 
 * This template provides a standardized structure for all plugins in the BeamFlow system.
 * It includes proper error handling, logging, configuration management, and integration points.
 * 
 * @version 1.0.0
 * @author BeamFlow System
 * @license MIT
 */

const path = require('path');
const fs = require('fs-extra');
const { EventEmitter } = require('events');

class PluginTemplate extends EventEmitter {
    /**
     * Plugin Template Constructor
     * @param {Object} config - Plugin configuration
     * @param {string} config.name - Plugin name (required)
     * @param {string} config.version - Plugin version (required)
     * @param {string} config.description - Plugin description (required)
     * @param {string} config.author - Plugin author (required)
     * @param {string} config.license - Plugin license (default: MIT)
     * @param {Array} config.dependencies - Plugin dependencies (optional)
     * @param {Array} config.permissions - Required permissions (optional)
     * @param {Object} config.settings - Plugin settings schema (optional)
     * @param {Array} config.hooks - Plugin hooks (optional)
     * @param {Object} config.ui - UI configuration (optional)
     * @param {Object} config.api - API endpoints (optional)
     */
    constructor(config = {}) {
        super();
        
        // Validate required configuration
        this.validateConfig(config);
        
        // Core plugin properties
        this.name = config.name;
        this.version = config.version;
        this.description = config.description;
        this.author = config.author;
        this.license = config.license || 'MIT';
        this.dependencies = config.dependencies || [];
        this.permissions = config.permissions || [];
        
        // Plugin state
        this.isEnabled = false;
        this.isInitialized = false;
        this.isRunning = false;
        this.errors = [];
        this.warnings = [];
        
        // Configuration and settings
        this.config = config;
        this.settings = this.initializeSettings(config.settings || {});
        this.defaultSettings = this.settings;
        
        // Integration points
        this.hooks = this.initializeHooks(config.hooks || []);
        this.ui = this.initializeUI(config.ui || {});
        this.api = this.initializeAPI(config.api || {});
        
        // File paths
        this.pluginPath = null;
        this.dataPath = null;
        this.logPath = null;
        
        // Services and utilities
        this.logger = null;
        this.database = null;
        this.cache = null;
        this.fileService = null;
        
        // Performance monitoring
        this.metrics = {
            startTime: null,
            loadTime: null,
            memoryUsage: null,
            errorCount: 0,
            requestCount: 0,
            lastActivity: null
        };
        
        // Bind methods
        this.init = this.init.bind(this);
        this.enable = this.enable.bind(this);
        this.disable = this.disable.bind(this);
        this.uninstall = this.uninstall.bind(this);
        this.getStatus = this.getStatus.bind(this);
        this.getMetrics = this.getMetrics.bind(this);
        this.log = this.log.bind(this);
        this.error = this.error.bind(this);
        this.warn = this.warn.bind(this);
    }

    /**
     * Validate plugin configuration
     * @param {Object} config - Plugin configuration
     * @throws {Error} If required configuration is missing
     */
    validateConfig(config) {
        const required = ['name', 'version', 'description', 'author'];
        const missing = required.filter(field => !config[field]);
        
        if (missing.length > 0) {
            throw new Error(`Plugin configuration missing required fields: ${missing.join(', ')}`);
        }
        
        // Validate version format
        if (!/^\d+\.\d+\.\d+$/.test(config.version)) {
            throw new Error('Plugin version must follow semantic versioning (e.g., 1.0.0)');
        }
        
        // Validate name format
        if (!/^[a-zA-Z0-9-_]+$/.test(config.name)) {
            throw new Error('Plugin name must contain only alphanumeric characters, hyphens, and underscores');
        }
    }

    /**
     * Initialize plugin settings
     * @param {Object} settingsSchema - Settings schema
     * @returns {Object} Initialized settings
     */
    initializeSettings(settingsSchema) {
        const settings = {};
        
        for (const [key, schema] of Object.entries(settingsSchema)) {
            settings[key] = {
                value: schema.default !== undefined ? schema.default : null,
                type: schema.type || 'string',
                required: schema.required || false,
                description: schema.description || '',
                validation: schema.validation || null,
                options: schema.options || null,
                ...schema
            };
        }
        
        return settings;
    }

    /**
     * Initialize plugin hooks
     * @param {Array} hooksConfig - Hooks configuration
     * @returns {Object} Initialized hooks
     */
    initializeHooks(hooksConfig) {
        const hooks = {};
        
        hooksConfig.forEach(hook => {
            hooks[hook.name] = {
                name: hook.name,
                description: hook.description || '',
                priority: hook.priority || 0,
                handler: hook.handler || null,
                enabled: hook.enabled !== false,
                ...hook
            };
        });
        
        return hooks;
    }

    /**
     * Initialize UI configuration
     * @param {Object} uiConfig - UI configuration
     * @returns {Object} Initialized UI config
     */
    initializeUI(uiConfig) {
        return {
            // Navigation
            navigation: {
                enabled: uiConfig.navigation?.enabled || false,
                title: uiConfig.navigation?.title || this.name,
                icon: uiConfig.navigation?.icon || 'extension',
                path: uiConfig.navigation?.path || `/plugins/${this.name}`,
                order: uiConfig.navigation?.order || 100,
                permissions: uiConfig.navigation?.permissions || [],
                ...uiConfig.navigation
            },
            
            // Widgets
            widgets: uiConfig.widgets || [],
            
            // Pages
            pages: uiConfig.pages || [],
            
            // Components
            components: uiConfig.components || [],
            
            // Styles
            styles: uiConfig.styles || [],
            
            // Scripts
            scripts: uiConfig.scripts || [],
            
            // Assets
            assets: uiConfig.assets || [],
            
            ...uiConfig
        };
    }

    /**
     * Initialize API configuration
     * @param {Object} apiConfig - API configuration
     * @returns {Object} Initialized API config
     */
    initializeAPI(apiConfig) {
        return {
            // API routes
            routes: apiConfig.routes || [],
            
            // WebSocket events
            websocket: apiConfig.websocket || [],
            
            // Middleware
            middleware: apiConfig.middleware || [],
            
            // Rate limiting
            rateLimit: apiConfig.rateLimit || {
                windowMs: 15 * 60 * 1000, // 15 minutes
                max: 100 // limit each IP to 100 requests per windowMs
            },
            
            ...apiConfig
        };
    }

    /**
     * Initialize the plugin
     * @param {Object} context - Plugin context
     * @returns {Promise<boolean>} Success status
     */
    async init(context = {}) {
        try {
            this.log('info', `Initializing plugin: ${this.name} v${this.version}`);
            this.metrics.startTime = Date.now();
            
            // Set plugin paths
            this.pluginPath = context.pluginPath || path.join(process.cwd(), 'plugins', this.name);
            this.dataPath = path.join(this.pluginPath, 'data');
            this.logPath = path.join(this.pluginPath, 'logs');
            
            // Initialize services
            this.logger = context.logger || console;
            this.database = context.database;
            this.cache = context.cache;
            this.fileService = context.fileService;
            
            // Create necessary directories
            await this.createDirectories();
            
            // Load settings from storage
            await this.loadSettings();
            
            // Initialize database tables
            await this.initializeDatabase();
            
            // Register hooks
            await this.registerHooks(context.hookManager);
            
            // Register API routes
            await this.registerAPIRoutes(context.app);
            
            // Register UI components
            await this.registerUIComponents(context.uiManager);
            
            // Initialize plugin-specific logic
            await this.onInit(context);
            
            this.isInitialized = true;
            this.metrics.loadTime = Date.now() - this.metrics.startTime;
            
            this.log('info', `Plugin initialized successfully in ${this.metrics.loadTime}ms`);
            this.emit('initialized', this);
            
            return true;
            
        } catch (error) {
            this.error('Plugin initialization failed', error);
            this.errors.push(error);
            this.emit('error', error);
            return false;
        }
    }

    /**
     * Enable the plugin
     * @returns {Promise<boolean>} Success status
     */
    async enable() {
        try {
            if (!this.isInitialized) {
                throw new Error('Plugin must be initialized before enabling');
            }
            
            this.log('info', `Enabling plugin: ${this.name}`);
            
            // Check dependencies
            await this.checkDependencies();
            
            // Check permissions
            await this.checkPermissions();
            
            // Enable hooks
            await this.enableHooks();
            
            // Start plugin-specific services
            await this.onEnable();
            
            this.isEnabled = true;
            this.isRunning = true;
            this.metrics.lastActivity = Date.now();
            
            this.log('info', `Plugin enabled successfully`);
            this.emit('enabled', this);
            
            return true;
            
        } catch (error) {
            this.error('Plugin enable failed', error);
            this.errors.push(error);
            this.emit('error', error);
            return false;
        }
    }

    /**
     * Disable the plugin
     * @returns {Promise<boolean>} Success status
     */
    async disable() {
        try {
            this.log('info', `Disabling plugin: ${this.name}`);
            
            // Disable hooks
            await this.disableHooks();
            
            // Stop plugin-specific services
            await this.onDisable();
            
            this.isEnabled = false;
            this.isRunning = false;
            this.metrics.lastActivity = Date.now();
            
            this.log('info', `Plugin disabled successfully`);
            this.emit('disabled', this);
            
            return true;
            
        } catch (error) {
            this.error('Plugin disable failed', error);
            this.errors.push(error);
            this.emit('error', error);
            return false;
        }
    }

    /**
     * Uninstall the plugin
     * @returns {Promise<boolean>} Success status
     */
    async uninstall() {
        try {
            this.log('info', `Uninstalling plugin: ${this.name}`);
            
            // Disable plugin first
            if (this.isEnabled) {
                await this.disable();
            }
            
            // Clean up database
            await this.cleanupDatabase();
            
            // Remove files
            await this.cleanupFiles();
            
            // Plugin-specific cleanup
            await this.onUninstall();
            
            this.log('info', `Plugin uninstalled successfully`);
            this.emit('uninstalled', this);
            
            return true;
            
        } catch (error) {
            this.error('Plugin uninstall failed', error);
            this.errors.push(error);
            this.emit('error', error);
            return false;
        }
    }

    /**
     * Get plugin status
     * @returns {Object} Plugin status
     */
    getStatus() {
        return {
            name: this.name,
            version: this.version,
            description: this.description,
            author: this.author,
            license: this.license,
            isEnabled: this.isEnabled,
            isInitialized: this.isInitialized,
            isRunning: this.isRunning,
            errors: this.errors.length,
            warnings: this.warnings.length,
            metrics: this.getMetrics(),
            settings: this.settings,
            hooks: Object.keys(this.hooks),
            ui: this.ui,
            api: this.api
        };
    }

    /**
     * Get plugin metrics
     * @returns {Object} Plugin metrics
     */
    getMetrics() {
        return {
            ...this.metrics,
            uptime: this.metrics.startTime ? Date.now() - this.metrics.startTime : 0,
            memoryUsage: process.memoryUsage(),
            errorRate: this.metrics.requestCount > 0 ? this.metrics.errorCount / this.metrics.requestCount : 0
        };
    }

    /**
     * Create necessary directories
     * @returns {Promise<void>}
     */
    async createDirectories() {
        const directories = [this.dataPath, this.logPath];
        
        for (const dir of directories) {
            await fs.ensureDir(dir);
        }
    }

    /**
     * Load settings from storage
     * @returns {Promise<void>}
     */
    async loadSettings() {
        try {
            const settingsFile = path.join(this.dataPath, 'settings.json');
            
            if (await fs.pathExists(settingsFile)) {
                const storedSettings = await fs.readJson(settingsFile);
                
                // Merge stored settings with defaults
                for (const [key, setting] of Object.entries(this.settings)) {
                    if (storedSettings[key] !== undefined) {
                        this.settings[key].value = storedSettings[key];
                    }
                }
            }
        } catch (error) {
            this.warn('Failed to load settings', error);
        }
    }

    /**
     * Save settings to storage
     * @returns {Promise<void>}
     */
    async saveSettings() {
        try {
            const settingsFile = path.join(this.dataPath, 'settings.json');
            const settingsToSave = {};
            
            for (const [key, setting] of Object.entries(this.settings)) {
                settingsToSave[key] = setting.value;
            }
            
            await fs.writeJson(settingsFile, settingsToSave, { spaces: 2 });
        } catch (error) {
            this.error('Failed to save settings', error);
        }
    }

    /**
     * Initialize database tables
     * @returns {Promise<void>}
     */
    async initializeDatabase() {
        // Override in plugin implementation
    }

    /**
     * Register hooks with the hook manager
     * @param {Object} hookManager - Hook manager instance
     * @returns {Promise<void>}
     */
    async registerHooks(hookManager) {
        if (!hookManager) return;
        
        for (const [name, hook] of Object.entries(this.hooks)) {
            if (hook.handler && hook.enabled) {
                hookManager.register(name, hook.handler, hook.priority);
                this.log('debug', `Registered hook: ${name}`);
            }
        }
    }

    /**
     * Register API routes
     * @param {Object} app - Express app instance
     * @returns {Promise<void>}
     */
    async registerAPIRoutes(app) {
        if (!app || !this.api.routes.length) return;
        
        const router = require('express').Router();
        
        for (const route of this.api.routes) {
            const { method, path, handler, middleware = [] } = route;
            
            // Add plugin-specific middleware
            const allMiddleware = [...this.api.middleware, ...middleware];
            
            router[method.toLowerCase()](path, ...allMiddleware, handler.bind(this));
            this.log('debug', `Registered API route: ${method.toUpperCase()} ${path}`);
        }
        
        app.use(`/api/plugins/${this.name}`, router);
    }

    /**
     * Register UI components
     * @param {Object} uiManager - UI manager instance
     * @returns {Promise<void>}
     */
    async registerUIComponents(uiManager) {
        if (!uiManager) return;
        
        // Register widgets
        for (const widget of this.ui.widgets) {
            uiManager.registerWidget(widget);
        }
        
        // Register pages
        for (const page of this.ui.pages) {
            uiManager.registerPage(page);
        }
        
        // Register components
        for (const component of this.ui.components) {
            uiManager.registerComponent(component);
        }
    }

    /**
     * Check plugin dependencies
     * @returns {Promise<void>}
     */
    async checkDependencies() {
        // Override in plugin implementation
    }

    /**
     * Check plugin permissions
     * @returns {Promise<void>}
     */
    async checkPermissions() {
        // Override in plugin implementation
    }

    /**
     * Enable hooks
     * @returns {Promise<void>}
     */
    async enableHooks() {
        // Override in plugin implementation
    }

    /**
     * Disable hooks
     * @returns {Promise<void>}
     */
    async disableHooks() {
        // Override in plugin implementation
    }

    /**
     * Clean up database
     * @returns {Promise<void>}
     */
    async cleanupDatabase() {
        // Override in plugin implementation
    }

    /**
     * Clean up files
     * @returns {Promise<void>}
     */
    async cleanupFiles() {
        // Override in plugin implementation
    }

    /**
     * Plugin initialization hook
     * @param {Object} context - Plugin context
     * @returns {Promise<void>}
     */
    async onInit(context) {
        // Override in plugin implementation
    }

    /**
     * Plugin enable hook
     * @returns {Promise<void>}
     */
    async onEnable() {
        // Override in plugin implementation
    }

    /**
     * Plugin disable hook
     * @returns {Promise<void>}
     */
    async onDisable() {
        // Override in plugin implementation
    }

    /**
     * Plugin uninstall hook
     * @returns {Promise<void>}
     */
    async onUninstall() {
        // Override in plugin implementation
    }

    /**
     * Log a message
     * @param {string} level - Log level
     * @param {string} message - Log message
     * @param {*} data - Additional data
     */
    log(level, message, data = null) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            plugin: this.name,
            message,
            data
        };
        
        if (this.logger) {
            this.logger.log(JSON.stringify(logEntry));
        }
        
        this.emit('log', logEntry);
    }

    /**
     * Log an error
     * @param {string} message - Error message
     * @param {Error} error - Error object
     */
    error(message, error) {
        this.metrics.errorCount++;
        this.errors.push({ message, error: error.message, stack: error.stack });
        this.log('error', message, error);
    }

    /**
     * Log a warning
     * @param {string} message - Warning message
     * @param {*} data - Additional data
     */
    warn(message, data = null) {
        this.warnings.push({ message, data });
        this.log('warn', message, data);
    }

    /**
     * Update a setting
     * @param {string} key - Setting key
     * @param {*} value - Setting value
     * @returns {Promise<void>}
     */
    async updateSetting(key, value) {
        if (!this.settings[key]) {
            throw new Error(`Setting '${key}' does not exist`);
        }
        
        // Validate value
        if (this.settings[key].validation) {
            const isValid = this.settings[key].validation(value);
            if (!isValid) {
                throw new Error(`Invalid value for setting '${key}'`);
            }
        }
        
        this.settings[key].value = value;
        await this.saveSettings();
        
        this.emit('settingUpdated', { key, value });
    }

    /**
     * Get a setting value
     * @param {string} key - Setting key
     * @returns {*} Setting value
     */
    getSetting(key) {
        if (!this.settings[key]) {
            throw new Error(`Setting '${key}' does not exist`);
        }
        
        return this.settings[key].value;
    }

    /**
     * Get all settings
     * @returns {Object} All settings
     */
    getSettings() {
        return this.settings;
    }
}

module.exports = PluginTemplate;
