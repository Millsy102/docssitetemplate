const BeamErrorHandler = require('../utils/BeamErrorHandler');
const BeamPerformanceMonitor = require('../utils/BeamPerformanceMonitor');
const beamDatabase = require('../database/BeamDatabase');
const { log } = require('../../utils/logger');

class AIGameEngine {
    constructor() {
        this.name = 'AIGameEngine';
        this.version = '1.0.0';
        this.gameCreator = null;
        this.chat = null;
        this.assetGenerator = null;
        this.templates = null;
        this.metrics = null;
        this.rateLimiter = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the AI Game Engine
     */
    async initialize() {
        try {
            log.info('Initializing AI Game Engine...');
            
            // Initialize core components
            await this.initializeComponents();
            
            // Initialize AI services
            await this.initializeAIServices();
            
            // Register with Beam system
            await this.registerWithBeam();
            
            this.isInitialized = true;
            log.info('AI Game Engine initialized successfully');
            
        } catch (error) {
            BeamErrorHandler.logError('AI Game Engine Initialization Error', error);
            throw error;
        }
    }

    /**
     * Initialize core components
     */
    async initializeComponents() {
        // Import AI components
        const AIGameCreator = require('./game-creator/AIGameCreator');
        const AIGameChat = require('./chat/AIGameChat');
        const AIAssetGenerator = require('./assets/AIAssetGenerator');
        const AIGameTemplates = require('./templates/AIGameTemplates');
        const AIMetrics = require('./utils/AIMetrics');
        const AIRateLimiter = require('./utils/AIRateLimiter');

        // Initialize components
        this.gameCreator = new AIGameCreator();
        this.chat = new AIGameChat();
        this.assetGenerator = new AIAssetGenerator();
        this.templates = new AIGameTemplates();
        this.metrics = new AIMetrics();
        this.rateLimiter = new AIRateLimiter();

        // Initialize each component
        await this.gameCreator.initialize();
        await this.chat.initialize();
        await this.assetGenerator.initialize();
        await this.templates.initialize();
    }

    /**
     * Initialize AI services
     */
    async initializeAIServices() {
        // Initialize OpenAI integration
        const OpenAIIntegration = require('./integrations/OpenAIIntegration');
        this.openai = new OpenAIIntegration();

        // Initialize Stability AI integration
        const StabilityAIIntegration = require('./integrations/StabilityAIIntegration');
        this.stability = new StabilityAIIntegration();

        // Initialize ElevenLabs integration
        const ElevenLabsIntegration = require('./integrations/ElevenLabsIntegration');
        this.elevenlabs = new ElevenLabsIntegration();

        // Initialize Luma AI integration
        const LumaAIIntegration = require('./integrations/LumaAIIntegration');
        this.luma = new LumaAIIntegration();

        // Initialize Unreal Engine integration
        const UnrealEngineIntegration = require('./integrations/UnrealEngineIntegration');
        this.unreal = new UnrealEngineIntegration();
        await this.unreal.initialize();
    }

    /**
     * Register with Beam system
     */
    async registerWithBeam() {
        // Register with plugin manager
        const BeamPluginManager = require('../plugins/BeamPluginManager');
        BeamPluginManager.registerPlugin(this);

        // Register with widget manager
        const BeamWidgetManager = require('../widgets/BeamWidgetManager');
        BeamWidgetManager.registerWidget('AIGameChat', require('./widgets/AIGameChatWidget'));
        BeamWidgetManager.registerWidget('AIGameCreator', require('./widgets/AIGameCreatorWidget'));
        BeamWidgetManager.registerWidget('AIAssetGenerator', require('./widgets/AIAssetGeneratorWidget'));

        // Register with services
        const BeamChatService = require('../services/BeamChatService');
        BeamChatService.registerAIGameEngine(this);

        // Add global commands
        global.createGame = this.createGame.bind(this);
        global.generateAsset = this.generateAsset.bind(this);
        global.modifyGame = this.modifyGame.bind(this);
    }

    /**
     * Create a game from natural language prompt
     */
    async createGame(prompt, options = {}) {
        const startTime = Date.now();
        
        try {
            // Check rate limits
            await this.rateLimiter.checkLimit('game_creation');

            log.info(`Creating game: ${prompt}`);

            // Parse the prompt
            const gameSpec = await this.parsePrompt(prompt);
            
            // Generate the complete game
            const game = await this.gameCreator.generateGame(gameSpec, options);
            
            // Optimize and validate
            await this.optimizeGame(game);
            
            // Save to database
            await this.saveGame(game);
            
            // Track metrics
            const endTime = Date.now();
            this.metrics.trackGenerationTime(startTime, endTime);
            this.metrics.trackSuccessRate(true);

            log.info('Game created successfully!');
            return game;

        } catch (error) {
            this.metrics.trackSuccessRate(false);
            BeamErrorHandler.logError('Game Creation Error', error);
            throw error;
        }
    }

    /**
     * Parse natural language prompt into game specifications
     */
    async parsePrompt(prompt) {
        try {
            const requirements = await this.openai.generateGameDescription(prompt);
            
            return {
                genre: requirements.genre,
                characters: requirements.characters,
                mechanics: requirements.mechanics,
                environment: requirements.environment,
                story: requirements.story,
                style: requirements.style,
                difficulty: requirements.difficulty,
                estimatedTime: requirements.estimatedTime
            };
        } catch (error) {
            BeamErrorHandler.logError('Prompt Parsing Error', error);
            throw error;
        }
    }

    /**
     * Generate assets using AI
     */
    async generateAsset(type, description, options = {}) {
        const startTime = Date.now();
        
        try {
            // Check rate limits
            await this.rateLimiter.checkLimit('asset_generation');

            console.log(` Generating ${type}: ${description.prompt}`);

            let asset;
            switch (type) {
                case '3d-model':
                    asset = await this.assetGenerator.generate3DModel(description, options);
                    break;
                case 'texture':
                    asset = await this.assetGenerator.generateTexture(description, options);
                    break;
                case 'music':
                    asset = await this.assetGenerator.generateMusic(description, options);
                    break;
                case 'sfx':
                    asset = await this.assetGenerator.generateSFX(description, options);
                    break;
                case 'voice':
                    asset = await this.assetGenerator.generateVoice(description, options);
                    break;
                default:
                    throw new Error(`Unknown asset type: ${type}`);
            }

            // Track metrics
            const endTime = Date.now();
            this.metrics.trackGenerationTime(startTime, endTime);
            this.metrics.trackSuccessRate(true);

            console.log(` ${type} generated successfully!`);
            return asset;

        } catch (error) {
            this.metrics.trackSuccessRate(false);
            BeamErrorHandler.logError('Asset Generation Error', error);
            throw error;
        }
    }

    /**
     * Modify existing game
     */
    async modifyGame(game, modification) {
        const startTime = Date.now();
        
        try {
            console.log(` Modifying game: ${modification.type}`);

            const modifiedGame = await this.gameCreator.modifyGame(game, modification);
            
            // Save modifications
            await this.saveGame(modifiedGame);
            
            // Track metrics
            const endTime = Date.now();
            this.metrics.trackGenerationTime(startTime, endTime);
            this.metrics.trackSuccessRate(true);

            console.log(' Game modified successfully!');
            return modifiedGame;

        } catch (error) {
            this.metrics.trackSuccessRate(false);
            BeamErrorHandler.logError('Game Modification Error', error);
            throw error;
        }
    }

    /**
     * Create game from template
     */
    async createFromTemplate(templateName, customizations = {}) {
        try {
            const template = this.templates.getTemplate(templateName);
            if (!template) {
                throw new Error(`Template ${templateName} not found`);
            }

            // Combine template with customizations
            const prompt = this.templates.buildPrompt(template, customizations);
            
            // Generate game using AI
            return await this.createGame(prompt, { template: templateName });
        } catch (error) {
            BeamErrorHandler.logError('Template Game Creation Error', error);
            throw error;
        }
    }

    /**
     * Optimize game performance
     */
    async optimizeGame(game) {
        try {
            console.log(' Optimizing game performance...');
            
            // Optimize assets
            await this.assetGenerator.optimizeAssets(game.assets);
            
            // Optimize code
            await this.gameCreator.optimizeCode(game.code);
            
            // Optimize performance
            await this.gameCreator.optimizePerformance(game);
            
            console.log(' Game optimization completed');
        } catch (error) {
            BeamErrorHandler.logError('Game Optimization Error', error);
            // Don't throw error, optimization is not critical
        }
    }

    /**
     * Save game to database
     */
    async saveGame(game) {
        try {
            const Game = beamDatabase.model('Game');
            
            const gameData = {
                name: game.name,
                genre: game.genre,
                description: game.description,
                assets: game.assets,
                code: game.code,
                metadata: game.metadata,
                createdBy: game.createdBy,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            if (game.id) {
                await Game.findByIdAndUpdate(game.id, gameData);
            } else {
                const newGame = new Game(gameData);
                await newGame.save();
                game.id = newGame._id;
            }

            console.log(` Game saved to database: ${game.name}`);
        } catch (error) {
            BeamErrorHandler.logError('Game Save Error', error);
            throw error;
        }
    }

    /**
     * Load game from database
     */
    async loadGame(gameId) {
        try {
            const Game = beamDatabase.model('Game');
            const game = await Game.findById(gameId);
            
            if (!game) {
                throw new Error(`Game not found: ${gameId}`);
            }

            return game;
        } catch (error) {
            BeamErrorHandler.logError('Game Load Error', error);
            throw error;
        }
    }

    /**
     * Get available templates
     */
    getTemplates() {
        return this.templates.getAllTemplates();
    }

    /**
     * Get metrics
     */
    getMetrics() {
        return this.metrics.getMetrics();
    }

    /**
     * Get system status
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            templates: this.templates.getTemplateCount(),
            metrics: this.metrics.getMetrics(),
            rateLimits: this.rateLimiter.getStatus()
        };
    }

    /**
     * Plugin interface methods
     */
    async onSystemStart() {
        await this.initialize();
    }

    async onSystemStop() {
        console.log(' AI Game Engine shutting down...');
    }

    getPluginInfo() {
        return {
            name: this.name,
            version: this.version,
            description: 'AI-powered game engine that creates games through conversation',
            author: 'Beam System',
            hooks: ['onSystemStart', 'onSystemStop']
        };
    }
}

module.exports = AIGameEngine;
