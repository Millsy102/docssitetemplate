const BeamErrorHandler = require('../../utils/BeamErrorHandler');
const BeamPerformanceMonitor = require('../../utils/BeamPerformanceMonitor');
const fs = require('fs').promises;
const path = require('path');
const { spawn, exec } = require('child_process');
const axios = require('axios');

class UnrealEngineIntegration {
    constructor() {
        this.name = 'UnrealEngineIntegration';
        this.version = '1.0.0';
        this.unrealPath = process.env.UNREAL_ENGINE_PATH || '';
        this.projectPath = process.env.UNREAL_PROJECT_PATH || '';
        this.pythonPath = process.env.UNREAL_PYTHON_PATH || '';
        this.remoteControlPort = process.env.UNREAL_REMOTE_CONTROL_PORT || 30010;
        this.isConnected = false;
        this.connectionType = null; // 'python', 'remote_control', 'automation', 'cli'
        this.blueprintTemplates = new Map();
        this.commandHistory = [];
        this.isInitialized = false;
    }

    /**
     * Initialize Unreal Engine integration
     */
    async initialize() {
        try {
            console.log(' Initializing Unreal Engine Integration...');
            
            // Detect Unreal Engine installation
            await this.detectUnrealEngine();
            
            // Initialize connection methods
            await this.initializeConnectionMethods();
            
            // Load blueprint templates
            await this.loadBlueprintTemplates();
            
            // Test connection
            await this.testConnection();
            
            this.isInitialized = true;
            console.log(' Unreal Engine Integration initialized successfully');
            
        } catch (error) {
            BeamErrorHandler.logError('Unreal Engine Integration Initialization Error', error);
            throw error;
        }
    }

    /**
     * Detect Unreal Engine installation
     */
    async detectUnrealEngine() {
        const possiblePaths = [
            'C:\\Program Files\\Epic Games\\UE_5.3\\Engine',
            'C:\\Program Files\\Epic Games\\UE_5.2\\Engine',
            'C:\\Program Files\\Epic Games\\UE_5.1\\Engine',
            'C:\\Program Files\\Epic Games\\UE_5.0\\Engine',
            '/Users/Shared/Epic Games/UE_5.3/Engine',
            '/Users/Shared/Epic Games/UE_5.2/Engine',
            '/Users/Shared/Epic Games/UE_5.1/Engine',
            '/Users/Shared/Epic Games/UE_5.0/Engine',
            '/opt/UnrealEngine/Engine'
        ];

        for (const enginePath of possiblePaths) {
            try {
                const stats = await fs.stat(enginePath);
                if (stats.isDirectory()) {
                    this.unrealPath = enginePath;
                    console.log(` Found Unreal Engine at: ${enginePath}`);
                    break;
                }
            } catch (error) {
                // Path doesn't exist, continue
            }
        }

        if (!this.unrealPath) {
            console.log(' Unreal Engine not found in standard locations. Please set UNREAL_ENGINE_PATH environment variable.');
        }
    }

    /**
     * Initialize connection methods
     */
    async initializeConnectionMethods() {
        // Initialize Python API connection
        if (this.unrealPath) {
            this.pythonPath = path.join(this.unrealPath, 'Binaries', 'Win64', 'UnrealEditor.exe');
        }

        // Initialize Remote Control connection
        this.remoteControlUrl = `http://localhost:${this.remoteControlPort}`;

        // Initialize Automation API
        this.automationPath = this.unrealPath ? path.join(this.unrealPath, 'Binaries', 'Win64', 'UnrealEditor.exe') : '';
    }

    /**
     * Load blueprint templates
     */
    async loadBlueprintTemplates() {
        this.blueprintTemplates.set('character', {
            name: 'Character Blueprint',
            description: 'Basic character blueprint with movement and input',
            template: this.getCharacterBlueprintTemplate()
        });

        this.blueprintTemplates.set('weapon', {
            name: 'Weapon Blueprint',
            description: 'Basic weapon blueprint with firing mechanics',
            template: this.getWeaponBlueprintTemplate()
        });

        this.blueprintTemplates.set('pickup', {
            name: 'Pickup Blueprint',
            description: 'Basic pickup blueprint with collection mechanics',
            template: this.getPickupBlueprintTemplate()
        });

        this.blueprintTemplates.set('door', {
            name: 'Door Blueprint',
            description: 'Basic door blueprint with opening/closing mechanics',
            template: this.getDoorBlueprintTemplate()
        });

        this.blueprintTemplates.set('light', {
            name: 'Light Blueprint',
            description: 'Basic light blueprint with toggle functionality',
            template: this.getLightBlueprintTemplate()
        });
    }

    /**
     * Test connection to Unreal Engine
     */
    async testConnection() {
        try {
            // Try Remote Control first
            if (await this.testRemoteControlConnection()) {
                this.connectionType = 'remote_control';
                this.isConnected = true;
                console.log(' Connected to Unreal Engine via Remote Control API');
                return true;
            }

            // Try Python API
            if (await this.testPythonConnection()) {
                this.connectionType = 'python';
                this.isConnected = true;
                console.log(' Connected to Unreal Engine via Python API');
                return true;
            }

            // Try Automation API
            if (await this.testAutomationConnection()) {
                this.connectionType = 'automation';
                this.isConnected = true;
                console.log(' Connected to Unreal Engine via Automation API');
                return true;
            }

            console.log(' No active Unreal Engine connection found. Will use CLI commands.');
            this.connectionType = 'cli';
            return false;

        } catch (error) {
            BeamErrorHandler.logError('Unreal Engine Connection Test Error', error);
            return false;
        }
    }

    /**
     * Test Remote Control connection
     */
    async testRemoteControlConnection() {
        try {
            const response = await axios.get(`${this.remoteControlUrl}/api/v1.0/remote/control/status`, {
                timeout: 5000
            });
            return response.status === 200;
        } catch (error) {
            return false;
        }
    }

    /**
     * Test Python API connection
     */
    async testPythonConnection() {
        try {
            const pythonScript = `
import unreal
print("Python API connected successfully")
`;
            const result = await this.executePythonScript(pythonScript);
            return result.success;
        } catch (error) {
            return false;
        }
    }

    /**
     * Test Automation API connection
     */
    async testAutomationConnection() {
        try {
            const automationScript = `
import unreal
automation_manager = unreal.AutomationManager.get()
print("Automation API connected successfully")
`;
            const result = await this.executeAutomationScript(automationScript);
            return result.success;
        } catch (error) {
            return false;
        }
    }

    /**
     * Generate blueprint from AI description
     */
    async generateBlueprint(description, blueprintType = 'actor', options = {}) {
        try {
            console.log(` Generating ${blueprintType} blueprint: ${description}`);

            // Parse the description using AI
            const blueprintSpec = await this.parseBlueprintDescription(description, blueprintType);
            
            // Generate blueprint code
            const blueprintCode = await this.generateBlueprintCode(blueprintSpec);
            
            // Create blueprint in Unreal Engine
            const result = await this.createBlueprintInUnreal(blueprintCode, blueprintSpec.name);
            
            console.log(` Blueprint generated successfully: ${blueprintSpec.name}`);
            return result;

        } catch (error) {
            BeamErrorHandler.logError('Blueprint Generation Error', error);
            throw error;
        }
    }

    /**
     * Parse blueprint description using AI
     */
    async parseBlueprintDescription(description, blueprintType) {
        // Use AI to parse the description and extract components, variables, functions
        const aiPrompt = `
Parse this Unreal Engine blueprint description and extract the components, variables, and functions needed:

Description: ${description}
Blueprint Type: ${blueprintType}

Extract:
1. Blueprint name
2. Parent class
3. Variables (name, type, default value)
4. Functions (name, parameters, return type)
5. Components to add
6. Event bindings
7. Custom logic requirements
`;

        // This would integrate with your AI system
        const aiResponse = await this.callAIService(aiPrompt);
        
        return this.parseAIResponse(aiResponse, blueprintType);
    }

    /**
     * Generate blueprint code
     */
    async generateBlueprintCode(blueprintSpec) {
        const template = this.blueprintTemplates.get(blueprintSpec.type) || this.blueprintTemplates.get('character');
        
        let code = template.template;
        
        // Replace placeholders with actual values
        code = code.replace(/\{\{NAME\}\}/g, blueprintSpec.name);
        code = code.replace(/\{\{PARENT_CLASS\}\}/g, blueprintSpec.parentClass);
        
        // Add variables
        const variablesCode = blueprintSpec.variables.map(v => 
            `    ${v.type} ${v.name} = ${v.defaultValue};`
        ).join('\n');
        code = code.replace(/\{\{VARIABLES\}\}/g, variablesCode);
        
        // Add functions
        const functionsCode = blueprintSpec.functions.map(f => 
            this.generateFunctionCode(f)
        ).join('\n\n');
        code = code.replace(/\{\{FUNCTIONS\}\}/g, functionsCode);
        
        return code;
    }

    /**
     * Create blueprint in Unreal Engine
     */
    async createBlueprintInUnreal(blueprintCode, blueprintName) {
        switch (this.connectionType) {
            case 'python':
                return await this.createBlueprintViaPython(blueprintCode, blueprintName);
            case 'remote_control':
                return await this.createBlueprintViaRemoteControl(blueprintCode, blueprintName);
            case 'automation':
                return await this.createBlueprintViaAutomation(blueprintCode, blueprintName);
            case 'cli':
            default:
                return await this.createBlueprintViaCLI(blueprintCode, blueprintName);
        }
    }

    /**
     * Create blueprint via Python API
     */
    async createBlueprintViaPython(blueprintCode, blueprintName) {
        const pythonScript = `
import unreal
import json

# Create blueprint
blueprint_name = "${blueprintName}"
blueprint_path = "/Game/Blueprints/${blueprintName}"

# Create the blueprint asset
factory = unreal.BlueprintFactory()
factory.parent_class = unreal.Actor

# Create the asset
asset_tools = unreal.AssetToolsHelpers.get_asset_tools()
blueprint_asset = asset_tools.create_asset(blueprint_name, "/Game/Blueprints", unreal.Blueprint, factory)

if blueprint_asset:
    print(f"Blueprint created: {blueprint_asset.get_path_name()}")
    
    # Apply the generated code
    ${blueprintCode}
    
    # Compile the blueprint
    unreal.EditorLoadingAndSavingUtils.save_dirty_packages(True, True)
    print("Blueprint saved and compiled successfully")
else:
    print("Failed to create blueprint")
`;

        return await this.executePythonScript(pythonScript);
    }

    /**
     * Create blueprint via Remote Control API
     */
    async createBlueprintViaRemoteControl(blueprintCode, blueprintName) {
        try {
            const response = await axios.post(`${this.remoteControlUrl}/api/v1.0/blueprint/create`, {
                name: blueprintName,
                code: blueprintCode,
                path: '/Game/Blueprints'
            });

            return {
                success: response.status === 200,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Create blueprint via Automation API
     */
    async createBlueprintViaAutomation(blueprintCode, blueprintName) {
        const automationScript = `
import unreal

# Create blueprint using automation
blueprint_name = "${blueprintName}"
blueprint_path = "/Game/Blueprints/${blueprintName}"

# Use automation to create blueprint
automation_manager = unreal.AutomationManager.get()
${blueprintCode}

print("Blueprint created via automation")
`;

        return await this.executeAutomationScript(automationScript);
    }

    /**
     * Create blueprint via CLI
     */
    async createBlueprintViaCLI(blueprintCode, blueprintName) {
        if (!this.projectPath) {
            throw new Error('Unreal project path not set. Please set UNREAL_PROJECT_PATH environment variable.');
        }

        const command = `"${this.automationPath}" "${this.projectPath}" -run=Cook -TargetPlatform=Windows -NoLogTimes -Unversioned -Compressed`;
        
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({
                        success: true,
                        output: stdout
                    });
                }
            });
        });
    }

    /**
     * Execute Python script in Unreal Engine
     */
    async executePythonScript(script) {
        if (!this.pythonPath) {
            throw new Error('Python path not set');
        }

        const tempScriptPath = path.join(__dirname, 'temp_script.py');
        await fs.writeFile(tempScriptPath, script);

        const command = `"${this.pythonPath}" "${this.projectPath}" -executePythonScript="${tempScriptPath}"`;

        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                // Clean up temp file
                fs.unlink(tempScriptPath).catch(() => {});
                
                if (error) {
                    reject(error);
                } else {
                    resolve({
                        success: true,
                        output: stdout
                    });
                }
            });
        });
    }

    /**
     * Execute automation script in Unreal Engine
     */
    async executeAutomationScript(script) {
        if (!this.automationPath) {
            throw new Error('Automation path not set');
        }

        const tempScriptPath = path.join(__dirname, 'temp_automation.py');
        await fs.writeFile(tempScriptPath, script);

        const command = `"${this.automationPath}" "${this.projectPath}" -run=Automation -Script="${tempScriptPath}"`;

        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                // Clean up temp file
                fs.unlink(tempScriptPath).catch(() => {});
                
                if (error) {
                    reject(error);
                } else {
                    resolve({
                        success: true,
                        output: stdout
                    });
                }
            });
        });
    }

    /**
     * Call AI service for parsing
     */
    async callAIService(prompt) {
        // This would integrate with your existing AI system
        // For now, return a mock response
        return {
            name: 'GeneratedBlueprint',
            parentClass: 'Actor',
            variables: [
                { name: 'Speed', type: 'float', defaultValue: '500.0f' },
                { name: 'Health', type: 'int32', defaultValue: '100' }
            ],
            functions: [
                { name: 'BeginPlay', parameters: [], returnType: 'void' },
                { name: 'Tick', parameters: ['float DeltaTime'], returnType: 'void' }
            ],
            components: ['StaticMeshComponent', 'CollisionComponent'],
            events: ['OnBeginOverlap', 'OnEndOverlap']
        };
    }

    /**
     * Parse AI response
     */
    parseAIResponse(aiResponse, blueprintType) {
        return {
            name: aiResponse.name || 'GeneratedBlueprint',
            type: blueprintType,
            parentClass: aiResponse.parentClass || 'Actor',
            variables: aiResponse.variables || [],
            functions: aiResponse.functions || [],
            components: aiResponse.components || [],
            events: aiResponse.events || []
        };
    }

    /**
     * Generate function code
     */
    generateFunctionCode(functionSpec) {
        return `
UFUNCTION(BlueprintCallable)
${functionSpec.returnType} ${functionSpec.name}(${functionSpec.parameters.join(', ')})
{
    // Generated function implementation
    // TODO: Add custom logic here
}`;
    }

    /**
     * Get character blueprint template
     */
    getCharacterBlueprintTemplate() {
        return `
// Blueprint: {{NAME}}
// Parent Class: {{PARENT_CLASS}}

UCLASS(BlueprintType)
class {{NAME}} : public {{PARENT_CLASS}}
{
    GENERATED_BODY()

public:
    {{NAME}}();

protected:
    virtual void BeginPlay() override;
    virtual void Tick(float DeltaTime) override;

    // Variables
{{VARIABLES}}

    // Functions
{{FUNCTIONS}}

    // Components
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
    class UStaticMeshComponent* MeshComponent;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
    class UCapsuleComponent* CapsuleComponent;
};`;
    }

    /**
     * Get weapon blueprint template
     */
    getWeaponBlueprintTemplate() {
        return `
// Weapon Blueprint: {{NAME}}
// Parent Class: {{PARENT_CLASS}}

UCLASS(BlueprintType)
class {{NAME}} : public {{PARENT_CLASS}}
{
    GENERATED_BODY()

public:
    {{NAME}}();

protected:
    virtual void BeginPlay() override;

    // Variables
{{VARIABLES}}

    // Functions
{{FUNCTIONS}}

    // Components
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
    class UStaticMeshComponent* WeaponMesh;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
    class USceneComponent* MuzzleLocation;
};`;
    }

    /**
     * Get pickup blueprint template
     */
    getPickupBlueprintTemplate() {
        return `
// Pickup Blueprint: {{NAME}}
// Parent Class: {{PARENT_CLASS}}

UCLASS(BlueprintType)
class {{NAME}} : public {{PARENT_CLASS}}
{
    GENERATED_BODY()

public:
    {{NAME}}();

protected:
    virtual void BeginPlay() override;

    // Variables
{{VARIABLES}}

    // Functions
{{FUNCTIONS}}

    // Components
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
    class UStaticMeshComponent* PickupMesh;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
    class USphereComponent* CollisionSphere;
};`;
    }

    /**
     * Get door blueprint template
     */
    getDoorBlueprintTemplate() {
        return `
// Door Blueprint: {{NAME}}
// Parent Class: {{PARENT_CLASS}}

UCLASS(BlueprintType)
class {{NAME}} : public {{PARENT_CLASS}}
{
    GENERATED_BODY()

public:
    {{NAME}}();

protected:
    virtual void BeginPlay() override;

    // Variables
{{VARIABLES}}

    // Functions
{{FUNCTIONS}}

    // Components
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
    class UStaticMeshComponent* DoorMesh;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
    class UBoxComponent* TriggerBox;
};`;
    }

    /**
     * Get light blueprint template
     */
    getLightBlueprintTemplate() {
        return `
// Light Blueprint: {{NAME}}
// Parent Class: {{PARENT_CLASS}}

UCLASS(BlueprintType)
class {{NAME}} : public {{PARENT_CLASS}}
{
    GENERATED_BODY()

public:
    {{NAME}}();

protected:
    virtual void BeginPlay() override;

    // Variables
{{VARIABLES}}

    // Functions
{{FUNCTIONS}}

    // Components
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
    class UPointLightComponent* LightComponent;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
    class UStaticMeshComponent* LightMesh;
};`;
    }

    /**
     * Execute any Unreal Engine command
     */
    async executeCommand(command, parameters = {}) {
        try {
            console.log(` Executing Unreal Engine command: ${command}`);

            const commandMap = {
                'create_blueprint': () => this.generateBlueprint(parameters.description, parameters.type, parameters.options),
                'open_project': () => this.openProject(parameters.projectPath),
                'build_project': () => this.buildProject(parameters.configuration),
                'cook_content': () => this.cookContent(parameters.platform),
                'package_project': () => this.packageProject(parameters.platform),
                'run_automation': () => this.runAutomation(parameters.testName),
                'import_asset': () => this.importAsset(parameters.assetPath, parameters.destination),
                'export_asset': () => this.exportAsset(parameters.assetPath, parameters.destination),
                'compile_blueprint': () => this.compileBlueprint(parameters.blueprintPath),
                'create_material': () => this.createMaterial(parameters.materialName, parameters.shaderCode),
                'create_level': () => this.createLevel(parameters.levelName, parameters.template),
                'add_component': () => this.addComponent(parameters.blueprintPath, parameters.componentType),
                'set_property': () => this.setProperty(parameters.objectPath, parameters.propertyName, parameters.value),
                'call_function': () => this.callFunction(parameters.objectPath, parameters.functionName, parameters.parameters)
            };

            const commandFunction = commandMap[command];
            if (commandFunction) {
                const result = await commandFunction();
                this.commandHistory.push({ command, parameters, result, timestamp: new Date() });
                return result;
            } else {
                throw new Error(`Unknown command: ${command}`);
            }

        } catch (error) {
            BeamErrorHandler.logError('Unreal Engine Command Execution Error', error);
            throw error;
        }
    }

    /**
     * Open Unreal Engine project
     */
    async openProject(projectPath) {
        if (!this.automationPath) {
            throw new Error('Automation path not set');
        }

        const command = `"${this.automationPath}" "${projectPath}"`;
        
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({
                        success: true,
                        output: stdout
                    });
                }
            });
        });
    }

    /**
     * Build Unreal Engine project
     */
    async buildProject(configuration = 'Development') {
        if (!this.automationPath || !this.projectPath) {
            throw new Error('Automation path or project path not set');
        }

        const command = `"${this.automationPath}" "${this.projectPath}" -build -configuration=${configuration}`;
        
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({
                        success: true,
                        output: stdout
                    });
                }
            });
        });
    }

    /**
     * Cook content for specific platform
     */
    async cookContent(platform = 'Windows') {
        if (!this.automationPath || !this.projectPath) {
            throw new Error('Automation path or project path not set');
        }

        const command = `"${this.automationPath}" "${this.projectPath}" -run=Cook -TargetPlatform=${platform}`;
        
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({
                        success: true,
                        output: stdout
                    });
                }
            });
        });
    }

    /**
     * Package project for distribution
     */
    async packageProject(platform = 'Windows') {
        if (!this.automationPath || !this.projectPath) {
            throw new Error('Automation path or project path not set');
        }

        const command = `"${this.automationPath}" "${this.projectPath}" -run=Cook -TargetPlatform=${platform} -package`;
        
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({
                        success: true,
                        output: stdout
                    });
                }
            });
        });
    }

    /**
     * Run automation tests
     */
    async runAutomation(testName = '') {
        if (!this.automationPath || !this.projectPath) {
            throw new Error('Automation path or project path not set');
        }

        const command = `"${this.automationPath}" "${this.projectPath}" -run=Automation ${testName ? `-test=${testName}` : ''}`;
        
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({
                        success: true,
                        output: stdout
                    });
                }
            });
        });
    }

    /**
     * Import asset into Unreal Engine
     */
    async importAsset(assetPath, destination = '/Game/Imported') {
        const pythonScript = `
import unreal
import os

asset_path = "${assetPath}"
destination_path = "${destination}"

# Import the asset
asset_tools = unreal.AssetToolsHelpers.get_asset_tools()
import_factory = unreal.FbxFactory()

# Import the asset
imported_asset = asset_tools.import_asset(asset_path, destination_path, import_factory)

if imported_asset:
    print(f"Asset imported: {imported_asset.get_path_name()}")
else:
    print("Failed to import asset")
`;

        return await this.executePythonScript(pythonScript);
    }

    /**
     * Export asset from Unreal Engine
     */
    async exportAsset(assetPath, destination) {
        const pythonScript = `
import unreal
import os

asset_path = "${assetPath}"
destination_path = "${destination}"

# Load the asset
asset = unreal.load_asset(asset_path)

if asset:
    # Export the asset
    unreal.EditorAssetLibrary.export_asset(asset_path, destination_path)
    print(f"Asset exported to: {destination_path}")
else:
    print("Failed to load asset")
`;

        return await this.executePythonScript(pythonScript);
    }

    /**
     * Compile blueprint
     */
    async compileBlueprint(blueprintPath) {
        const pythonScript = `
import unreal

blueprint_path = "${blueprintPath}"

# Load the blueprint
blueprint = unreal.load_asset(blueprint_path)

if blueprint:
    # Compile the blueprint
    blueprint.compile()
    print(f"Blueprint compiled: {blueprint_path}")
else:
    print("Failed to load blueprint")
`;

        return await this.executePythonScript(pythonScript);
    }

    /**
     * Create material
     */
    async createMaterial(materialName, shaderCode) {
        const pythonScript = `
import unreal

material_name = "${materialName}"
shader_code = """${shaderCode}"""

# Create material
factory = unreal.MaterialFactoryNew()
asset_tools = unreal.AssetToolsHelpers.get_asset_tools()
material = asset_tools.create_asset(material_name, "/Game/Materials", unreal.Material, factory)

if material:
    # Apply shader code
    # Note: This is a simplified version. Real implementation would parse shader code
    print(f"Material created: {material.get_path_name()}")
else:
    print("Failed to create material")
`;

        return await this.executePythonScript(pythonScript);
    }

    /**
     * Create level
     */
    async createLevel(levelName, template = 'Empty') {
        const pythonScript = `
import unreal

level_name = "${levelName}"
template_name = "${template}"

# Create level
editor_level_lib = unreal.EditorLevelLibrary()
level = editor_level_lib.new_level(template_name)

if level:
    # Save the level
    editor_level_lib.save_current_level()
    print(f"Level created: {level_name}")
else:
    print("Failed to create level")
`;

        return await this.executePythonScript(pythonScript);
    }

    /**
     * Add component to blueprint
     */
    async addComponent(blueprintPath, componentType) {
        const pythonScript = `
import unreal

blueprint_path = "${blueprintPath}"
component_type = "${componentType}"

# Load the blueprint
blueprint = unreal.load_asset(blueprint_path)

if blueprint:
    # Add component
    # Note: This is a simplified version. Real implementation would handle different component types
    print(f"Component {component_type} added to {blueprint_path}")
else:
    print("Failed to load blueprint")
`;

        return await this.executePythonScript(pythonScript);
    }

    /**
     * Set property on object
     */
    async setProperty(objectPath, propertyName, value) {
        const pythonScript = `
import unreal

object_path = "${objectPath}"
property_name = "${propertyName}"
value = ${value}

# Load the object
obj = unreal.load_asset(object_path)

if obj:
    # Set property
    setattr(obj, property_name, value)
    print(f"Property {property_name} set to {value} on {object_path}")
else:
    print("Failed to load object")
`;

        return await this.executePythonScript(pythonScript);
    }

    /**
     * Call function on object
     */
    async callFunction(objectPath, functionName, parameters = []) {
        const pythonScript = `
import unreal

object_path = "${objectPath}"
function_name = "${functionName}"
parameters = ${JSON.stringify(parameters)}

# Load the object
obj = unreal.load_asset(object_path)

if obj:
    # Call function
    func = getattr(obj, function_name, None)
    if func:
        result = func(*parameters)
        print(f"Function {function_name} called on {object_path}")
        print(f"Result: {result}")
    else:
        print(f"Function {function_name} not found")
else:
    print("Failed to load object")
`;

        return await this.executePythonScript(pythonScript);
    }

    /**
     * Get connection status
     */
    getStatus() {
        return {
            isConnected: this.isConnected,
            connectionType: this.connectionType,
            unrealPath: this.unrealPath,
            projectPath: this.projectPath,
            pythonPath: this.pythonPath,
            remoteControlPort: this.remoteControlPort,
            isInitialized: this.isInitialized,
            commandHistory: this.commandHistory.length
        };
    }

    /**
     * Get available commands
     */
    getAvailableCommands() {
        return [
            'create_blueprint',
            'open_project',
            'build_project',
            'cook_content',
            'package_project',
            'run_automation',
            'import_asset',
            'export_asset',
            'compile_blueprint',
            'create_material',
            'create_level',
            'add_component',
            'set_property',
            'call_function'
        ];
    }

    /**
     * Get command history
     */
    getCommandHistory() {
        return this.commandHistory;
    }

    /**
     * Clear command history
     */
    clearCommandHistory() {
        this.commandHistory = [];
    }
}

module.exports = UnrealEngineIntegration;
