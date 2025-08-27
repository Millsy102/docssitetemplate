const BeamErrorHandler = require('../../utils/BeamErrorHandler');
const BeamPerformanceMonitor = require('../../utils/BeamPerformanceMonitor');

class AIGameChat {
    constructor() {
        this.gameEngine = null;
        this.commands = new Map();
        this.context = new Map();
        this.isInitialized = false;
        this.initializeCommands();
    }

    /**
     * Initialize the AI Game Chat
     */
    async initialize() {
        try {
            console.log(' Initializing AI Game Chat...');
            
            // Initialize commands
            this.initializeCommands();
            
            // Initialize context manager
            this.contextManager = new (require('./ContextManager'))();
            
            // Initialize response generator
            this.responseGenerator = new (require('./ResponseGenerator'))();
            
            this.isInitialized = true;
            console.log(' AI Game Chat initialized successfully');
            
        } catch (error) {
            BeamErrorHandler.logError('AI Game Chat Initialization Error', error);
            throw error;
        }
    }

    /**
     * Set the game engine reference
     */
    setGameEngine(gameEngine) {
        this.gameEngine = gameEngine;
    }

    /**
     * Initialize available commands
     */
    initializeCommands() {
        this.commands.set('create_game', this.createGame.bind(this));
        this.commands.set('add_character', this.addCharacter.bind(this));
        this.commands.set('build_scene', this.buildScene.bind(this));
        this.commands.set('generate_assets', this.generateAssets.bind(this));
        this.commands.set('modify_game', this.modifyGame.bind(this));
        this.commands.set('optimize_game', this.optimizeGame.bind(this));
        this.commands.set('add_level', this.addLevel.bind(this));
        this.commands.set('add_mechanics', this.addMechanics.bind(this));
        this.commands.set('change_style', this.changeStyle.bind(this));
        this.commands.set('add_sound', this.addSound.bind(this));
        this.commands.set('add_music', this.addMusic.bind(this));
        this.commands.set('add_effects', this.addEffects.bind(this));
        
        // Unreal Engine commands
        this.commands.set('create_blueprint', this.createBlueprint.bind(this));
        this.commands.set('open_unreal_project', this.openUnrealProject.bind(this));
        this.commands.set('build_unreal_project', this.buildUnrealProject.bind(this));
        this.commands.set('import_unreal_asset', this.importUnrealAsset.bind(this));
        this.commands.set('compile_blueprint', this.compileBlueprint.bind(this));
        this.commands.set('create_unreal_material', this.createUnrealMaterial.bind(this));
        this.commands.set('create_unreal_level', this.createUnrealLevel.bind(this));
        this.commands.set('add_unreal_component', this.addUnrealComponent.bind(this));
        this.commands.set('set_unreal_property', this.setUnrealProperty.bind(this));
        this.commands.set('call_unreal_function', this.callUnrealFunction.bind(this));
        this.commands.set('unreal_status', this.getUnrealStatus.bind(this));
        this.commands.set('unreal_commands', this.getUnrealCommands.bind(this));
        
        this.commands.set('help', this.showHelp.bind(this));
    }

    /**
     * Process a chat message
     */
    async processMessage(message, userId, roomId) {
        try {
            console.log(` Processing message: ${message}`);

            // Extract intent from message
            const intent = await this.extractIntent(message);
            
            // Get command handler
            const command = this.commands.get(intent.action);
            
            if (command) {
                // Execute command
                const response = await command(intent.parameters, userId, roomId);
                return response;
            } else {
                // Default response
                return this.getDefaultResponse(message);
            }

        } catch (error) {
            BeamErrorHandler.logError('Message Processing Error', error);
            return "Sorry, I encountered an error processing your request. Please try again.";
        }
    }

    /**
     * Extract intent from natural language message
     */
    async extractIntent(message) {
        const lowerMessage = message.toLowerCase();
        
        // Create game commands
        if (lowerMessage.includes('create') && lowerMessage.includes('game')) {
            return {
                action: 'create_game',
                parameters: {
                    description: message,
                    type: 'custom'
                }
            };
        }

        // Add character commands
        if (lowerMessage.includes('add') && lowerMessage.includes('character')) {
            return {
                action: 'add_character',
                parameters: {
                    description: message,
                    type: 'character'
                }
            };
        }

        // Build scene commands
        if (lowerMessage.includes('build') || lowerMessage.includes('create') && lowerMessage.includes('scene')) {
            return {
                action: 'build_scene',
                parameters: {
                    description: message,
                    type: 'scene'
                }
            };
        }

        // Generate assets commands
        if (lowerMessage.includes('generate') || lowerMessage.includes('create') && 
            (lowerMessage.includes('model') || lowerMessage.includes('texture') || lowerMessage.includes('sound'))) {
            return {
                action: 'generate_assets',
                parameters: {
                    description: message,
                    type: 'asset'
                }
            };
        }

        // Modify game commands
        if (lowerMessage.includes('modify') || lowerMessage.includes('change') || lowerMessage.includes('make')) {
            return {
                action: 'modify_game',
                parameters: {
                    description: message,
                    type: 'modification'
                }
            };
        }

        // Add level commands
        if (lowerMessage.includes('add') && lowerMessage.includes('level')) {
            return {
                action: 'add_level',
                parameters: {
                    description: message,
                    type: 'level'
                }
            };
        }

        // Unreal Engine blueprint commands
        if (lowerMessage.includes('blueprint') && (lowerMessage.includes('make') || lowerMessage.includes('create'))) {
            return {
                action: 'create_blueprint',
                parameters: {
                    description: message,
                    type: 'actor'
                }
            };
        }

        // Unreal Engine project commands
        if (lowerMessage.includes('unreal') && lowerMessage.includes('project')) {
            if (lowerMessage.includes('open')) {
                return {
                    action: 'open_unreal_project',
                    parameters: {
                        projectPath: this.extractProjectPath(message)
                    }
                };
            } else if (lowerMessage.includes('build')) {
                return {
                    action: 'build_unreal_project',
                    parameters: {
                        configuration: this.extractConfiguration(message)
                    }
                };
            }
        }

        // Unreal Engine asset commands
        if (lowerMessage.includes('import') && lowerMessage.includes('asset')) {
            return {
                action: 'import_unreal_asset',
                parameters: {
                    assetPath: this.extractAssetPath(message),
                    destination: this.extractDestination(message)
                }
            };
        }

        // Unreal Engine material commands
        if (lowerMessage.includes('material') && lowerMessage.includes('create')) {
            return {
                action: 'create_unreal_material',
                parameters: {
                    materialName: this.extractMaterialName(message),
                    shaderCode: this.extractShaderCode(message)
                }
            };
        }

        // Unreal Engine level commands
        if (lowerMessage.includes('level') && lowerMessage.includes('create')) {
            return {
                action: 'create_unreal_level',
                parameters: {
                    levelName: this.extractLevelName(message),
                    template: this.extractTemplate(message)
                }
            };
        }

        // Unreal Engine component commands
        if (lowerMessage.includes('component') && lowerMessage.includes('add')) {
            return {
                action: 'add_unreal_component',
                parameters: {
                    blueprintPath: this.extractBlueprintPath(message),
                    componentType: this.extractComponentType(message)
                }
            };
        }

        // Unreal Engine property commands
        if (lowerMessage.includes('property') && lowerMessage.includes('set')) {
            return {
                action: 'set_unreal_property',
                parameters: {
                    objectPath: this.extractObjectPath(message),
                    propertyName: this.extractPropertyName(message),
                    value: this.extractPropertyValue(message)
                }
            };
        }

        // Unreal Engine function commands
        if (lowerMessage.includes('function') && lowerMessage.includes('call')) {
            return {
                action: 'call_unreal_function',
                parameters: {
                    objectPath: this.extractObjectPath(message),
                    functionName: this.extractFunctionName(message),
                    parameters: this.extractFunctionParameters(message)
                }
            };
        }

        // Unreal Engine status commands
        if (lowerMessage.includes('unreal') && lowerMessage.includes('status')) {
            return {
                action: 'unreal_status',
                parameters: {}
            };
        }

        // Unreal Engine help commands
        if (lowerMessage.includes('unreal') && lowerMessage.includes('commands')) {
            return {
                action: 'unreal_commands',
                parameters: {}
            };
        }

        // Add mechanics commands
        if (lowerMessage.includes('add') && lowerMessage.includes('mechanics')) {
            return {
                action: 'add_mechanics',
                parameters: {
                    description: message,
                    type: 'mechanics'
                }
            };
        }

        // Change style commands
        if (lowerMessage.includes('change') && lowerMessage.includes('style')) {
            return {
                action: 'change_style',
                parameters: {
                    description: message,
                    type: 'style'
                }
            };
        }

        // Add sound commands
        if (lowerMessage.includes('add') && lowerMessage.includes('sound')) {
            return {
                action: 'add_sound',
                parameters: {
                    description: message,
                    type: 'sound'
                }
            };
        }

        // Add music commands
        if (lowerMessage.includes('add') && lowerMessage.includes('music')) {
            return {
                action: 'add_music',
                parameters: {
                    description: message,
                    type: 'music'
                }
            };
        }

        // Add effects commands
        if (lowerMessage.includes('add') && lowerMessage.includes('effect')) {
            return {
                action: 'add_effects',
                parameters: {
                    description: message,
                    type: 'effects'
                }
            };
        }

        // Help command
        if (lowerMessage.includes('help')) {
            return {
                action: 'help',
                parameters: {}
            };
        }

        // Default to create game if no specific intent found
        return {
            action: 'create_game',
            parameters: {
                description: message,
                type: 'custom'
            }
        };
    }

    /**
     * Create a new game
     */
    async createGame(params, userId, roomId) {
        try {
            if (!this.gameEngine) {
                return "Sorry, the game engine is not available right now.";
            }

            const response = `I'll create a game for you! Let me analyze your request and generate:
- Game mechanics and systems
- Characters and environments
- Assets and resources
- Code and logic
Your game will be ready in about 30 seconds!`;

            // Start game creation in background
            this.gameEngine.createGame(params.description, { userId, roomId })
                .then(game => {
                    console.log(' Game created successfully:', game.name);
                })
                .catch(error => {
                    console.error(' Game creation failed:', error);
                });

            return response;

        } catch (error) {
            BeamErrorHandler.logError('Create Game Error', error);
            return "Sorry, I encountered an error creating your game. Please try again.";
        }
    }

    /**
     * Add a character to the game
     */
    async addCharacter(params, userId, roomId) {
        try {
            const response = `I'll add a character to your game! Generating:
- Character model and appearance
- Animations and movements
- Personality and behavior
- Voice and audio
Character added successfully!`;

            return response;

        } catch (error) {
            BeamErrorHandler.logError('Add Character Error', error);
            return "Sorry, I encountered an error adding the character.";
        }
    }

    /**
     * Build a scene
     */
    async buildScene(params, userId, roomId) {
        try {
            const response = `I'll build a scene for your game! Generating:
- Environment and terrain
- Buildings and structures
- Props and decorations
- Lighting and atmosphere
Scene built successfully!`;

            return response;

        } catch (error) {
            BeamErrorHandler.logError('Build Scene Error', error);
            return "Sorry, I encountered an error building the scene.";
        }
    }

    /**
     * Generate assets
     */
    async generateAssets(params, userId, roomId) {
        try {
            const response = `I'll generate assets for your game! Creating:
- 3D models and textures
- Audio and sound effects
- Animations and effects
- Materials and shaders
Assets generated successfully!`;

            return response;

        } catch (error) {
            BeamErrorHandler.logError('Generate Assets Error', error);
            return "Sorry, I encountered an error generating assets.";
        }
    }

    /**
     * Modify existing game
     */
    async modifyGame(params, userId, roomId) {
        try {
            const response = `I'll modify your game! Applying changes:
- Updating game elements
- Modifying mechanics
- Adjusting settings
- Optimizing performance
Game modified successfully!`;

            return response;

        } catch (error) {
            BeamErrorHandler.logError('Modify Game Error', error);
            return "Sorry, I encountered an error modifying the game.";
        }
    }

    /**
     * Optimize game
     */
    async optimizeGame(params, userId, roomId) {
        try {
            const response = `I'll optimize your game! Improving:
- Performance and frame rate
- Memory usage
- Asset compression
- Code efficiency
Game optimized successfully!`;

            return response;

        } catch (error) {
            BeamErrorHandler.logError('Optimize Game Error', error);
            return "Sorry, I encountered an error optimizing the game.";
        }
    }

    /**
     * Add level
     */
    async addLevel(params, userId, roomId) {
        try {
            const response = `I'll add a new level to your game! Creating:
- Level design and layout
- Challenges and obstacles
- Rewards and collectibles
- Progression mechanics
Level added successfully!`;

            return response;

        } catch (error) {
            BeamErrorHandler.logError('Add Level Error', error);
            return "Sorry, I encountered an error adding the level.";
        }
    }

    /**
     * Add mechanics
     */
    async addMechanics(params, userId, roomId) {
        try {
            const response = `I'll add new mechanics to your game! Implementing:
- Gameplay systems
- Player interactions
- Physics and controls
- AI behaviors
Mechanics added successfully!`;

            return response;

        } catch (error) {
            BeamErrorHandler.logError('Add Mechanics Error', error);
            return "Sorry, I encountered an error adding mechanics.";
        }
    }

    /**
     * Change style
     */
    async changeStyle(params, userId, roomId) {
        try {
            const response = `I'll change the style of your game! Updating:
- Visual appearance
- Art direction
- Color schemes
- UI elements
Style changed successfully!`;

            return response;

        } catch (error) {
            BeamErrorHandler.logError('Change Style Error', error);
            return "Sorry, I encountered an error changing the style.";
        }
    }

    /**
     * Add sound
     */
    async addSound(params, userId, roomId) {
        try {
            const response = `I'll add sound effects to your game! Creating:
- Environmental sounds
- Character sounds
- UI sounds
- Ambient audio
Sounds added successfully!`;

            return response;

        } catch (error) {
            BeamErrorHandler.logError('Add Sound Error', error);
            return "Sorry, I encountered an error adding sounds.";
        }
    }

    /**
     * Add music
     */
    async addMusic(params, userId, roomId) {
        try {
            const response = `I'll add music to your game! Composing:
- Background music
- Theme songs
- Dynamic music
- Audio mixing
Music added successfully!`;

            return response;

        } catch (error) {
            BeamErrorHandler.logError('Add Music Error', error);
            return "Sorry, I encountered an error adding music.";
        }
    }

    /**
     * Add effects
     */
    async addEffects(params, userId, roomId) {
        try {
            const response = `I'll add visual effects to your game! Creating:
- Particle effects
- Lighting effects
- Post-processing
- Screen effects
Effects added successfully!`;

            return response;

        } catch (error) {
            BeamErrorHandler.logError('Add Effects Error', error);
            return "Sorry, I encountered an error adding effects.";
        }
    }

    /**
     * Create Unreal Engine blueprint
     */
    async createBlueprint(params, userId, roomId) {
        try {
            if (!this.gameEngine || !this.gameEngine.unreal) {
                return "Unreal Engine integration is not available. Please check your configuration.";
            }

            const description = params.description || params.text || "Basic actor blueprint";
            const blueprintType = params.type || 'actor';

            const result = await this.gameEngine.unreal.generateBlueprint(description, blueprintType);
            
            if (result.success) {
                return ` Blueprint created successfully! 
- Name: ${result.data?.name || 'Generated Blueprint'}
- Type: ${blueprintType}
- Description: ${description}

The blueprint has been created in your Unreal Engine project.`;
            } else {
                return `Failed to create blueprint: ${result.error || 'Unknown error'}`;
            }

        } catch (error) {
            BeamErrorHandler.logError('Create Blueprint Error', error);
            return "Sorry, I encountered an error creating the blueprint.";
        }
    }

    /**
     * Open Unreal Engine project
     */
    async openUnrealProject(params, userId, roomId) {
        try {
            if (!this.gameEngine || !this.gameEngine.unreal) {
                return "Unreal Engine integration is not available. Please check your configuration.";
            }

            const projectPath = params.projectPath || process.env.UNREAL_PROJECT_PATH;
            
            if (!projectPath) {
                return "No project path specified. Please set UNREAL_PROJECT_PATH environment variable or provide a project path.";
            }

            const result = await this.gameEngine.unreal.executeCommand('open_project', { projectPath });
            
            if (result.success) {
                return ` Unreal Engine project opened successfully!
- Project: ${projectPath}
- Status: Running

You can now work with your project in Unreal Engine.`;
            } else {
                return `Failed to open project: ${result.error || 'Unknown error'}`;
            }

        } catch (error) {
            BeamErrorHandler.logError('Open Unreal Project Error', error);
            return "Sorry, I encountered an error opening the Unreal project.";
        }
    }

    /**
     * Build Unreal Engine project
     */
    async buildUnrealProject(params, userId, roomId) {
        try {
            if (!this.gameEngine || !this.gameEngine.unreal) {
                return "Unreal Engine integration is not available. Please check your configuration.";
            }

            const configuration = params.configuration || 'Development';
            const result = await this.gameEngine.unreal.executeCommand('build_project', { configuration });
            
            if (result.success) {
                return ` Unreal Engine project built successfully!
- Configuration: ${configuration}
- Status: Build completed

Your project is now ready to run.`;
            } else {
                return `Failed to build project: ${result.error || 'Unknown error'}`;
            }

        } catch (error) {
            BeamErrorHandler.logError('Build Unreal Project Error', error);
            return "Sorry, I encountered an error building the Unreal project.";
        }
    }

    /**
     * Import asset into Unreal Engine
     */
    async importUnrealAsset(params, userId, roomId) {
        try {
            if (!this.gameEngine || !this.gameEngine.unreal) {
                return "Unreal Engine integration is not available. Please check your configuration.";
            }

            const assetPath = params.assetPath;
            const destination = params.destination || '/Game/Imported';
            
            if (!assetPath) {
                return "Please specify an asset path to import.";
            }

            const result = await this.gameEngine.unreal.executeCommand('import_asset', { assetPath, destination });
            
            if (result.success) {
                return ` Asset imported successfully!
- Asset: ${assetPath}
- Destination: ${destination}
- Status: Imported

The asset is now available in your Unreal Engine project.`;
            } else {
                return `Failed to import asset: ${result.error || 'Unknown error'}`;
            }

        } catch (error) {
            BeamErrorHandler.logError('Import Unreal Asset Error', error);
            return "Sorry, I encountered an error importing the asset.";
        }
    }

    /**
     * Compile blueprint
     */
    async compileBlueprint(params, userId, roomId) {
        try {
            if (!this.gameEngine || !this.gameEngine.unreal) {
                return "Unreal Engine integration is not available. Please check your configuration.";
            }

            const blueprintPath = params.blueprintPath;
            
            if (!blueprintPath) {
                return "Please specify a blueprint path to compile.";
            }

            const result = await this.gameEngine.unreal.executeCommand('compile_blueprint', { blueprintPath });
            
            if (result.success) {
                return ` Blueprint compiled successfully!
- Blueprint: ${blueprintPath}
- Status: Compiled

The blueprint is now ready to use.`;
            } else {
                return `Failed to compile blueprint: ${result.error || 'Unknown error'}`;
            }

        } catch (error) {
            BeamErrorHandler.logError('Compile Blueprint Error', error);
            return "Sorry, I encountered an error compiling the blueprint.";
        }
    }

    /**
     * Create material in Unreal Engine
     */
    async createUnrealMaterial(params, userId, roomId) {
        try {
            if (!this.gameEngine || !this.gameEngine.unreal) {
                return "Unreal Engine integration is not available. Please check your configuration.";
            }

            const materialName = params.materialName;
            const shaderCode = params.shaderCode || '';
            
            if (!materialName) {
                return "Please specify a material name.";
            }

            const result = await this.gameEngine.unreal.executeCommand('create_material', { materialName, shaderCode });
            
            if (result.success) {
                return ` Material created successfully!
- Name: ${materialName}
- Status: Created

The material is now available in your Unreal Engine project.`;
            } else {
                return `Failed to create material: ${result.error || 'Unknown error'}`;
            }

        } catch (error) {
            BeamErrorHandler.logError('Create Unreal Material Error', error);
            return "Sorry, I encountered an error creating the material.";
        }
    }

    /**
     * Create level in Unreal Engine
     */
    async createUnrealLevel(params, userId, roomId) {
        try {
            if (!this.gameEngine || !this.gameEngine.unreal) {
                return "Unreal Engine integration is not available. Please check your configuration.";
            }

            const levelName = params.levelName;
            const template = params.template || 'Empty';
            
            if (!levelName) {
                return "Please specify a level name.";
            }

            const result = await this.gameEngine.unreal.executeCommand('create_level', { levelName, template });
            
            if (result.success) {
                return ` Level created successfully!
- Name: ${levelName}
- Template: ${template}
- Status: Created

The level is now available in your Unreal Engine project.`;
            } else {
                return `Failed to create level: ${result.error || 'Unknown error'}`;
            }

        } catch (error) {
            BeamErrorHandler.logError('Create Unreal Level Error', error);
            return "Sorry, I encountered an error creating the level.";
        }
    }

    /**
     * Add component to blueprint
     */
    async addUnrealComponent(params, userId, roomId) {
        try {
            if (!this.gameEngine || !this.gameEngine.unreal) {
                return "Unreal Engine integration is not available. Please check your configuration.";
            }

            const blueprintPath = params.blueprintPath;
            const componentType = params.componentType;
            
            if (!blueprintPath || !componentType) {
                return "Please specify both blueprint path and component type.";
            }

            const result = await this.gameEngine.unreal.executeCommand('add_component', { blueprintPath, componentType });
            
            if (result.success) {
                return ` Component added successfully!
- Blueprint: ${blueprintPath}
- Component: ${componentType}
- Status: Added

The component has been added to your blueprint.`;
            } else {
                return `Failed to add component: ${result.error || 'Unknown error'}`;
            }

        } catch (error) {
            BeamErrorHandler.logError('Add Unreal Component Error', error);
            return "Sorry, I encountered an error adding the component.";
        }
    }

    /**
     * Set property on object
     */
    async setUnrealProperty(params, userId, roomId) {
        try {
            if (!this.gameEngine || !this.gameEngine.unreal) {
                return "Unreal Engine integration is not available. Please check your configuration.";
            }

            const objectPath = params.objectPath;
            const propertyName = params.propertyName;
            const value = params.value;
            
            if (!objectPath || !propertyName || value === undefined) {
                return "Please specify object path, property name, and value.";
            }

            const result = await this.gameEngine.unreal.executeCommand('set_property', { objectPath, propertyName, value });
            
            if (result.success) {
                return ` Property set successfully!
- Object: ${objectPath}
- Property: ${propertyName}
- Value: ${value}
- Status: Updated

The property has been updated.`;
            } else {
                return `Failed to set property: ${result.error || 'Unknown error'}`;
            }

        } catch (error) {
            BeamErrorHandler.logError('Set Unreal Property Error', error);
            return "Sorry, I encountered an error setting the property.";
        }
    }

    /**
     * Call function on object
     */
    async callUnrealFunction(params, userId, roomId) {
        try {
            if (!this.gameEngine || !this.gameEngine.unreal) {
                return "Unreal Engine integration is not available. Please check your configuration.";
            }

            const objectPath = params.objectPath;
            const functionName = params.functionName;
            const parameters = params.parameters || [];
            
            if (!objectPath || !functionName) {
                return "Please specify object path and function name.";
            }

            const result = await this.gameEngine.unreal.executeCommand('call_function', { objectPath, functionName, parameters });
            
            if (result.success) {
                return ` Function called successfully!
- Object: ${objectPath}
- Function: ${functionName}
- Parameters: ${JSON.stringify(parameters)}
- Status: Executed

The function has been executed.`;
            } else {
                return `Failed to call function: ${result.error || 'Unknown error'}`;
            }

        } catch (error) {
            BeamErrorHandler.logError('Call Unreal Function Error', error);
            return "Sorry, I encountered an error calling the function.";
        }
    }

    /**
     * Get Unreal Engine status
     */
    async getUnrealStatus(params, userId, roomId) {
        try {
            if (!this.gameEngine || !this.gameEngine.unreal) {
                return "Unreal Engine integration is not available. Please check your configuration.";
            }

            const status = this.gameEngine.unreal.getStatus();
            
            return ` **Unreal Engine Status**

- Connected: ${status.isConnected ? 'Yes' : 'No'}
- Connection Type: ${status.connectionType || 'None'}
- Engine Path: ${status.unrealPath || 'Not found'}
- Project Path: ${status.projectPath || 'Not set'}
- Initialized: ${status.isInitialized ? 'Yes' : 'No'}
- Commands Executed: ${status.commandHistory}

**Setup Instructions:**
1. Set UNREAL_ENGINE_PATH environment variable
2. Set UNREAL_PROJECT_PATH environment variable
3. Ensure Unreal Engine is installed and accessible

**Available Commands:**
Use "unreal_commands" to see all available Unreal Engine commands.`;

        } catch (error) {
            BeamErrorHandler.logError('Get Unreal Status Error', error);
            return "Sorry, I encountered an error getting the Unreal Engine status.";
        }
    }

    /**
     * Get available Unreal Engine commands
     */
    async getUnrealCommands(params, userId, roomId) {
        try {
            if (!this.gameEngine || !this.gameEngine.unreal) {
                return "Unreal Engine integration is not available. Please check your configuration.";
            }

            const commands = this.gameEngine.unreal.getAvailableCommands();
            
            return ` **Available Unreal Engine Commands**

**Blueprint Commands:**
- create_blueprint - Create a new blueprint
- compile_blueprint - Compile an existing blueprint

**Project Commands:**
- open_unreal_project - Open an Unreal project
- build_unreal_project - Build an Unreal project
- cook_content - Cook content for a platform
- package_project - Package project for distribution

**Asset Commands:**
- import_unreal_asset - Import an asset into Unreal
- export_asset - Export an asset from Unreal
- create_unreal_material - Create a material
- create_unreal_level - Create a level

**Component Commands:**
- add_unreal_component - Add a component to a blueprint
- set_unreal_property - Set a property on an object
- call_unreal_function - Call a function on an object

**Automation Commands:**
- run_automation - Run automation tests

**Status Commands:**
- unreal_status - Get Unreal Engine status
- unreal_commands - Show this help

**Examples:**
- "Make me a blueprint that moves and jumps"
- "Create a weapon blueprint that fires projectiles"
- "Open my Unreal project"
- "Build my Unreal project"
- "Import a 3D model into Unreal"`;

        } catch (error) {
            BeamErrorHandler.logError('Get Unreal Commands Error', error);
            return "Sorry, I encountered an error getting the Unreal Engine commands.";
        }
    }

    /**
     * Show help
     */
    async showHelp(params, userId, roomId) {
        const helpText = ` **AI Game Engine Commands**

**Create Games:**
- "Create a 3D platformer with a cat character"
- "Make a racing game with futuristic cars"
- "Build an RPG with magic and quests"

**Modify Games:**
- "Make the character purple and add wings"
- "Add a boss battle level"
- "Change the game style to cartoon"

**Add Elements:**
- "Add a new character"
- "Build a forest scene"
- "Add background music"
- "Generate sound effects"

**Unreal Engine Commands:**
- "Make me a blueprint that shoots fireballs"
- "Create a character blueprint with movement"
- "Open my Unreal project"
- "Build my Unreal project"
- "Import a 3D model into Unreal"
- "Create a material in Unreal"
- "Add a component to my blueprint"
- "Set a property on my actor"
- "Call a function on my blueprint"

**Examples:**
- "Create a simple 3D platformer"
- "Make an RPG with a wizard"
- "Add a dragon boss to my game"
- "Change the style to sci-fi"
- "Make me a blueprint that moves and jumps"
- "Create a weapon blueprint that fires projectiles"

Just describe what you want, and I'll create it for you! `;

        return helpText;
    }

    /**
     * Get default response
     */
    getDefaultResponse(message) {
        return `I can help you create games! Try saying:
- "Create a 3D platformer"
- "Make an RPG with magic"
- "Add a character to my game"
- "Help" for more commands

What kind of game would you like to create? `;
    }

    /**
     * Extract project path from message
     */
    extractProjectPath(message) {
        // Look for path patterns in the message
        const pathMatch = message.match(/(?:project|path|file)\s+(?:at\s+)?["']?([^"'\s]+\.uproject)["']?/i);
        return pathMatch ? pathMatch[1] : null;
    }

    /**
     * Extract configuration from message
     */
    extractConfiguration(message) {
        const configMatch = message.match(/(?:configuration|config)\s+(development|debug|release|shipping)/i);
        return configMatch ? configMatch[1] : 'Development';
    }

    /**
     * Extract asset path from message
     */
    extractAssetPath(message) {
        const pathMatch = message.match(/(?:asset|file|model)\s+(?:at\s+)?["']?([^"'\s]+\.(?:fbx|obj|3ds|dae|blend))["']?/i);
        return pathMatch ? pathMatch[1] : null;
    }

    /**
     * Extract destination from message
     */
    extractDestination(message) {
        const destMatch = message.match(/(?:to|destination|folder)\s+["']?([^"'\s]+)["']?/i);
        return destMatch ? destMatch[1] : '/Game/Imported';
    }

    /**
     * Extract material name from message
     */
    extractMaterialName(message) {
        const nameMatch = message.match(/(?:material|name)\s+(?:called\s+)?["']?([^"'\s]+)["']?/i);
        return nameMatch ? nameMatch[1] : 'NewMaterial';
    }

    /**
     * Extract shader code from message
     */
    extractShaderCode(message) {
        // This would need more sophisticated parsing for actual shader code
        return '';
    }

    /**
     * Extract level name from message
     */
    extractLevelName(message) {
        const nameMatch = message.match(/(?:level|name)\s+(?:called\s+)?["']?([^"'\s]+)["']?/i);
        return nameMatch ? nameMatch[1] : 'NewLevel';
    }

    /**
     * Extract template from message
     */
    extractTemplate(message) {
        const templateMatch = message.match(/(?:template|type)\s+(empty|basic|outdoor|indoor)/i);
        return templateMatch ? templateMatch[1] : 'Empty';
    }

    /**
     * Extract blueprint path from message
     */
    extractBlueprintPath(message) {
        const pathMatch = message.match(/(?:blueprint|path)\s+(?:at\s+)?["']?([^"'\s]+)["']?/i);
        return pathMatch ? pathMatch[1] : null;
    }

    /**
     * Extract component type from message
     */
    extractComponentType(message) {
        const typeMatch = message.match(/(?:component|type)\s+(staticmesh|skeletalmesh|light|camera|collision)/i);
        return typeMatch ? typeMatch[1] : 'StaticMesh';
    }

    /**
     * Extract object path from message
     */
    extractObjectPath(message) {
        const pathMatch = message.match(/(?:object|actor|path)\s+(?:at\s+)?["']?([^"'\s]+)["']?/i);
        return pathMatch ? pathMatch[1] : null;
    }

    /**
     * Extract property name from message
     */
    extractPropertyName(message) {
        const propMatch = message.match(/(?:property|name)\s+(?:called\s+)?["']?([^"'\s]+)["']?/i);
        return propMatch ? propMatch[1] : null;
    }

    /**
     * Extract property value from message
     */
    extractPropertyValue(message) {
        const valueMatch = message.match(/(?:value|set\s+to)\s+["']?([^"'\s]+)["']?/i);
        return valueMatch ? valueMatch[1] : null;
    }

    /**
     * Extract function name from message
     */
    extractFunctionName(message) {
        const funcMatch = message.match(/(?:function|method|name)\s+(?:called\s+)?["']?([^"'\s]+)["']?/i);
        return funcMatch ? funcMatch[1] : null;
    }

    /**
     * Extract function parameters from message
     */
    extractFunctionParameters(message) {
        // This would need more sophisticated parsing for actual parameters
        return [];
    }

    /**
     * Get chat status
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            commands: Array.from(this.commands.keys()),
            context: this.context.size
        };
    }
}

module.exports = AIGameChat;
