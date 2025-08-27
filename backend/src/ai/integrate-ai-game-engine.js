const BeamErrorHandler = require('../utils/BeamErrorHandler');
const BeamPerformanceMonitor = require('../utils/BeamPerformanceMonitor');

/**
 * AI Game Engine Integration Script
 * This script integrates the AI Game Engine with the existing Beam System
 */
class AIGameEngineIntegration {
    constructor() {
        this.isIntegrated = false;
        this.aiGameEngine = null;
        this.originalChatService = null;
    }

    /**
     * Integrate AI Game Engine with Beam System
     */
    async integrate() {
        try {
            console.log(' Integrating AI Game Engine with Beam System...');

            // Initialize AI Game Engine
            await this.initializeAIGameEngine();

            // Integrate with existing services
            await this.integrateWithChatService();
            await this.integrateWithPluginManager();
            await this.integrateWithWidgetManager();
            await this.integrateWithDatabase();

            // Add global access
            this.addGlobalAccess();

            // Setup routes
            await this.setupRoutes();

            this.isIntegrated = true;
            console.log(' AI Game Engine successfully integrated with Beam System');

        } catch (error) {
            BeamErrorHandler.logError('AI Game Engine Integration Error', error);
            throw error;
        }
    }

    /**
     * Initialize AI Game Engine
     */
    async initializeAIGameEngine() {
        try {
            const AIGameEngine = require('./AIGameEngine');
            this.aiGameEngine = new AIGameEngine();
            await this.aiGameEngine.initialize();

            // Make globally accessible
            global.aiGameEngine = this.aiGameEngine;

            console.log(' AI Game Engine initialized');

        } catch (error) {
            BeamErrorHandler.logError('AI Game Engine Initialization Error', error);
            throw error;
        }
    }

    /**
     * Integrate with existing Chat Service
     */
    async integrateWithChatService() {
        try {
            const BeamChatService = require('../services/BeamChatService');
            
            // Store original chat service
            this.originalChatService = BeamChatService;

            // Add AI Game Engine methods to chat service
            BeamChatService.registerAIGameEngine = (aiGameEngine) => {
                BeamChatService.aiGameEngine = aiGameEngine;
                BeamChatService.aiChat = aiGameEngine.chat;
                
                // Override message processing to include AI game creation
                const originalProcessMessage = BeamChatService.processMessage;
                BeamChatService.processMessage = async function(message, userId, roomId) {
                    // Check if message is for AI game creation
                    if (this.isAIGameMessage(message)) {
                        return await this.processAIGameMessage(message, userId, roomId);
                    }
                    
                    // Use original processing
                    return await originalProcessMessage.call(this, message, userId, roomId);
                };

                // Add AI game message detection
                BeamChatService.isAIGameMessage = function(message) {
                    const lowerMessage = message.toLowerCase();
                    const aiGameKeywords = [
                        'create game', 'make game', 'build game', 'generate game',
                        'add character', 'build scene', 'generate assets',
                        'modify game', 'optimize game', 'add level'
                    ];
                    
                    return aiGameKeywords.some(keyword => lowerMessage.includes(keyword));
                };

                // Add AI game message processing
                BeamChatService.processAIGameMessage = async function(message, userId, roomId) {
                    try {
                        if (this.aiChat) {
                            return await this.aiChat.processMessage(message, userId, roomId);
                        } else {
                            return "AI Game Engine is not available right now.";
                        }
                    } catch (error) {
                        BeamErrorHandler.logError('AI Game Message Processing Error', error);
                        return "Sorry, I encountered an error processing your game creation request.";
                    }
                };

                console.log(' AI Game Engine integrated with Chat Service');
            };

            // Register AI Game Engine with chat service
            BeamChatService.registerAIGameEngine(this.aiGameEngine);

        } catch (error) {
            BeamErrorHandler.logError('Chat Service Integration Error', error);
            throw error;
        }
    }

    /**
     * Integrate with Plugin Manager
     */
    async integrateWithPluginManager() {
        try {
            const BeamPluginManager = require('../plugins/BeamPluginManager');
            
            // Add AI Game Engine as a plugin
            BeamPluginManager.registerPlugin = function(plugin) {
                if (plugin.getPluginInfo) {
                    const pluginInfo = plugin.getPluginInfo();
                    this.plugins.set(pluginInfo.name, plugin);
                    
                    // Register hooks
                    if (pluginInfo.hooks) {
                        pluginInfo.hooks.forEach(hook => {
                            if (!this.hooks.has(hook)) {
                                this.hooks.set(hook, []);
                            }
                            this.hooks.get(hook).push(plugin);
                        });
                    }
                    
                    console.log(` Plugin registered: ${pluginInfo.name}`);
                }
            };

            // Register AI Game Engine as plugin
            BeamPluginManager.registerPlugin(this.aiGameEngine);

        } catch (error) {
            BeamErrorHandler.logError('Plugin Manager Integration Error', error);
            throw error;
        }
    }

    /**
     * Integrate with Widget Manager
     */
    async integrateWithWidgetManager() {
        try {
            const BeamWidgetManager = require('../widgets/BeamWidgetManager');
            
            // Add widget registration method
            BeamWidgetManager.registerWidget = function(name, widgetClass) {
                try {
                    const widget = new widgetClass();
                    this.widgets.set(name, widget);
                    console.log(` Widget registered: ${name}`);
                } catch (error) {
                    BeamErrorHandler.logError(`Widget Registration Error: ${name}`, error);
                }
            };

            // Register AI Game Engine widgets
            const AIGameChatWidget = require('./widgets/AIGameChatWidget');
            const AIGameCreatorWidget = require('./widgets/AIGameCreatorWidget');
            const AIAssetGeneratorWidget = require('./widgets/AIAssetGeneratorWidget');

            BeamWidgetManager.registerWidget('AIGameChat', AIGameChatWidget);
            BeamWidgetManager.registerWidget('AIGameCreator', AIGameCreatorWidget);
            BeamWidgetManager.registerWidget('AIAssetGenerator', AIAssetGeneratorWidget);

        } catch (error) {
            BeamErrorHandler.logError('Widget Manager Integration Error', error);
            throw error;
        }
    }

    /**
     * Integrate with Database
     */
    async integrateWithDatabase() {
        try {
            const beamDatabase = require('../database/BeamDatabase');
            
            // Add Game model to database
            const mongoose = require('mongoose');
            
            const gameSchema = new mongoose.Schema({
                name: {
                    type: String,
                    required: true,
                    trim: true
                },
                genre: {
                    type: String,
                    required: true
                },
                description: {
                    type: String,
                    default: ''
                },
                assets: {
                    models: [Object],
                    textures: [Object],
                    audio: [Object],
                    animations: [Object]
                },
                code: {
                    main: String,
                    characters: String,
                    scenes: String,
                    gameplay: String,
                    ui: String,
                    audio: String
                },
                metadata: {
                    createdBy: String,
                    createdAt: {
                        type: Date,
                        default: Date.now
                    },
                    updatedAt: {
                        type: Date,
                        default: Date.now
                    },
                    version: {
                        type: String,
                        default: '1.0.0'
                    },
                    spec: Object
                },
                characters: [Object],
                scenes: [Object],
                levels: [Object],
                story: Object,
                gameplay: Object
            });

            // Add indexes
            gameSchema.index({ name: 1 });
            gameSchema.index({ genre: 1 });
            gameSchema.index({ 'metadata.createdBy': 1 });
            gameSchema.index({ 'metadata.createdAt': -1 });

            // Register Game model
            beamDatabase.model('Game', gameSchema);

            console.log(' Game model added to database');

        } catch (error) {
            BeamErrorHandler.logError('Database Integration Error', error);
            throw error;
        }
    }

    /**
     * Add global access to AI Game Engine
     */
    addGlobalAccess() {
        // Add global functions
        global.createGame = this.aiGameEngine.createGame.bind(this.aiGameEngine);
        global.generateAsset = this.aiGameEngine.generateAsset.bind(this.aiGameEngine);
        global.modifyGame = this.aiGameEngine.modifyGame.bind(this.aiGameEngine);
        global.createFromTemplate = this.aiGameEngine.createFromTemplate.bind(this.aiGameEngine);

        // Add Unreal Engine global functions
        global.createUnrealBlueprint = this.aiGameEngine.unreal.generateBlueprint.bind(this.aiGameEngine.unreal);
        global.executeUnrealCommand = this.aiGameEngine.unreal.executeCommand.bind(this.aiGameEngine.unreal);
        global.getUnrealStatus = this.aiGameEngine.unreal.getStatus.bind(this.aiGameEngine.unreal);
        global.getUnrealCommands = this.aiGameEngine.unreal.getAvailableCommands.bind(this.aiGameEngine.unreal);

        // Add global objects
        global.aiGameEngine = this.aiGameEngine;
        global.aiGameChat = this.aiGameEngine.chat;
        global.aiAssetGenerator = this.aiGameEngine.assetGenerator;
        global.aiTemplates = this.aiGameEngine.templates;
        global.unrealEngine = this.aiGameEngine.unreal;

        console.log(' Global access added for AI Game Engine and Unreal Engine');
    }

    /**
     * Setup API routes for AI Game Engine
     */
    async setupRoutes() {
        try {
            const express = require('express');
            const router = express.Router();

            // AI Game Engine routes
            router.post('/ai/game/create', async (req, res) => {
                try {
                    const { prompt, options } = req.body;
                    const game = await this.aiGameEngine.createGame(prompt, options);
                    res.json({ success: true, game });
                } catch (error) {
                    BeamErrorHandler.logError('AI Game Creation Route Error', error);
                    res.status(500).json({ success: false, error: error.message });
                }
            });

            router.post('/ai/asset/generate', async (req, res) => {
                try {
                    const { type, description, options } = req.body;
                    const asset = await this.aiGameEngine.generateAsset(type, description, options);
                    res.json({ success: true, asset });
                } catch (error) {
                    BeamErrorHandler.logError('AI Asset Generation Route Error', error);
                    res.status(500).json({ success: false, error: error.message });
                }
            });

            router.post('/ai/game/modify', async (req, res) => {
                try {
                    const { gameId, modification } = req.body;
                    const game = await this.aiGameEngine.loadGame(gameId);
                    const modifiedGame = await this.aiGameEngine.modifyGame(game, modification);
                    res.json({ success: true, game: modifiedGame });
                } catch (error) {
                    BeamErrorHandler.logError('AI Game Modification Route Error', error);
                    res.status(500).json({ success: false, error: error.message });
                }
            });

            router.get('/ai/templates', async (req, res) => {
                try {
                    const templates = this.aiGameEngine.getTemplates();
                    res.json({ success: true, templates });
                } catch (error) {
                    BeamErrorHandler.logError('AI Templates Route Error', error);
                    res.status(500).json({ success: false, error: error.message });
                }
            });

            router.post('/ai/game/template', async (req, res) => {
                try {
                    const { templateName, customizations } = req.body;
                    const game = await this.aiGameEngine.createFromTemplate(templateName, customizations);
                    res.json({ success: true, game });
                } catch (error) {
                    BeamErrorHandler.logError('AI Template Game Creation Route Error', error);
                    res.status(500).json({ success: false, error: error.message });
                }
            });

            router.get('/ai/status', async (req, res) => {
                try {
                    const status = this.aiGameEngine.getStatus();
                    res.json({ success: true, status });
                } catch (error) {
                    BeamErrorHandler.logError('AI Status Route Error', error);
                    res.status(500).json({ success: false, error: error.message });
                }
            });

            // Unreal Engine routes
            router.post('/ai/unreal/blueprint', async (req, res) => {
                try {
                    const { description, type, options } = req.body;
                    const result = await this.aiGameEngine.unreal.generateBlueprint(description, type, options);
                    res.json({ success: true, result });
                } catch (error) {
                    BeamErrorHandler.logError('Unreal Blueprint Creation Route Error', error);
                    res.status(500).json({ success: false, error: error.message });
                }
            });

            router.post('/ai/unreal/command', async (req, res) => {
                try {
                    const { command, parameters } = req.body;
                    const result = await this.aiGameEngine.unreal.executeCommand(command, parameters);
                    res.json({ success: true, result });
                } catch (error) {
                    BeamErrorHandler.logError('Unreal Command Execution Route Error', error);
                    res.status(500).json({ success: false, error: error.message });
                }
            });

            router.get('/ai/unreal/status', async (req, res) => {
                try {
                    const status = this.aiGameEngine.unreal.getStatus();
                    res.json({ success: true, status });
                } catch (error) {
                    BeamErrorHandler.logError('Unreal Status Route Error', error);
                    res.status(500).json({ success: false, error: error.message });
                }
            });

            router.get('/ai/unreal/commands', async (req, res) => {
                try {
                    const commands = this.aiGameEngine.unreal.getAvailableCommands();
                    res.json({ success: true, commands });
                } catch (error) {
                    BeamErrorHandler.logError('Unreal Commands Route Error', error);
                    res.status(500).json({ success: false, error: error.message });
                }
            });

            router.get('/ai/unreal/history', async (req, res) => {
                try {
                    const history = this.aiGameEngine.unreal.getCommandHistory();
                    res.json({ success: true, history });
                } catch (error) {
                    BeamErrorHandler.logError('Unreal History Route Error', error);
                    res.status(500).json({ success: false, error: error.message });
                }
            });

            // Add routes to main app
            const app = require('../server').app;
            app.use('/api', router);

            console.log(' AI Game Engine routes added');

        } catch (error) {
            BeamErrorHandler.logError('Routes Setup Error', error);
            throw error;
        }
    }

    /**
     * Get integration status
     */
    getStatus() {
        return {
            integrated: this.isIntegrated,
            aiGameEngine: this.aiGameEngine ? this.aiGameEngine.getStatus() : null,
            chatService: this.originalChatService ? 'Integrated' : 'Not Integrated',
            globalAccess: {
                createGame: typeof global.createGame === 'function',
                generateAsset: typeof global.generateAsset === 'function',
                modifyGame: typeof global.modifyGame === 'function',
                aiGameEngine: global.aiGameEngine ? 'Available' : 'Not Available'
            }
        };
    }

    /**
     * Test integration
     */
    async testIntegration() {
        try {
            console.log(' Testing AI Game Engine Integration...');

            // Test AI Game Engine
            const status = this.aiGameEngine.getStatus();
            console.log(' AI Game Engine Status:', status);

            // Test global access
            console.log(' Global Functions:', {
                createGame: typeof global.createGame,
                generateAsset: typeof global.generateAsset,
                modifyGame: typeof global.modifyGame
            });

            // Test chat integration
            if (this.aiGameEngine.chat) {
                const chatStatus = this.aiGameEngine.chat.getStatus();
                console.log(' Chat Integration Status:', chatStatus);
            }

            console.log(' Integration test completed successfully');

        } catch (error) {
            BeamErrorHandler.logError('Integration Test Error', error);
            throw error;
        }
    }
}

// Export integration instance
const integration = new AIGameEngineIntegration();

// Auto-integrate when module is loaded
if (require.main === module) {
    integration.integrate()
        .then(() => integration.testIntegration())
        .then(() => {
            console.log(' AI Game Engine Integration Complete!');
            console.log('Status:', integration.getStatus());
        })
        .catch(error => {
            console.error(' AI Game Engine Integration Failed:', error);
            process.exit(1);
        });
}

module.exports = integration;
