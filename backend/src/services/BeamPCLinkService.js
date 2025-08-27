const WebSocket = require('ws');
const crypto = require('crypto');
const BeamErrorHandler = require('../utils/BeamErrorHandler');
const BeamCache = require('../utils/BeamCache');

class BeamPCLinkService {
    constructor() {
        this.connectedClients = new Map();
        this.commandQueue = new Map();
        this.pcToolsStatus = new Map();
        this.websocketServer = null;
        this.apiKeys = new Set();
        
        this.initializePCLinkService();
    }

    initializePCLinkService() {
        console.log(' Initializing BeamFlow PC Link Service...');
        
        // Load API keys from environment or config
        this.loadApiKeys();
        
        // Setup WebSocket server for PC clients
        this.setupWebSocketServer();
        
        // Setup command handlers
        this.setupCommandHandlers();
        
        console.log(' BeamFlow PC Link Service initialized');
    }

    loadApiKeys() {
        // Load API keys from environment variables
        const envApiKey = process.env.BEAMFLOW_PC_LINK_API_KEY;
        if (envApiKey) {
            this.apiKeys.add(envApiKey);
        }
        
        // Generate default API key if none exists
        if (this.apiKeys.size === 0) {
            const defaultKey = crypto.randomBytes(32).toString('hex');
            this.apiKeys.add(defaultKey);
            console.log(' Generated default PC Link API key:', defaultKey);
        }
    }

    setupWebSocketServer() {
        // This will be called from the main server to attach the WebSocket server
        this.websocketServer = null;
    }

    attachWebSocketServer(server) {
        this.websocketServer = new WebSocket.Server({ 
            server: server,
            path: '/pc-link'
        });

        this.websocketServer.on('connection', (ws, req) => {
            this.handlePCLinkConnection(ws, req);
        });

        console.log(' PC Link WebSocket server attached');
    }

    handlePCLinkConnection(ws, req) {
        const url = new URL(req.url, 'http://localhost');
        const apiKey = url.searchParams.get('apiKey');
        
        if (!this.validateApiKey(apiKey)) {
            console.log(' Invalid API key for PC Link connection');
            ws.close(1008, 'Invalid API key');
            return;
        }

        const clientId = crypto.randomUUID();
        const clientInfo = {
            id: clientId,
            ws: ws,
            apiKey: apiKey,
            connectedAt: new Date(),
            tools: {},
            status: 'connected'
        };

        this.connectedClients.set(clientId, clientInfo);
        console.log(` PC Link client connected: ${clientId}`);

        ws.on('message', (data) => {
            this.handlePCLinkMessage(clientId, data);
        });

        ws.on('close', () => {
            this.handlePCLinkDisconnection(clientId);
        });

        ws.on('error', (error) => {
            console.error(` PC Link client error (${clientId}):`, error);
            this.handlePCLinkDisconnection(clientId);
        });

        // Send welcome message
        this.sendToClient(clientId, {
            type: 'welcome',
            clientId: clientId,
            message: 'Connected to BeamFlow PC Link Service'
        });
    }

    handlePCLinkDisconnection(clientId) {
        const client = this.connectedClients.get(clientId);
        if (client) {
            console.log(` PC Link client disconnected: ${clientId}`);
            this.connectedClients.delete(clientId);
            
            // Update status
            client.status = 'disconnected';
            this.pcToolsStatus.set(clientId, client.tools);
        }
    }

    handlePCLinkMessage(clientId, data) {
        try {
            const message = JSON.parse(data);
            const client = this.connectedClients.get(clientId);
            
            if (!client) {
                console.error(` Unknown client ID: ${clientId}`);
                return;
            }

            switch (message.type) {
                case 'pc-link-status':
                    this.handlePCLinkStatus(clientId, message);
                    break;
                    
                case 'pc-tools-status':
                    this.handlePCToolsStatus(clientId, message);
                    break;
                    
                case 'command-result':
                    this.handleCommandResult(clientId, message);
                    break;
                    
                case 'command-error':
                    this.handleCommandError(clientId, message);
                    break;
                    
                default:
                    console.log(` Unknown message type from PC client: ${message.type}`);
            }
            
        } catch (error) {
            console.error(` Error handling PC Link message:`, error);
        }
    }

    handlePCLinkStatus(clientId, message) {
        const client = this.connectedClients.get(clientId);
        if (client) {
            client.status = message.status;
            console.log(` PC Link client status (${clientId}): ${message.status}`);
        }
    }

    handlePCToolsStatus(clientId, message) {
        const client = this.connectedClients.get(clientId);
        if (client) {
            client.tools = message.tools;
            this.pcToolsStatus.set(clientId, message.tools);
            
            // Cache the tools status
            BeamCache.set(`pc-tools-${clientId}`, message.tools, 300); // 5 minutes
            
            console.log(` PC Tools status updated for client ${clientId}:`, 
                Object.keys(message.tools).filter(tool => message.tools[tool].available));
        }
    }

    handleCommandResult(clientId, message) {
        const commandId = message.commandId;
        const command = this.commandQueue.get(commandId);
        
        if (command) {
            command.resolve(message.result);
            this.commandQueue.delete(commandId);
            console.log(` Command ${commandId} completed successfully`);
        } else {
            console.log(` Received result for unknown command: ${commandId}`);
        }
    }

    handleCommandError(clientId, message) {
        const commandId = message.commandId;
        const command = this.commandQueue.get(commandId);
        
        if (command) {
            command.reject(new Error(message.error));
            this.commandQueue.delete(commandId);
            console.log(` Command ${commandId} failed: ${message.error}`);
        } else {
            console.log(` Received error for unknown command: ${commandId}`);
        }
    }

    async sendCommandToPC(clientId, command) {
        const client = this.connectedClients.get(clientId);
        if (!client || client.status !== 'connected') {
            throw new Error(`PC client ${clientId} is not connected`);
        }

        const commandId = crypto.randomUUID();
        const commandMessage = {
            id: commandId,
            ...command
        };

        return new Promise((resolve, reject) => {
            // Store command in queue
            this.commandQueue.set(commandId, { resolve, reject });
            
            // Send command to PC client
            this.sendToClient(clientId, commandMessage);
            
            // Set timeout for command
            setTimeout(() => {
                if (this.commandQueue.has(commandId)) {
                    this.commandQueue.delete(commandId);
                    reject(new Error('Command timeout'));
                }
            }, 30000); // 30 second timeout
        });
    }

    sendToClient(clientId, message) {
        const client = this.connectedClients.get(clientId);
        if (client && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify(message));
        } else {
            throw new Error(`Cannot send message to client ${clientId}: not connected`);
        }
    }

    validateApiKey(apiKey) {
        return this.apiKeys.has(apiKey);
    }

    getConnectedClients() {
        return Array.from(this.connectedClients.values()).map(client => ({
            id: client.id,
            status: client.status,
            connectedAt: client.connectedAt,
            tools: client.tools
        }));
    }

    getPCToolsStatus(clientId = null) {
        if (clientId) {
            return this.pcToolsStatus.get(clientId) || {};
        }
        
        // Return combined status from all clients
        const combinedTools = {};
        for (const [id, tools] of this.pcToolsStatus) {
            Object.assign(combinedTools, tools);
        }
        return combinedTools;
    }

    // High-level command methods for the website to use
    async launchTool(clientId, toolName, options = {}) {
        return await this.sendCommandToPC(clientId, {
            type: 'launch-tool',
            data: {
                tool: toolName,
                options: options
            }
        });
    }

    async createProject(clientId, projectConfig) {
        return await this.sendCommandToPC(clientId, {
            type: 'create-project',
            data: projectConfig
        });
    }

    async executeUnrealEngineCommand(clientId, action, projectPath, options = {}) {
        return await this.sendCommandToPC(clientId, {
            type: 'unreal-engine-command',
            data: {
                action: action,
                projectPath: projectPath,
                options: options
            }
        });
    }

    async executeFileOperation(clientId, operation) {
        return await this.sendCommandToPC(clientId, {
            type: 'file-operation',
            data: operation
        });
    }

    // Plugin integration methods
    async installUE5Plugin(clientId, pluginConfig) {
        const { name, version, category, features } = pluginConfig;
        
        // Create plugin project structure
        const projectResult = await this.createProject(clientId, {
            type: 'unreal-engine',
            name: `${name}Plugin`,
            template: 'Plugin'
        });
        
        // Execute UE5-specific commands
        const pluginResult = await this.executeUnrealEngineCommand(clientId, 'create-plugin', projectResult.projectPath, {
            pluginName: name,
            category: category,
            features: features
        });
        
        return {
            success: true,
            projectPath: projectResult.projectPath,
            pluginPath: pluginResult.pluginPath,
            message: `UE5 plugin '${name}' created successfully`
        };
    }

    async generateUE5Assets(clientId, assetConfig) {
        const { type, name, projectPath, options } = assetConfig;
        
        return await this.executeUnrealEngineCommand(clientId, 'generate-assets', projectPath, {
            assetType: type,
            assetName: name,
            ...options
        });
    }

    async buildUE5Project(clientId, projectPath, options = {}) {
        return await this.executeUnrealEngineCommand(clientId, 'build-project', projectPath, options);
    }

    async packageUE5Project(clientId, projectPath, options = {}) {
        return await this.executeUnrealEngineCommand(clientId, 'package-project', projectPath, options);
    }

    // AI integration methods
    async generateCodeWithAI(clientId, prompt, options = {}) {
        // This would integrate with your AI system
        const aiResult = await this.processAIRequest(prompt, options);
        
        // Send generated code to PC for compilation/testing
        return await this.sendCommandToPC(clientId, {
            type: 'ai-code-generation',
            data: {
                code: aiResult.code,
                language: aiResult.language,
                options: options
            }
        });
    }

    async processAIRequest(prompt, options) {
        // Placeholder for AI processing
        // This would integrate with your AI system
        return {
            code: `// Generated code for: ${prompt}`,
            language: options.language || 'cpp'
        };
    }

    // Utility methods
    getAvailableClients() {
        return this.getConnectedClients().filter(client => client.status === 'connected');
    }

    getClientWithTool(toolName) {
        const clients = this.getConnectedClients();
        return clients.find(client => 
            client.status === 'connected' && 
            client.tools[toolName]?.available
        );
    }

    async executeOnAnyClient(command) {
        const availableClients = this.getAvailableClients();
        if (availableClients.length === 0) {
            throw new Error('No PC clients connected');
        }
        
        // Use the first available client
        const clientId = availableClients[0].id;
        return await this.sendCommandToPC(clientId, command);
    }
}

module.exports = BeamPCLinkService;
