const fs = require('fs-extra');
const path = require('path');
const chokidar = require('chokidar');
const yaml = require('yaml');
const archiver = require('archiver');
const extract = require('extract-zip');
const glob = require('glob');
const BeamErrorHandler = require('../utils/BeamErrorHandler');
const BeamPerformanceMonitor = require('../utils/BeamPerformanceMonitor');
const BeamPluginSandbox = require('./BeamPluginSandbox');

class BeamPluginManager {
    constructor() {
        this.plugins = new Map();
        this.pluginDir = path.join(__dirname, '../plugins/installed');
        this.tempDir = path.join(__dirname, '../plugins/temp');
        this.ensureDirectories();
        this.watcher = null;
        this.hooks = new Map();
        this.initializeHooks();
    }

    ensureDirectories() {
        fs.ensureDirSync(this.pluginDir);
        fs.ensureDirSync(this.tempDir);
        fs.ensureDirSync(path.join(this.pluginDir, 'active'));
        fs.ensureDirSync(path.join(this.pluginDir, 'disabled'));
    }

    initializeHooks() {
        // Define available hooks
        const hookTypes = [
            'onRequest',
            'onResponse',
            'onError',
            'onAuth',
            'onFileUpload',
            'onFileDownload',
            'onUserCreate',
            'onUserUpdate',
            'onUserDelete',
            'onSystemStart',
            'onSystemStop',
            'onCron',
            'onWebhook',
            'onApiCall',
            'onDatabaseQuery'
        ];

        hookTypes.forEach(hook => {
            this.hooks.set(hook, []);
        });
    }

    async loadPlugins() {
        try {
            const activePluginsDir = path.join(this.pluginDir, 'active');
            const pluginDirs = await fs.readdir(activePluginsDir);

            for (const pluginDir of pluginDirs) {
                const pluginPath = path.join(activePluginsDir, pluginDir);
                const stat = await fs.stat(pluginPath);
                
                if (stat.isDirectory()) {
                    await this.loadPlugin(pluginPath);
                }
            }

            console.log(`Loaded ${this.plugins.size} plugins`);
            BeamPerformanceMonitor.recordPluginLoad(this.plugins.size);
            
        } catch (error) {
            BeamErrorHandler.logError('Plugin Loading Error', error);
        }
    }

    async loadPlugin(pluginPath) {
        try {
            const manifestPath = path.join(pluginPath, 'plugin.yaml');
            
            if (!await fs.pathExists(manifestPath)) {
                throw new Error(`Plugin manifest not found: ${manifestPath}`);
            }

            const manifestContent = await fs.readFile(manifestPath, 'utf8');
            const manifest = yaml.parse(manifestContent);

            // Validate manifest
            this.validateManifest(manifest);

            // Determine permission level from manifest
            const permissionLevel = manifest.permissionLevel || 'basic';
            
            // Create sandbox for plugin
            const sandbox = BeamPluginSandbox.createSandbox(manifest.id, manifest, permissionLevel);
            
            // Load plugin code in sandbox
            const pluginCode = await this.loadPluginCodeInSandbox(pluginPath, manifest, sandbox);
            
            // Initialize plugin
            const plugin = {
                id: manifest.id,
                name: manifest.name,
                version: manifest.version,
                description: manifest.description,
                author: manifest.author,
                path: pluginPath,
                manifest: manifest,
                sandbox: sandbox,
                permissionLevel: permissionLevel,
                instance: null,
                hooks: new Set(),
                status: 'loading'
            };

            // Execute plugin initialization in sandbox
            if (pluginCode.init) {
                const initCode = `(${pluginCode.init.toString()})(plugin, manager)`;
                plugin.instance = await BeamPluginSandbox.executeInSandbox(manifest.id, initCode, {
                    timeout: 10000
                });
            }

            // Register hooks with sandboxed execution
            if (pluginCode.hooks) {
                for (const [hookName, hookFunction] of Object.entries(pluginCode.hooks)) {
                    if (this.hooks.has(hookName)) {
                        this.hooks.get(hookName).push({
                            plugin: plugin.id,
                            function: async (...args) => {
                                const hookCode = `(${hookFunction.toString()})(...args)`;
                                return await BeamPluginSandbox.executeInSandbox(manifest.id, hookCode, {
                                    timeout: 5000
                                });
                            }
                        });
                        plugin.hooks.add(hookName);
                    }
                }
            }

            this.plugins.set(plugin.id, plugin);
            plugin.status = 'active';

            console.log(`Plugin loaded: ${plugin.name} v${plugin.version} (${permissionLevel})`);
            
        } catch (error) {
            BeamErrorHandler.logError(`Plugin Load Error: ${pluginPath}`, error);
            // Clean up sandbox on error
            if (manifest && manifest.id) {
                BeamPluginSandbox.destroySandbox(manifest.id);
            }
        }
    }

    validateManifest(manifest) {
        const required = ['id', 'name', 'version', 'description', 'author'];
        
        for (const field of required) {
            if (!manifest[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        if (!manifest.id.match(/^[a-z0-9-]+$/)) {
            throw new Error('Plugin ID must contain only lowercase letters, numbers, and hyphens');
        }
    }

    async loadPluginCodeInSandbox(pluginPath, manifest, sandbox) {
        const mainFile = manifest.main || 'index.js';
        const mainPath = path.join(pluginPath, mainFile);
        
        if (!await fs.pathExists(mainPath)) {
            throw new Error(`Plugin main file not found: ${mainPath}`);
        }

        // Load plugin code in sandbox
        const pluginCode = await BeamPluginSandbox.loadPluginFile(manifest.id, mainPath);
        
        if (typeof pluginCode !== 'object' || pluginCode === null) {
            throw new Error('Plugin must export an object');
        }

        return pluginCode;
    }

    async loadPluginCode(pluginPath, manifest) {
        const mainFile = manifest.main || 'index.js';
        const mainPath = path.join(pluginPath, mainFile);
        
        if (!await fs.pathExists(mainPath)) {
            throw new Error(`Plugin main file not found: ${mainPath}`);
        }

        // Load and execute plugin code (legacy method - not sandboxed)
        const pluginCode = require(mainPath);
        
        if (typeof pluginCode !== 'object' || pluginCode === null) {
            throw new Error('Plugin must export an object');
        }

        return pluginCode;
    }

    async installPlugin(pluginFile) {
        try {
            const tempPath = path.join(this.tempDir, `plugin-${Date.now()}`);
            await fs.ensureDir(tempPath);

            // Extract plugin
            await extract(pluginFile, { dir: tempPath });

            // Read manifest
            const manifestPath = path.join(tempPath, 'plugin.yaml');
            if (!await fs.pathExists(manifestPath)) {
                throw new Error('Plugin manifest not found');
            }

            const manifestContent = await fs.readFile(manifestPath, 'utf8');
            const manifest = yaml.parse(manifestContent);

            // Validate plugin
            this.validateManifest(manifest);

            // Check if plugin already exists
            if (this.plugins.has(manifest.id)) {
                throw new Error(`Plugin ${manifest.id} already installed`);
            }

            // Move to plugins directory
            const pluginDir = path.join(this.pluginDir, 'active', manifest.id);
            await fs.move(tempPath, pluginDir);

            // Load the plugin
            await this.loadPlugin(pluginDir);

            console.log(`Plugin installed: ${manifest.name}`);
            BeamPerformanceMonitor.recordPluginInstall(manifest.id);

            return manifest;

        } catch (error) {
            BeamErrorHandler.logError('Plugin Installation Error', error);
            throw error;
        }
    }

    async uninstallPlugin(pluginId) {
        try {
            const plugin = this.plugins.get(pluginId);
            if (!plugin) {
                throw new Error(`Plugin ${pluginId} not found`);
            }

            // Execute cleanup if available
            if (plugin.instance && plugin.instance.cleanup) {
                try {
                    const cleanupCode = `(${plugin.instance.cleanup.toString()})()`;
                    await BeamPluginSandbox.executeInSandbox(pluginId, cleanupCode, {
                        timeout: 5000
                    });
                } catch (error) {
                    console.warn(`Plugin cleanup failed for ${pluginId}:`, error.message);
                }
            }

            // Remove hooks
            for (const hookName of plugin.hooks) {
                const hooks = this.hooks.get(hookName);
                const index = hooks.findIndex(h => h.plugin === pluginId);
                if (index !== -1) {
                    hooks.splice(index, 1);
                }
            }

            // Destroy sandbox
            BeamPluginSandbox.destroySandbox(pluginId);

            // Remove plugin from memory
            this.plugins.delete(pluginId);

            // Move to disabled directory
            const disabledPath = path.join(this.pluginDir, 'disabled', pluginId);
            await fs.move(plugin.path, disabledPath);

            console.log(`Plugin uninstalled: ${plugin.name}`);
            BeamPerformanceMonitor.recordPluginUninstall(pluginId);

        } catch (error) {
            BeamErrorHandler.logError('Plugin Uninstallation Error', error);
            throw error;
        }
    }

    async enablePlugin(pluginId) {
        try {
            const disabledPath = path.join(this.pluginDir, 'disabled', pluginId);
            const activePath = path.join(this.pluginDir, 'active', pluginId);

            if (!await fs.pathExists(disabledPath)) {
                throw new Error(`Plugin ${pluginId} not found in disabled directory`);
            }

            await fs.move(disabledPath, activePath);
            await this.loadPlugin(activePath);

            console.log(`Plugin enabled: ${pluginId}`);
            BeamPerformanceMonitor.recordPluginEnable(pluginId);

        } catch (error) {
            BeamErrorHandler.logError('Plugin Enable Error', error);
            throw error;
        }
    }

    async disablePlugin(pluginId) {
        try {
            const plugin = this.plugins.get(pluginId);
            if (!plugin) {
                throw new Error(`Plugin ${pluginId} not found`);
            }

            // Execute cleanup if available
            if (plugin.instance && plugin.instance.cleanup) {
                try {
                    const cleanupCode = `(${plugin.instance.cleanup.toString()})()`;
                    await BeamPluginSandbox.executeInSandbox(pluginId, cleanupCode, {
                        timeout: 5000
                    });
                } catch (error) {
                    console.warn(`Plugin cleanup failed for ${pluginId}:`, error.message);
                }
            }

            // Remove hooks
            for (const hookName of plugin.hooks) {
                const hooks = this.hooks.get(hookName);
                const index = hooks.findIndex(h => h.plugin === pluginId);
                if (index !== -1) {
                    hooks.splice(index, 1);
                }
            }

            // Destroy sandbox
            BeamPluginSandbox.destroySandbox(pluginId);

            // Remove plugin from memory
            this.plugins.delete(pluginId);

            // Move to disabled directory
            const disabledPath = path.join(this.pluginDir, 'disabled', pluginId);
            await fs.move(plugin.path, disabledPath);

            console.log(`Plugin disabled: ${pluginId}`);
            BeamPerformanceMonitor.recordPluginDisable(pluginId);

        } catch (error) {
            BeamErrorHandler.logError('Plugin Disable Error', error);
            throw error;
        }
    }

    async executeHook(hookName, ...args) {
        try {
            const hooks = this.hooks.get(hookName) || [];
            const results = [];

            for (const hook of hooks) {
                try {
                    const result = await hook.function(...args);
                    results.push({
                        plugin: hook.plugin,
                        result: result,
                        success: true
                    });
                } catch (error) {
                    BeamErrorHandler.logError(`Plugin Hook Error: ${hook.plugin}.${hookName}`, error);
                    results.push({
                        plugin: hook.plugin,
                        error: error.message,
                        success: false
                    });
                }
            }

            return results;

        } catch (error) {
            BeamErrorHandler.logError(`Hook Execution Error: ${hookName}`, error);
            return [];
        }
    }

    getPlugin(pluginId) {
        return this.plugins.get(pluginId);
    }

    getAllPlugins() {
        return Array.from(this.plugins.values());
    }

    getPluginStats() {
        const stats = {
            total: this.plugins.size,
            active: 0,
            disabled: 0,
            hooks: 0
        };

        for (const plugin of this.plugins.values()) {
            if (plugin.status === 'active') {
                stats.active++;
            } else {
                stats.disabled++;
            }
            stats.hooks += plugin.hooks.size;
        }

        return stats;
    }

    startWatching() {
        if (this.watcher) {
            this.watcher.close();
        }

        this.watcher = chokidar.watch(this.pluginDir, {
            ignored: /(^|[\/\\])\../,
            persistent: true
        });

        this.watcher.on('add', (filePath) => {
            console.log(`Plugin file added: ${filePath}`);
        });

        this.watcher.on('change', (filePath) => {
            console.log(`Plugin file changed: ${filePath}`);
            // Reload plugin if it's a manifest or main file
            if (filePath.endsWith('plugin.yaml') || filePath.endsWith('.js')) {
                this.reloadPluginFromPath(filePath);
            }
        });

        this.watcher.on('unlink', (filePath) => {
            console.log(`Plugin file removed: ${filePath}`);
        });
    }

    async reloadPluginFromPath(filePath) {
        try {
            const pluginDir = path.dirname(filePath);
            const pluginId = path.basename(pluginDir);
            
            if (this.plugins.has(pluginId)) {
                await this.disablePlugin(pluginId);
                await this.enablePlugin(pluginId);
            }
        } catch (error) {
            BeamErrorHandler.logError('Plugin Reload Error', error);
        }
    }

    stopWatching() {
        if (this.watcher) {
            this.watcher.close();
            this.watcher = null;
        }
    }

    // Plugin Settings Management Methods

    /**
     * Get settings for a specific plugin
     * @param {string} pluginId - Plugin ID
     * @returns {Object} Plugin settings
     */
    async getPluginSettings(pluginId) {
        try {
            const plugin = this.plugins.get(pluginId);
            if (!plugin) {
                throw new Error(`Plugin ${pluginId} not found`);
            }

            if (plugin.instance && typeof plugin.instance.getSettings === 'function') {
                return plugin.instance.getSettings();
            }

            // Fallback to manifest settings
            const manifestPath = path.join(plugin.path, 'plugin.yaml');
            if (await fs.pathExists(manifestPath)) {
                const manifestContent = await fs.readFile(manifestPath, 'utf8');
                const manifest = yaml.parse(manifestContent);
                return manifest.settings || {};
            }

            return {};
        } catch (error) {
            BeamErrorHandler.logError(`Get Plugin Settings Error: ${pluginId}`, error);
            throw error;
        }
    }

    /**
     * Update settings for a specific plugin
     * @param {string} pluginId - Plugin ID
     * @param {Object} settings - New settings values
     * @returns {Promise<void>}
     */
    async updatePluginSettings(pluginId, settings) {
        try {
            const plugin = this.plugins.get(pluginId);
            if (!plugin) {
                throw new Error(`Plugin ${pluginId} not found`);
            }

            if (plugin.instance && typeof plugin.instance.updateSetting === 'function') {
                // Update each setting individually
                for (const [key, value] of Object.entries(settings)) {
                    await plugin.instance.updateSetting(key, value);
                }
            } else {
                // Fallback: save to settings file
                const settingsFile = path.join(plugin.path, 'data', 'settings.json');
                await fs.ensureDir(path.dirname(settingsFile));
                await fs.writeJson(settingsFile, settings, { spaces: 2 });
            }

            // Emit settings update event
            this.emit('settingsUpdated', { pluginId, settings });
        } catch (error) {
            BeamErrorHandler.logError(`Update Plugin Settings Error: ${pluginId}`, error);
            throw error;
        }
    }

    /**
     * Get settings schema for a specific plugin
     * @param {string} pluginId - Plugin ID
     * @returns {Object} Plugin settings schema
     */
    async getPluginSettingsSchema(pluginId) {
        try {
            const plugin = this.plugins.get(pluginId);
            if (!plugin) {
                throw new Error(`Plugin ${pluginId} not found`);
            }

            // Get schema from manifest
            const manifestPath = path.join(plugin.path, 'plugin.yaml');
            if (await fs.pathExists(manifestPath)) {
                const manifestContent = await fs.readFile(manifestPath, 'utf8');
                const manifest = yaml.parse(manifestContent);
                return manifest.settings || {};
            }

            return {};
        } catch (error) {
            BeamErrorHandler.logError(`Get Plugin Settings Schema Error: ${pluginId}`, error);
            throw error;
        }
    }

    /**
     * Reset settings for a specific plugin to defaults
     * @param {string} pluginId - Plugin ID
     * @returns {Promise<void>}
     */
    async resetPluginSettings(pluginId) {
        try {
            const plugin = this.plugins.get(pluginId);
            if (!plugin) {
                throw new Error(`Plugin ${pluginId} not found`);
            }

            // Get default settings from schema
            const schema = await this.getPluginSettingsSchema(pluginId);
            const defaultSettings = {};

            for (const [key, setting] of Object.entries(schema)) {
                if (setting.default !== undefined) {
                    defaultSettings[key] = setting.default;
                }
            }

            // Update with default settings
            await this.updatePluginSettings(pluginId, defaultSettings);
        } catch (error) {
            BeamErrorHandler.logError(`Reset Plugin Settings Error: ${pluginId}`, error);
            throw error;
        }
    }

    /**
     * Get all enabled plugins
     * @returns {Array} Array of enabled plugins
     */
    getEnabledPlugins() {
        return Array.from(this.plugins.values()).filter(plugin => plugin.status === 'active');
    }

    /**
     * Get all disabled plugins
     * @returns {Array} Array of disabled plugins
     */
    getDisabledPlugins() {
        return Array.from(this.plugins.values()).filter(plugin => plugin.status === 'disabled');
    }

    /**
     * Get all plugin settings
     * @returns {Array} Array of all plugin settings
     */
    async getAllPluginSettings() {
        const allSettings = [];
        
        for (const plugin of this.plugins.values()) {
            try {
                const settings = await this.getPluginSettings(plugin.id);
                allSettings.push({
                    pluginId: plugin.id,
                    pluginName: plugin.name,
                    settings
                });
            } catch (error) {
                BeamErrorHandler.logError(`Get All Plugin Settings Error: ${plugin.id}`, error);
            }
        }

        return allSettings;
    }

    /**
     * Get settings form HTML for a specific plugin
     * @param {string} pluginId - Plugin ID
     * @returns {string} Settings form HTML
     */
    async getPluginSettingsForm(pluginId) {
        try {
            const BeamSettingsManager = require('../widgets/BeamSettingsManager');
            const settingsManager = new BeamSettingsManager();
            return await settingsManager.generateSettingsForm(pluginId);
        } catch (error) {
            BeamErrorHandler.logError(`Get Plugin Settings Form Error: ${pluginId}`, error);
            throw error;
        }
    }

    /**
     * Get settings overview statistics
     * @returns {Object} Settings overview
     */
    getSettingsOverview() {
        try {
            const plugins = this.getAllPlugins();
            const enabledPlugins = this.getEnabledPlugins();
            const disabledPlugins = this.getDisabledPlugins();

            return {
                totalPlugins: plugins.length,
                enabledPlugins: enabledPlugins.length,
                disabledPlugins: disabledPlugins.length,
                totalSettings: plugins.reduce((sum, plugin) => {
                    const settings = plugin.settings || {};
                    return sum + Object.keys(settings).length;
                }, 0)
            };
        } catch (error) {
            BeamErrorHandler.logError('Get Settings Overview Error', error);
            return {
                totalPlugins: 0,
                enabledPlugins: 0,
                disabledPlugins: 0,
                totalSettings: 0
            };
        }
    }

    // Sandbox Management Methods

    /**
     * Get sandbox information for a plugin
     * @param {string} pluginId - Plugin identifier
     * @returns {Object} Sandbox information
     */
    getPluginSandboxInfo(pluginId) {
        return BeamPluginSandbox.getSandboxInfo(pluginId);
    }

    /**
     * Get all sandbox information
     * @returns {Array} Array of sandbox information
     */
    getAllSandboxInfo() {
        return BeamPluginSandbox.getAllSandboxInfo();
    }

    /**
     * Update resource limits for a plugin
     * @param {string} pluginId - Plugin identifier
     * @param {Object} limits - New resource limits
     */
    updatePluginResourceLimits(pluginId, limits) {
        BeamPluginSandbox.updateResourceLimits(pluginId, limits);
    }

    /**
     * Update global resource limits
     * @param {Object} limits - New global resource limits
     */
    updateGlobalResourceLimits(limits) {
        BeamPluginSandbox.updateGlobalResourceLimits(limits);
    }

    /**
     * Get plugin security statistics
     * @returns {Object} Security statistics
     */
    getPluginSecurityStats() {
        try {
            const allSandboxes = BeamPluginSandbox.getAllSandboxInfo();
            const stats = {
                totalSandboxes: allSandboxes.length,
                activeSandboxes: allSandboxes.filter(s => s.isActive).length,
                permissionLevels: {},
                resourceUsage: {
                    totalMemoryMB: 0,
                    totalExecutionTime: 0,
                    totalNetworkRequests: 0,
                    totalDatabaseQueries: 0
                }
            };

            for (const sandbox of allSandboxes) {
                // Count permission levels
                stats.permissionLevels[sandbox.permissionLevel] = 
                    (stats.permissionLevels[sandbox.permissionLevel] || 0) + 1;

                // Sum resource usage
                stats.resourceUsage.totalMemoryMB += sandbox.resourceUsage.memoryUsage;
                stats.resourceUsage.totalExecutionTime += sandbox.resourceUsage.executionTime;
                stats.resourceUsage.totalNetworkRequests += sandbox.resourceUsage.networkRequests;
                stats.resourceUsage.totalDatabaseQueries += sandbox.resourceUsage.databaseQueries;
            }

            return stats;
        } catch (error) {
            BeamErrorHandler.logError('Get Plugin Security Stats Error', error);
            return {
                totalSandboxes: 0,
                activeSandboxes: 0,
                permissionLevels: {},
                resourceUsage: {
                    totalMemoryMB: 0,
                    totalExecutionTime: 0,
                    totalNetworkRequests: 0,
                    totalDatabaseQueries: 0
                }
            };
        }
    }

    /**
     * Validate plugin code for security
     * @param {string} pluginId - Plugin identifier
     * @returns {Object} Validation result
     */
    validatePluginSecurity(pluginId) {
        try {
            const plugin = this.plugins.get(pluginId);
            if (!plugin) {
                throw new Error(`Plugin ${pluginId} not found`);
            }

            const sandboxInfo = BeamPluginSandbox.getSandboxInfo(pluginId);
            if (!sandboxInfo) {
                throw new Error(`Sandbox not found for plugin ${pluginId}`);
            }

            const mainFile = plugin.manifest.main || 'index.js';
            const mainPath = path.join(plugin.path, mainFile);
            
            // Read plugin code for validation
            const code = fs.readFileSync(mainPath, 'utf8');
            
            // Validate code against permissions
            BeamPluginSandbox.validateCode(code, sandboxInfo.permissions);

            return {
                pluginId,
                isValid: true,
                permissionLevel: sandboxInfo.permissionLevel,
                permissions: sandboxInfo.permissions,
                resourceUsage: sandboxInfo.resourceUsage,
                securityChecks: {
                    codeValidation: 'PASSED',
                    permissionValidation: 'PASSED',
                    resourceLimits: 'WITHIN_LIMITS'
                }
            };

        } catch (error) {
            BeamErrorHandler.logError(`Plugin Security Validation Error: ${pluginId}`, error);
            return {
                pluginId,
                isValid: false,
                error: error.message,
                securityChecks: {
                    codeValidation: 'FAILED',
                    permissionValidation: 'FAILED',
                    resourceLimits: 'UNKNOWN'
                }
            };
        }
    }
}

module.exports = new BeamPluginManager();
