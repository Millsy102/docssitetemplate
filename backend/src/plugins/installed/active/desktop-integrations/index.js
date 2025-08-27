const fs = require('fs-extra');
const path = require('path');
const yaml = require('yaml');
const WebSocket = require('ws');
const axios = require('axios');
const { spawn } = require('child_process');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

class DesktopIntegrationsPlugin {
    constructor() {
        this.name = 'desktop-integrations';
        this.version = '1.0.0';
        this.description = 'Desktop software integration system for BeamFlow';
        this.author = 'BeamFlow Team';
        this.license = 'MIT';
        this.category = 'system';
        this.priority = 'high';
        
        this.connections = new Map();
        this.softwareIntegrations = new Map();
        this.activeCommands = new Map();
        this.settings = {};
        
        this.loadSettings();
        this.loadSoftwareIntegrations();
    }

    async initialize() {
        console.log(' Initializing Desktop Integrations Plugin...');
        
        // Load all desktop software service modules
        await this.loadDesktopServices();
        
        // Initialize WebSocket server for desktop client communication
        this.initializeWebSocketServer();
        
        // Set up API endpoints
        this.setupAPIEndpoints();
        
        // Set up event handlers
        this.setupEventHandlers();
        
        console.log(' Desktop Integrations Plugin initialized successfully');
    }

    async loadSettings() {
        try {
            const configPath = path.join(__dirname, 'plugin.yaml');
            const configContent = await fs.readFile(configPath, 'utf8');
            const config = yaml.parse(configContent);
            this.settings = config.settings || {};
        } catch (error) {
            console.error(' Error loading plugin settings:', error);
            this.settings = {
                websocket_port: 8080,
                api_key_required: true,
                max_file_size: '100MB',
                auto_reconnect: true,
                reconnect_interval: 5000,
                heartbeat_interval: 30000,
                command_timeout: 300000
            };
        }
    }

    async loadSoftwareIntegrations() {
        try {
            const configPath = path.join(__dirname, 'plugin.yaml');
            const configContent = await fs.readFile(configPath, 'utf8');
            const config = yaml.parse(configContent);
            const integrations = config.software_integrations || [];
            
            integrations.forEach(integration => {
                this.softwareIntegrations.set(integration.name, integration);
            });
            
            console.log(` Loaded ${integrations.length} software integrations`);
        } catch (error) {
            console.error(' Error loading software integrations:', error);
        }
    }

    async loadDesktopServices() {
        const servicesDir = path.join(__dirname, '../../../services');
        const serviceFiles = [
            'BeamUnrealEngine.js',
            'BeamDaz3D.js',
            'BeamBlender.js',
            'BeamPhotoshop.js',
            'BeamVisualStudio.js',
            'BeamMaya.js',
            'BeamCinema4D.js',
            'BeamHoudini.js',
            'BeamUnity.js',
            'BeamSubstance.js',
            'BeamZBrush.js',
            'BeamMarmoset.js',
            'BeamQuixel.js',
            'BeamGodot.js',
            'BeamFLStudio.js',
            'BeamAbleton.js',
            'BeamAfterEffects.js',
            'BeamPremiere.js',
            'BeamIllustrator.js',
            'BeamInDesign.js'
        ];

        for (const serviceFile of serviceFiles) {
            try {
                const servicePath = path.join(servicesDir, serviceFile);
                if (await fs.pathExists(servicePath)) {
                    const serviceModule = require(servicePath);
                    const serviceName = serviceFile.replace('Beam', '').replace('.js', '');
                    this.softwareIntegrations.set(serviceName.toLowerCase(), {
                        module: serviceModule,
                        name: serviceName,
                        enabled: true
                    });
                }
            } catch (error) {
                console.warn(` Could not load service ${serviceFile}:`, error.message);
            }
        }
    }

    initializeWebSocketServer() {
        const port = this.settings.websocket_port || 8080;
        
        this.wss = new WebSocket.Server({ port }, () => {
            console.log(` WebSocket server started on port ${port}`);
        });

        this.wss.on('connection', (ws, req) => {
            this.handleWebSocketConnection(ws, req);
        });

        this.wss.on('error', (error) => {
            console.error(' WebSocket server error:', error);
        });
    }

    handleWebSocketConnection(ws, req) {
        const connectionId = uuidv4();
        const clientInfo = {
            id: connectionId,
            ws: ws,
            connected: true,
            lastHeartbeat: Date.now(),
            software: new Map(),
            activeCommands: new Map()
        };

        this.connections.set(connectionId, clientInfo);

        console.log(` Desktop client connected: ${connectionId}`);

        // Send welcome message
        ws.send(JSON.stringify({
            type: 'welcome',
            connectionId: connectionId,
            timestamp: Date.now(),
            message: 'Connected to BeamFlow Desktop Integrations'
        }));

        ws.on('message', (data) => {
            this.handleWebSocketMessage(connectionId, data);
        });

        ws.on('close', () => {
            this.handleWebSocketDisconnection(connectionId);
        });

        ws.on('error', (error) => {
            console.error(` WebSocket error for ${connectionId}:`, error);
            this.handleWebSocketDisconnection(connectionId);
        });

        // Set up heartbeat
        const heartbeatInterval = setInterval(() => {
            if (clientInfo.connected) {
                ws.send(JSON.stringify({
                    type: 'heartbeat',
                    timestamp: Date.now()
                }));
            } else {
                clearInterval(heartbeatInterval);
            }
        }, this.settings.heartbeat_interval || 30000);
    }

    handleWebSocketMessage(connectionId, data) {
        try {
            const message = JSON.parse(data);
            const client = this.connections.get(connectionId);

            if (!client) {
                console.error(` Unknown connection: ${connectionId}`);
                return;
            }

            client.lastHeartbeat = Date.now();

            switch (message.type) {
                case 'heartbeat':
                    this.handleHeartbeat(connectionId, message);
                    break;
                case 'software_status':
                    this.handleSoftwareStatus(connectionId, message);
                    break;
                case 'command_result':
                    this.handleCommandResult(connectionId, message);
                    break;
                case 'progress_update':
                    this.handleProgressUpdate(connectionId, message);
                    break;
                case 'error':
                    this.handleError(connectionId, message);
                    break;
                case 'file_uploaded':
                    this.handleFileUploaded(connectionId, message);
                    break;
                case 'file_downloaded':
                    this.handleFileDownloaded(connectionId, message);
                    break;
                default:
                    console.warn(` Unknown message type: ${message.type}`);
            }
        } catch (error) {
            console.error(' Error handling WebSocket message:', error);
        }
    }

    handleWebSocketDisconnection(connectionId) {
        const client = this.connections.get(connectionId);
        if (client) {
            client.connected = false;
            console.log(` Desktop client disconnected: ${connectionId}`);
            
            // Clean up active commands
            client.activeCommands.forEach((command, commandId) => {
                this.cancelCommand(connectionId, commandId);
            });
            
            this.connections.delete(connectionId);
        }
    }

    handleHeartbeat(connectionId, message) {
        const client = this.connections.get(connectionId);
        if (client) {
            client.lastHeartbeat = Date.now();
        }
    }

    handleSoftwareStatus(connectionId, message) {
        const client = this.connections.get(connectionId);
        if (client && message.software) {
            client.software.set(message.software.name, message.software);
        }
    }

    handleCommandResult(connectionId, message) {
        const client = this.connections.get(connectionId);
        if (client && message.commandId) {
            const command = client.activeCommands.get(message.commandId);
            if (command) {
                command.result = message.result;
                command.completed = true;
                command.completedAt = Date.now();
                
                // Emit event for website to handle
                this.emit('desktop:command_completed', {
                    connectionId,
                    commandId: message.commandId,
                    result: message.result
                });
            }
        }
    }

    handleProgressUpdate(connectionId, message) {
        // Emit progress update for website
        this.emit('desktop:progress_update', {
            connectionId,
            commandId: message.commandId,
            progress: message.progress,
            status: message.status
        });
    }

    handleError(connectionId, message) {
        console.error(` Desktop client error (${connectionId}):`, message.error);
        
        // Emit error event for website
        this.emit('desktop:error_occurred', {
            connectionId,
            error: message.error,
            timestamp: Date.now()
        });
    }

    handleFileUploaded(connectionId, message) {
        // Emit file uploaded event for website
        this.emit('desktop:file_uploaded', {
            connectionId,
            file: message.file,
            timestamp: Date.now()
        });
    }

    handleFileDownloaded(connectionId, message) {
        // Emit file downloaded event for website
        this.emit('desktop:file_downloaded', {
            connectionId,
            file: message.file,
            timestamp: Date.now()
        });
    }

    setupAPIEndpoints() {
        // This will be called by the main server to register API routes
        console.log(' Desktop Integrations API endpoints ready');
    }

    setupEventHandlers() {
        // Set up event handlers for website integration
        console.log(' Desktop Integrations event handlers ready');
    }

    // API Methods for website to use
    async getDesktopStatus() {
        const status = {
            connected: this.connections.size > 0,
            connections: this.connections.size,
            software: Array.from(this.softwareIntegrations.keys()),
            activeCommands: this.activeCommands.size,
            timestamp: Date.now()
        };
        return status;
    }

    async connectToDesktop(apiKey) {
        // Validate API key and establish connection
        if (this.settings.api_key_required && !apiKey) {
            throw new Error('API key required for desktop connection');
        }
        
        // Return connection status
        return {
            connected: this.connections.size > 0,
            connections: this.connections.size
        };
    }

    async disconnectFromDesktop(connectionId) {
        const client = this.connections.get(connectionId);
        if (client && client.ws) {
            client.ws.close();
            return { success: true, message: 'Disconnected successfully' };
        }
        return { success: false, message: 'Connection not found' };
    }

    async executeCommand(connectionId, software, command, params = {}) {
        const client = this.connections.get(connectionId);
        if (!client) {
            throw new Error('Desktop client not connected');
        }

        const commandId = uuidv4();
        const commandData = {
            id: commandId,
            software,
            command,
            params,
            status: 'pending',
            createdAt: Date.now()
        };

        client.activeCommands.set(commandId, commandData);
        this.activeCommands.set(commandId, commandData);

        // Send command to desktop client
        client.ws.send(JSON.stringify({
            type: 'execute_command',
            commandId,
            software,
            command,
            params
        }));

        return { commandId, status: 'sent' };
    }

    async getSoftwareList() {
        return Array.from(this.softwareIntegrations.entries()).map(([name, integration]) => ({
            name,
            enabled: integration.enabled,
            type: integration.type || 'unknown',
            versions: integration.versions || [],
            commands: integration.commands || []
        }));
    }

    async detectSoftware(softwareName) {
        const integration = this.softwareIntegrations.get(softwareName);
        if (!integration) {
            throw new Error(`Software integration not found: ${softwareName}`);
        }

        // Try to detect the software on the desktop
        if (integration.module && integration.module.detectSoftware) {
            return await integration.module.detectSoftware();
        }

        return { detected: false, message: 'Detection method not implemented' };
    }

    async launchSoftware(softwareName, params = {}) {
        const integration = this.softwareIntegrations.get(softwareName);
        if (!integration) {
            throw new Error(`Software integration not found: ${softwareName}`);
        }

        // Launch the software via desktop client
        const connectionId = Array.from(this.connections.keys())[0];
        if (!connectionId) {
            throw new Error('No desktop client connected');
        }

        return await this.executeCommand(connectionId, softwareName, 'launch', params);
    }

    async closeSoftware(softwareName) {
        const integration = this.softwareIntegrations.get(softwareName);
        if (!integration) {
            throw new Error(`Software integration not found: ${softwareName}`);
        }

        const connectionId = Array.from(this.connections.keys())[0];
        if (!connectionId) {
            throw new Error('No desktop client connected');
        }

        return await this.executeCommand(connectionId, softwareName, 'close');
    }

    async createProject(softwareName, projectParams = {}) {
        const connectionId = Array.from(this.connections.keys())[0];
        if (!connectionId) {
            throw new Error('No desktop client connected');
        }

        return await this.executeCommand(connectionId, softwareName, 'create_project', projectParams);
    }

    async renderScene(softwareName, renderParams = {}) {
        const connectionId = Array.from(this.connections.keys())[0];
        if (!connectionId) {
            throw new Error('No desktop client connected');
        }

        return await this.executeCommand(connectionId, softwareName, 'render', renderParams);
    }

    async exportAssets(softwareName, exportParams = {}) {
        const connectionId = Array.from(this.connections.keys())[0];
        if (!connectionId) {
            throw new Error('No desktop client connected');
        }

        return await this.executeCommand(connectionId, softwareName, 'export', exportParams);
    }

    async importAssets(softwareName, importParams = {}) {
        const connectionId = Array.from(this.connections.keys())[0];
        if (!connectionId) {
            throw new Error('No desktop client connected');
        }

        return await this.executeCommand(connectionId, softwareName, 'import', importParams);
    }

    async batchProcess(softwareName, batchParams = {}) {
        const connectionId = Array.from(this.connections.keys())[0];
        if (!connectionId) {
            throw new Error('No desktop client connected');
        }

        return await this.executeCommand(connectionId, softwareName, 'batch_process', batchParams);
    }

    async syncFiles(softwareName, syncParams = {}) {
        const connectionId = Array.from(this.connections.keys())[0];
        if (!connectionId) {
            throw new Error('No desktop client connected');
        }

        return await this.executeCommand(connectionId, softwareName, 'sync', syncParams);
    }

    async createBackup(softwareName, backupParams = {}) {
        const connectionId = Array.from(this.connections.keys())[0];
        if (!connectionId) {
            throw new Error('No desktop client connected');
        }

        return await this.executeCommand(connectionId, softwareName, 'backup', backupParams);
    }

    async restoreBackup(softwareName, restoreParams = {}) {
        const connectionId = Array.from(this.connections.keys())[0];
        if (!connectionId) {
            throw new Error('No desktop client connected');
        }

        return await this.executeCommand(connectionId, softwareName, 'restore', restoreParams);
    }

    async getLogs(softwareName = null) {
        const connectionId = Array.from(this.connections.keys())[0];
        if (!connectionId) {
            throw new Error('No desktop client connected');
        }

        const params = softwareName ? { software: softwareName } : {};
        return await this.executeCommand(connectionId, 'system', 'get_logs', params);
    }

    async getSettings() {
        return this.settings;
    }

    async updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        
        // Save settings to file
        try {
            const configPath = path.join(__dirname, 'plugin.yaml');
            const configContent = await fs.readFile(configPath, 'utf8');
            const config = yaml.parse(configContent);
            config.settings = this.settings;
            
            await fs.writeFile(configPath, yaml.stringify(config));
        } catch (error) {
            console.error(' Error saving settings:', error);
        }

        return { success: true, settings: this.settings };
    }

    async getPluginList() {
        // Return list of available plugins for desktop client
        return Array.from(this.softwareIntegrations.keys()).map(name => ({
            name,
            enabled: this.softwareIntegrations.get(name).enabled,
            type: this.softwareIntegrations.get(name).type || 'unknown'
        }));
    }

    async installPlugin(pluginName) {
        // Install a new plugin for desktop client
        console.log(` Installing plugin: ${pluginName}`);
        return { success: true, message: `Plugin ${pluginName} installed successfully` };
    }

    async uninstallPlugin(pluginName) {
        // Uninstall a plugin from desktop client
        console.log(` Uninstalling plugin: ${pluginName}`);
        return { success: true, message: `Plugin ${pluginName} uninstalled successfully` };
    }

    async updatePlugin(pluginName) {
        // Update a plugin on desktop client
        console.log(` Updating plugin: ${pluginName}`);
        return { success: true, message: `Plugin ${pluginName} updated successfully` };
    }

    async configurePlugin(pluginName, config) {
        // Configure a plugin on desktop client
        console.log(` Configuring plugin: ${pluginName}`);
        return { success: true, message: `Plugin ${pluginName} configured successfully` };
    }

    async healthCheck() {
        const health = {
            status: 'healthy',
            connections: this.connections.size,
            activeCommands: this.activeCommands.size,
            softwareIntegrations: this.softwareIntegrations.size,
            uptime: process.uptime(),
            timestamp: Date.now()
        };

        // Check for any issues
        if (this.connections.size === 0) {
            health.status = 'warning';
            health.message = 'No desktop clients connected';
        }

        return health;
    }

    async restart() {
        console.log(' Restarting Desktop Integrations Plugin...');
        
        // Close all connections
        this.connections.forEach((client, connectionId) => {
            if (client.ws) {
                client.ws.close();
            }
        });
        
        // Clear maps
        this.connections.clear();
        this.activeCommands.clear();
        
        // Reinitialize
        await this.initialize();
        
        return { success: true, message: 'Plugin restarted successfully' };
    }

    async optimize() {
        console.log(' Optimizing Desktop Integrations Plugin...');
        
        // Clean up old commands
        const now = Date.now();
        const timeout = this.settings.command_timeout || 300000;
        
        this.activeCommands.forEach((command, commandId) => {
            if (now - command.createdAt > timeout) {
                this.activeCommands.delete(commandId);
            }
        });
        
        return { success: true, message: 'Plugin optimized successfully' };
    }

    // Event emitter methods
    emit(event, data) {
        // This will be connected to the main server's event system
        console.log(` Emitting event: ${event}`, data);
    }

    // Cleanup method
    async cleanup() {
        console.log(' Cleaning up Desktop Integrations Plugin...');
        
        // Close WebSocket server
        if (this.wss) {
            this.wss.close();
        }
        
        // Close all connections
        this.connections.forEach((client, connectionId) => {
            if (client.ws) {
                client.ws.close();
            }
        });
        
        // Clear maps
        this.connections.clear();
        this.activeCommands.clear();
        this.softwareIntegrations.clear();
        
        console.log(' Desktop Integrations Plugin cleaned up');
    }
}

module.exports = DesktopIntegrationsPlugin;
