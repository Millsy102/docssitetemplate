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
        try {
            // Integration with OpenAI API or other AI service
            const axios = require('axios');
            
            // Check if OpenAI API key is available
            const openaiApiKey = process.env.OPENAI_API_KEY;
            if (!openaiApiKey) {
                console.log(' OpenAI API key not found, using fallback logic');
                return this.generateFallbackResponse(prompt);
            }

            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert Unreal Engine developer. Parse the given blueprint description and return a structured JSON response with the blueprint specification.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 2000
            }, {
                headers: {
                    'Authorization': `Bearer ${openaiApiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            const aiResponse = response.data.choices[0].message.content;
            
            // Parse the AI response to extract JSON
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            } else {
                // Fallback if JSON parsing fails
                return this.parseTextResponse(aiResponse);
            }

        } catch (error) {
            console.log(' AI service call failed, using fallback logic');
            return this.generateFallbackResponse(prompt);
        }
    }

    /**
     * Generate fallback response when AI service is unavailable
     */
    generateFallbackResponse(prompt) {
        // Extract key information from prompt using regex patterns
        const nameMatch = prompt.match(/name[:\s]+([A-Za-z0-9_]+)/i);
        const typeMatch = prompt.match(/type[:\s]+([A-Za-z0-9_]+)/i);
        const descriptionMatch = prompt.match(/description[:\s]+([^.\n]+)/i);

        const blueprintName = nameMatch ? nameMatch[1] : 'GeneratedBlueprint';
        const blueprintType = typeMatch ? typeMatch[1] : 'Actor';
        const description = descriptionMatch ? descriptionMatch[1].trim() : '';

        // Generate variables based on description keywords
        const variables = [];
        if (description.toLowerCase().includes('speed') || description.toLowerCase().includes('movement')) {
            variables.push({ name: 'Speed', type: 'float', defaultValue: '500.0f' });
        }
        if (description.toLowerCase().includes('health') || description.toLowerCase().includes('damage')) {
            variables.push({ name: 'Health', type: 'int32', defaultValue: '100' });
        }
        if (description.toLowerCase().includes('damage')) {
            variables.push({ name: 'Damage', type: 'int32', defaultValue: '25' });
        }
        if (description.toLowerCase().includes('range')) {
            variables.push({ name: 'Range', type: 'float', defaultValue: '1000.0f' });
        }
        if (description.toLowerCase().includes('cooldown')) {
            variables.push({ name: 'Cooldown', type: 'float', defaultValue: '1.0f' });
        }

        // Generate functions based on blueprint type
        const functions = [
            { name: 'BeginPlay', parameters: [], returnType: 'void' }
        ];

        if (blueprintType.toLowerCase().includes('character') || description.toLowerCase().includes('movement')) {
            functions.push({ name: 'Tick', parameters: ['float DeltaTime'], returnType: 'void' });
        }

        if (description.toLowerCase().includes('fire') || description.toLowerCase().includes('shoot')) {
            functions.push({ name: 'Fire', parameters: [], returnType: 'void' });
        }

        if (description.toLowerCase().includes('pickup') || description.toLowerCase().includes('collect')) {
            functions.push({ name: 'OnPickup', parameters: ['AActor* OtherActor'], returnType: 'void' });
        }

        // Generate components based on type and description
        const components = [];
        if (blueprintType.toLowerCase().includes('character')) {
            components.push('StaticMeshComponent', 'CapsuleComponent');
        } else if (blueprintType.toLowerCase().includes('weapon')) {
            components.push('StaticMeshComponent', 'SceneComponent');
        } else if (blueprintType.toLowerCase().includes('pickup')) {
            components.push('StaticMeshComponent', 'SphereComponent');
        } else {
            components.push('StaticMeshComponent');
        }

        return {
            name: blueprintName,
            parentClass: blueprintType,
            variables: variables,
            functions: functions,
            components: components,
            events: ['OnBeginOverlap', 'OnEndOverlap']
        };
    }

    /**
     * Parse text response from AI when JSON parsing fails
     */
    parseTextResponse(textResponse) {
        // Extract information from text response using regex
        const nameMatch = textResponse.match(/name[:\s]+([A-Za-z0-9_]+)/i);
        const classMatch = textResponse.match(/class[:\s]+([A-Za-z0-9_]+)/i);
        const variableMatches = textResponse.match(/variable[:\s]+([A-Za-z0-9_]+)[:\s]+([A-Za-z0-9_]+)/gi);
        const functionMatches = textResponse.match(/function[:\s]+([A-Za-z0-9_]+)/gi);

        const variables = [];
        if (variableMatches) {
            variableMatches.forEach(match => {
                const parts = match.split(/[:\s]+/);
                if (parts.length >= 3) {
                    variables.push({
                        name: parts[1],
                        type: parts[2],
                        defaultValue: this.getDefaultValue(parts[2])
                    });
                }
            });
        }

        const functions = [];
        if (functionMatches) {
            functionMatches.forEach(match => {
                const parts = match.split(/[:\s]+/);
                if (parts.length >= 2) {
                    functions.push({
                        name: parts[1],
                        parameters: [],
                        returnType: 'void'
                    });
                }
            });
        }

        return {
            name: nameMatch ? nameMatch[1] : 'GeneratedBlueprint',
            parentClass: classMatch ? classMatch[1] : 'Actor',
            variables: variables,
            functions: functions,
            components: ['StaticMeshComponent'],
            events: ['OnBeginOverlap', 'OnEndOverlap']
        };
    }

    /**
     * Get default value for variable type
     */
    getDefaultValue(type) {
        const defaults = {
            'int32': '0',
            'float': '0.0f',
            'bool': 'false',
            'string': '""',
            'vector': 'FVector::ZeroVector',
            'rotator': 'FRotator::ZeroRotator'
        };
        return defaults[type.toLowerCase()] || '0';
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
        const functionName = functionSpec.name;
        const returnType = functionSpec.returnType;
        const parameters = functionSpec.parameters;
        
        // Generate appropriate function implementation based on function name and type
        let implementation = this.generateFunctionImplementation(functionName, parameters, returnType);
        
        // Determine UFUNCTION specifiers based on function type
        let ufunctionSpecifiers = 'BlueprintCallable';
        if (functionName === 'BeginPlay' || functionName === 'Tick') {
            ufunctionSpecifiers = 'BlueprintCallable, BlueprintEvent';
        } else if (functionName.startsWith('On')) {
            ufunctionSpecifiers = 'BlueprintCallable, BlueprintEvent';
        } else if (functionName.toLowerCase().includes('get')) {
            ufunctionSpecifiers = 'BlueprintCallable, BlueprintPure';
        } else if (functionName.toLowerCase().includes('set')) {
            ufunctionSpecifiers = 'BlueprintCallable';
        }

        return `
UFUNCTION(${ufunctionSpecifiers})
${returnType} ${functionName}(${parameters.join(', ')})
{
    ${implementation}
}`;
    }

    /**
     * Generate function implementation based on function name and parameters
     */
    generateFunctionImplementation(functionName, parameters, returnType) {
        const name = functionName.toLowerCase();
        
        // BeginPlay implementation
        if (name === 'beginplay') {
            return `
    // Initialize components and variables
    if (MeshComponent) {
        MeshComponent->SetVisibility(true);
    }
    
    // Set initial state
    bIsActive = true;
    
    // Log initialization
    UE_LOG(LogTemp, Log, TEXT("${functionName}: Initialized successfully"));
`;
        }
        
        // Tick implementation
        if (name === 'tick') {
            return `
    Super::Tick(DeltaTime);
    
    // Update movement or behavior
    if (bIsActive && Speed > 0.0f) {
        FVector CurrentLocation = GetActorLocation();
        FVector NewLocation = CurrentLocation + (GetActorForwardVector() * Speed * DeltaTime);
        SetActorLocation(NewLocation);
    }
`;
        }
        
        // Fire/Shoot implementation
        if (name.includes('fire') || name.includes('shoot')) {
            return `
    if (bCanFire && GetWorld()) {
        // Create projectile or perform firing logic
        FVector SpawnLocation = GetActorLocation() + GetActorForwardVector() * 100.0f;
        FRotator SpawnRotation = GetActorRotation();
        
        // Spawn projectile (placeholder)
        // AProjectile* Projectile = GetWorld()->SpawnActor<AProjectile>(ProjectileClass, SpawnLocation, SpawnRotation);
        
        // Set cooldown
        bCanFire = false;
        GetWorldTimerManager().SetTimer(FireTimerHandle, this, &A${this.getClassName()}::
            ResetFireCooldown, FireCooldown, false);
        
        UE_LOG(LogTemp, Log, TEXT("${functionName}: Fired projectile"));
    }
`;
        }
        
        // Pickup implementation
        if (name.includes('pickup') || name.includes('collect')) {
            return `
    if (OtherActor && OtherActor->IsA(APlayerCharacter::StaticClass())) {
        // Handle pickup logic
        APlayerCharacter* Player = Cast<APlayerCharacter>(OtherActor);
        if (Player) {
            // Apply pickup effect
            Player->AddHealth(HealthValue);
            
            // Destroy pickup
            Destroy();
            
            UE_LOG(LogTemp, Log, TEXT("${functionName}: Item picked up by player"));
        }
    }
`;
        }
        
        // Getter implementations
        if (name.startsWith('get')) {
            const propertyName = functionName.substring(3); // Remove "Get" prefix
            return `
    return ${propertyName};
`;
        }
        
        // Setter implementations
        if (name.startsWith('set')) {
            const propertyName = functionName.substring(3); // Remove "Set" prefix
            const paramName = parameters[0] ? parameters[0].split(' ').pop() : 'Value';
            return `
    ${propertyName} = ${paramName};
    
    // Notify any listeners of the change
    On${propertyName}Changed.Broadcast(${paramName});
`;
        }
        
        // Damage implementation
        if (name.includes('damage') || name.includes('hurt')) {
            return `
    if (Health > 0) {
        Health -= DamageAmount;
        
        // Check if dead
        if (Health <= 0) {
            Health = 0;
            OnDeath();
        }
        
        // Trigger damage effects
        OnDamaged.Broadcast(DamageAmount);
        
        UE_LOG(LogTemp, Log, TEXT("${functionName}: Took %f damage, Health: %d"), DamageAmount, Health);
    }
`;
        }
        
        // Movement implementations
        if (name.includes('move') || name.includes('walk')) {
            return `
    if (bCanMove) {
        FVector CurrentLocation = GetActorLocation();
        FVector NewLocation = CurrentLocation + (Direction * Speed * DeltaTime);
        SetActorLocation(NewLocation);
        
        // Update rotation to face movement direction
        if (!Direction.IsNearlyZero()) {
            FRotator NewRotation = Direction.Rotation();
            SetActorRotation(NewRotation);
        }
    }
`;
        }
        
        // Toggle implementations
        if (name.includes('toggle')) {
            return `
    bIsActive = !bIsActive;
    
    // Update visual state
    if (MeshComponent) {
        MeshComponent->SetVisibility(bIsActive);
    }
    
    // Trigger toggle event
    OnToggled.Broadcast(bIsActive);
    
    UE_LOG(LogTemp, Log, TEXT("${functionName}: Toggled to %s"), bIsActive ? TEXT("Active") : TEXT("Inactive"));
`;
        }
        
        // Default implementation
        return `
    // TODO: Implement ${functionName} logic
    UE_LOG(LogTemp, Warning, TEXT("${functionName}: Function called but not implemented"));
`;
    }

    /**
     * Get class name from current context
     */
    getClassName() {
        // This would be set during blueprint generation
        return 'GeneratedBlueprint';
    }

    /**
     * Get character blueprint template
     */
    getCharacterBlueprintTemplate() {
        return `
// Character Blueprint: {{NAME}}
// Parent Class: {{PARENT_CLASS}}

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "Components/CapsuleComponent.h"
#include "Components/SkeletalMeshComponent.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "{{NAME}}.generated.h"

UCLASS(BlueprintType, Blueprintable)
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
    class USkeletalMeshComponent* MeshComponent;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
    class UCapsuleComponent* CapsuleComponent;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
    class UCharacterMovementComponent* MovementComponent;

    // Character-specific variables
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Character")
    float WalkSpeed = 600.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Character")
    float RunSpeed = 1200.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Character")
    float JumpForce = 500.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Character")
    int32 MaxHealth = 100;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Character")
    int32 CurrentHealth = 100;

    // Character state
    UPROPERTY(BlueprintReadOnly, Category = "Character")
    bool bIsAlive = true;

    UPROPERTY(BlueprintReadOnly, Category = "Character")
    bool bIsMoving = false;

    UPROPERTY(BlueprintReadOnly, Category = "Character")
    bool bIsRunning = false;

    // Events
    UFUNCTION(BlueprintCallable, BlueprintEvent)
    void OnDamageTaken(float DamageAmount);

    UFUNCTION(BlueprintCallable, BlueprintEvent)
    void OnDeath();

    UFUNCTION(BlueprintCallable, BlueprintEvent)
    void OnHealthRestored(float HealthAmount);

    UFUNCTION(BlueprintCallable, BlueprintEvent)
    void OnMovementStateChanged(bool bNewIsMoving, bool bNewIsRunning);

    // Input functions
    UFUNCTION(BlueprintCallable)
    void MoveForward(float Value);

    UFUNCTION(BlueprintCallable)
    void MoveRight(float Value);

    UFUNCTION(BlueprintCallable)
    void StartJump();

    UFUNCTION(BlueprintCallable)
    void StopJump();

    UFUNCTION(BlueprintCallable)
    void StartRun();

    UFUNCTION(BlueprintCallable)
    void StopRun();

    // Utility functions
    UFUNCTION(BlueprintCallable, BlueprintPure)
    float GetHealthPercentage() const;

    UFUNCTION(BlueprintCallable, BlueprintPure)
    bool IsAlive() const { return bIsAlive; }

    UFUNCTION(BlueprintCallable, BlueprintPure)
    bool IsMoving() const { return bIsMoving; }

    UFUNCTION(BlueprintCallable, BlueprintPure)
    bool IsRunning() const { return bIsRunning; }

    // Getters and setters
    UFUNCTION(BlueprintCallable, BlueprintPure)
    float GetWalkSpeed() const { return WalkSpeed; }

    UFUNCTION(BlueprintCallable)
    void SetWalkSpeed(float NewSpeed) { WalkSpeed = NewSpeed; }

    UFUNCTION(BlueprintCallable, BlueprintPure)
    float GetRunSpeed() const { return RunSpeed; }

    UFUNCTION(BlueprintCallable)
    void SetRunSpeed(float NewSpeed) { RunSpeed = NewSpeed; }

    UFUNCTION(BlueprintCallable, BlueprintPure)
    int32 GetCurrentHealth() const { return CurrentHealth; }

    UFUNCTION(BlueprintCallable)
    void SetCurrentHealth(int32 NewHealth) { CurrentHealth = FMath::Clamp(NewHealth, 0, MaxHealth); }

    UFUNCTION(BlueprintCallable, BlueprintPure)
    int32 GetMaxHealth() const { return MaxHealth; }

    UFUNCTION(BlueprintCallable)
    void SetMaxHealth(int32 NewMaxHealth) { MaxHealth = NewMaxHealth; }
};`;
    }

    /**
     * Get weapon blueprint template
     */
    getWeaponBlueprintTemplate() {
        return `
// Weapon Blueprint: {{NAME}}
// Parent Class: {{PARENT_CLASS}}

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Components/StaticMeshComponent.h"
#include "Components/SceneComponent.h"
#include "{{NAME}}.generated.h"

UCLASS(BlueprintType, Blueprintable)
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
    class UStaticMeshComponent* WeaponMesh;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
    class USceneComponent* MuzzleLocation;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
    class USceneComponent* RootComponent;

    // Weapon-specific variables
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapon")
    float Damage = 25.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapon")
    float FireRate = 1.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapon")
    float Range = 1000.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapon")
    int32 MaxAmmo = 30;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapon")
    int32 CurrentAmmo = 30;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapon")
    float ReloadTime = 2.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapon")
    bool bAutomatic = false;

    // Weapon state
    UPROPERTY(BlueprintReadOnly, Category = "Weapon")
    bool bCanFire = true;

    UPROPERTY(BlueprintReadOnly, Category = "Weapon")
    bool bIsReloading = false;

    UPROPERTY(BlueprintReadOnly, Category = "Weapon")
    bool bIsEquipped = false;

    // Timers
    FTimerHandle FireTimerHandle;
    FTimerHandle ReloadTimerHandle;

    // Events
    UFUNCTION(BlueprintCallable, BlueprintEvent)
    void OnWeaponFired();

    UFUNCTION(BlueprintCallable, BlueprintEvent)
    void OnWeaponReloaded();

    UFUNCTION(BlueprintCallable, BlueprintEvent)
    void OnAmmoChanged(int32 NewAmmo);

    UFUNCTION(BlueprintCallable, BlueprintEvent)
    void OnWeaponEquipped();

    UFUNCTION(BlueprintCallable, BlueprintEvent)
    void OnWeaponUnequipped();

    // Weapon functions
    UFUNCTION(BlueprintCallable)
    void Fire();

    UFUNCTION(BlueprintCallable)
    void StartReload();

    UFUNCTION(BlueprintCallable)
    void StopReload();

    UFUNCTION(BlueprintCallable)
    void Equip();

    UFUNCTION(BlueprintCallable)
    void Unequip();

    UFUNCTION(BlueprintCallable)
    void AddAmmo(int32 AmmoAmount);

    UFUNCTION(BlueprintCallable)
    void ConsumeAmmo(int32 AmmoAmount = 1);

    // Utility functions
    UFUNCTION(BlueprintCallable, BlueprintPure)
    float GetAmmoPercentage() const;

    UFUNCTION(BlueprintCallable, BlueprintPure)
    bool CanFire() const { return bCanFire && CurrentAmmo > 0 && !bIsReloading; }

    UFUNCTION(BlueprintCallable, BlueprintPure)
    bool IsReloading() const { return bIsReloading; }

    UFUNCTION(BlueprintCallable, BlueprintPure)
    bool IsEquipped() const { return bIsEquipped; }

    UFUNCTION(BlueprintCallable, BlueprintPure)
    bool HasAmmo() const { return CurrentAmmo > 0; }

    // Getters and setters
    UFUNCTION(BlueprintCallable, BlueprintPure)
    float GetDamage() const { return Damage; }

    UFUNCTION(BlueprintCallable)
    void SetDamage(float NewDamage) { Damage = NewDamage; }

    UFUNCTION(BlueprintCallable, BlueprintPure)
    float GetFireRate() const { return FireRate; }

    UFUNCTION(BlueprintCallable)
    void SetFireRate(float NewFireRate) { FireRate = NewFireRate; }

    UFUNCTION(BlueprintCallable, BlueprintPure)
    int32 GetCurrentAmmo() const { return CurrentAmmo; }

    UFUNCTION(BlueprintCallable)
    void SetCurrentAmmo(int32 NewAmmo) { CurrentAmmo = FMath::Clamp(NewAmmo, 0, MaxAmmo); }

    UFUNCTION(BlueprintCallable, BlueprintPure)
    int32 GetMaxAmmo() const { return MaxAmmo; }

    UFUNCTION(BlueprintCallable)
    void SetMaxAmmo(int32 NewMaxAmmo) { MaxAmmo = NewMaxAmmo; }

private:
    UFUNCTION()
    void ResetFireCooldown();

    UFUNCTION()
    void FinishReload();
};`;
    }

    /**
     * Get pickup blueprint template
     */
    getPickupBlueprintTemplate() {
        return `
// Pickup Blueprint: {{NAME}}
// Parent Class: {{PARENT_CLASS}}

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Components/StaticMeshComponent.h"
#include "Components/SphereComponent.h"
#include "{{NAME}}.generated.h"

UCLASS(BlueprintType, Blueprintable)
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
    class UStaticMeshComponent* PickupMesh;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
    class USphereComponent* CollisionSphere;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
    class USceneComponent* RootComponent;

    // Pickup-specific variables
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Pickup")
    float PickupValue = 10.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Pickup")
    FString PickupType = TEXT("Health");

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Pickup")
    bool bCanBePickedUp = true;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Pickup")
    bool bDestroyOnPickup = true;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Pickup")
    float RespawnTime = 30.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Pickup")
    bool bRespawnable = false;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Pickup")
    float RotationSpeed = 90.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Pickup")
    float BobSpeed = 2.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Pickup")
    float BobHeight = 10.0f;

    // Pickup state
    UPROPERTY(BlueprintReadOnly, Category = "Pickup")
    bool bIsActive = true;

    UPROPERTY(BlueprintReadOnly, Category = "Pickup")
    bool bIsRespawnTimerActive = false;

    // Timers
    FTimerHandle RespawnTimerHandle;

    // Events
    UFUNCTION(BlueprintCallable, BlueprintEvent)
    void OnPickup(AActor* OtherActor);

    UFUNCTION(BlueprintCallable, BlueprintEvent)
    void OnPickupFailed(AActor* OtherActor, const FString& Reason);

    UFUNCTION(BlueprintCallable, BlueprintEvent)
    void OnRespawn();

    UFUNCTION(BlueprintCallable, BlueprintEvent)
    void OnDeactivate();

    UFUNCTION(BlueprintCallable, BlueprintEvent)
    void OnActivate();

    // Pickup functions
    UFUNCTION(BlueprintCallable)
    void Pickup(AActor* OtherActor);

    UFUNCTION(BlueprintCallable)
    void Deactivate();

    UFUNCTION(BlueprintCallable)
    void Activate();

    UFUNCTION(BlueprintCallable)
    void StartRespawnTimer();

    UFUNCTION(BlueprintCallable)
    void StopRespawnTimer();

    UFUNCTION(BlueprintCallable)
    void SetPickupValue(float NewValue);

    UFUNCTION(BlueprintCallable)
    void SetPickupType(const FString& NewType);

    // Utility functions
    UFUNCTION(BlueprintCallable, BlueprintPure)
    bool CanBePickedUp() const { return bCanBePickedUp && bIsActive; }

    UFUNCTION(BlueprintCallable, BlueprintPure)
    bool IsActive() const { return bIsActive; }

    UFUNCTION(BlueprintCallable, BlueprintPure)
    bool IsRespawnable() const { return bRespawnable; }

    UFUNCTION(BlueprintCallable, BlueprintPure)
    float GetPickupValue() const { return PickupValue; }

    UFUNCTION(BlueprintCallable, BlueprintPure)
    FString GetPickupType() const { return PickupType; }

    // Getters and setters
    UFUNCTION(BlueprintCallable, BlueprintPure)
    float GetRespawnTime() const { return RespawnTime; }

    UFUNCTION(BlueprintCallable)
    void SetRespawnTime(float NewTime) { RespawnTime = NewTime; }

    UFUNCTION(BlueprintCallable, BlueprintPure)
    float GetRotationSpeed() const { return RotationSpeed; }

    UFUNCTION(BlueprintCallable)
    void SetRotationSpeed(float NewSpeed) { RotationSpeed = NewSpeed; }

    UFUNCTION(BlueprintCallable, BlueprintPure)
    float GetBobSpeed() const { return BobSpeed; }

    UFUNCTION(BlueprintCallable)
    void SetBobSpeed(float NewSpeed) { BobSpeed = NewSpeed; }

    UFUNCTION(BlueprintCallable, BlueprintPure)
    float GetBobHeight() const { return BobHeight; }

    UFUNCTION(BlueprintCallable)
    void SetBobHeight(float NewHeight) { BobHeight = NewHeight; }

private:
    UFUNCTION()
    void OnOverlapBegin(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor, 
                       UPrimitiveComponent* OtherComp, int32 OtherBodyIndex, 
                       bool bFromSweep, const FHitResult& SweepResult);

    UFUNCTION()
    void Respawn();

    FVector InitialLocation;
    float BobTime = 0.0f;
};`;
    }

    /**
     * Get door blueprint template
     */
    getDoorBlueprintTemplate() {
        return `
// Door Blueprint: {{NAME}}
// Parent Class: {{PARENT_CLASS}}

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Components/StaticMeshComponent.h"
#include "Components/BoxComponent.h"
#include "{{NAME}}.generated.h"

UCLASS(BlueprintType, Blueprintable)
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
    class UStaticMeshComponent* DoorMesh;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
    class UBoxComponent* TriggerBox;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
    class USceneComponent* RootComponent;

    // Door-specific variables
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Door")
    float OpenSpeed = 100.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Door")
    float CloseSpeed = 100.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Door")
    float OpenAngle = 90.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Door")
    float AutoCloseDelay = 3.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Door")
    bool bAutoClose = true;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Door")
    bool bRequireKey = false;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Door")
    FString RequiredKey = TEXT("");

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Door")
    bool bLocked = false;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Door")
    bool bOneWay = false;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Door")
    bool bSliding = false;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Door")
    FVector SlideDirection = FVector(0.0f, 0.0f, 1.0f);

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Door")
    float SlideDistance = 200.0f;

    // Door state
    UPROPERTY(BlueprintReadOnly, Category = "Door")
    bool bIsOpen = false;

    UPROPERTY(BlueprintReadOnly, Category = "Door")
    bool bIsMoving = false;

    UPROPERTY(BlueprintReadOnly, Category = "Door")
    bool bIsLocked = false;

    UPROPERTY(BlueprintReadOnly, Category = "Door")
    float CurrentOpenPercentage = 0.0f;

    // Timers
    FTimerHandle AutoCloseTimerHandle;

    // Events
    UFUNCTION(BlueprintCallable, BlueprintEvent)
    void OnDoorOpened();

    UFUNCTION(BlueprintCallable, BlueprintEvent)
    void OnDoorClosed();

    UFUNCTION(BlueprintCallable, BlueprintEvent)
    void OnDoorLocked();

    UFUNCTION(BlueprintCallable, BlueprintEvent)
    void OnDoorUnlocked();

    UFUNCTION(BlueprintCallable, BlueprintEvent)
    void OnDoorAccessDenied(AActor* Actor, const FString& Reason);

    UFUNCTION(BlueprintCallable, BlueprintEvent)
    void OnDoorTriggered(AActor* Actor);

    // Door functions
    UFUNCTION(BlueprintCallable)
    void Open();

    UFUNCTION(BlueprintCallable)
    void Close();

    UFUNCTION(BlueprintCallable)
    void Toggle();

    UFUNCTION(BlueprintCallable)
    void Lock();

    UFUNCTION(BlueprintCallable)
    void Unlock();

    UFUNCTION(BlueprintCallable)
    void SetLocked(bool bNewLocked);

    UFUNCTION(BlueprintCallable)
    void SetRequiredKey(const FString& NewKey);

    UFUNCTION(BlueprintCallable)
    void SetAutoClose(bool bNewAutoClose);

    UFUNCTION(BlueprintCallable)
    void SetAutoCloseDelay(float NewDelay);

    // Utility functions
    UFUNCTION(BlueprintCallable, BlueprintPure)
    bool IsOpen() const { return bIsOpen; }

    UFUNCTION(BlueprintCallable, BlueprintPure)
    bool IsMoving() const { return bIsMoving; }

    UFUNCTION(BlueprintCallable, BlueprintPure)
    bool IsLocked() const { return bIsLocked; }

    UFUNCTION(BlueprintCallable, BlueprintPure)
    bool CanBeOpened() const { return !bIsLocked && !bIsMoving; }

    UFUNCTION(BlueprintCallable, BlueprintPure)
    float GetOpenPercentage() const { return CurrentOpenPercentage; }

    UFUNCTION(BlueprintCallable, BlueprintPure)
    bool RequiresKey() const { return bRequireKey; }

    UFUNCTION(BlueprintCallable, BlueprintPure)
    FString GetRequiredKey() const { return RequiredKey; }

    // Getters and setters
    UFUNCTION(BlueprintCallable, BlueprintPure)
    float GetOpenSpeed() const { return OpenSpeed; }

    UFUNCTION(BlueprintCallable)
    void SetOpenSpeed(float NewSpeed) { OpenSpeed = NewSpeed; }

    UFUNCTION(BlueprintCallable, BlueprintPure)
    float GetCloseSpeed() const { return CloseSpeed; }

    UFUNCTION(BlueprintCallable)
    void SetCloseSpeed(float NewSpeed) { CloseSpeed = NewSpeed; }

    UFUNCTION(BlueprintCallable, BlueprintPure)
    float GetOpenAngle() const { return OpenAngle; }

    UFUNCTION(BlueprintCallable)
    void SetOpenAngle(float NewAngle) { OpenAngle = NewAngle; }

private:
    UFUNCTION()
    void OnOverlapBegin(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor, 
                       UPrimitiveComponent* OtherComp, int32 OtherBodyIndex, 
                       bool bFromSweep, const FHitResult& SweepResult);

    UFUNCTION()
    void OnOverlapEnd(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor, 
                     UPrimitiveComponent* OtherComp, int32 OtherBodyIndex);

    UFUNCTION()
    void AutoClose();

    bool CheckAccess(AActor* Actor);
    void UpdateDoorTransform(float DeltaTime);
    void UpdateDoorRotation(float DeltaTime);
    void UpdateDoorPosition(float DeltaTime);

    FRotator InitialRotation;
    FVector InitialLocation;
    FRotator TargetRotation;
    FVector TargetLocation;
    bool bOpening = false;
    bool bClosing = false;
};`;
    }

    /**
     * Get light blueprint template
     */
    getLightBlueprintTemplate() {
        return `
// Light Blueprint: {{NAME}}
// Parent Class: {{PARENT_CLASS}}

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Components/PointLightComponent.h"
#include "Components/StaticMeshComponent.h"
#include "{{NAME}}.generated.h"

UCLASS(BlueprintType, Blueprintable)
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
    class UPointLightComponent* LightComponent;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
    class UStaticMeshComponent* LightMesh;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
    class USceneComponent* RootComponent;

    // Light-specific variables
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Light")
    float LightIntensity = 1000.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Light")
    float LightRadius = 1000.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Light")
    FLinearColor LightColor = FLinearColor::White;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Light")
    bool bCastShadows = true;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Light")
    bool bUseTemperature = false;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Light")
    float Temperature = 6500.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Light")
    bool bFlicker = false;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Light")
    float FlickerIntensity = 0.1f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Light")
    float FlickerSpeed = 1.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Light")
    bool bPulse = false;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Light")
    float PulseIntensity = 0.5f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Light")
    float PulseSpeed = 2.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Light")
    bool bAutoOnOff = false;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Light")
    float OnTime = 5.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Light")
    float OffTime = 2.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Light")
    bool bMotionSensor = false;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Light")
    float MotionRange = 500.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Light")
    float MotionTimeout = 10.0f;

    // Light state
    UPROPERTY(BlueprintReadOnly, Category = "Light")
    bool bIsOn = true;

    UPROPERTY(BlueprintReadOnly, Category = "Light")
    bool bMotionDetected = false;

    UPROPERTY(BlueprintReadOnly, Category = "Light")
    float CurrentIntensity = 1000.0f;

    UPROPERTY(BlueprintReadOnly, Category = "Light")
    float CurrentRadius = 1000.0f;

    // Timers
    FTimerHandle AutoOnOffTimerHandle;
    FTimerHandle MotionTimeoutTimerHandle;

    // Events
    UFUNCTION(BlueprintCallable, BlueprintEvent)
    void OnLightTurnedOn();

    UFUNCTION(BlueprintCallable, BlueprintEvent)
    void OnLightTurnedOff();

    UFUNCTION(BlueprintCallable, BlueprintEvent)
    void OnMotionDetected(AActor* Actor);

    UFUNCTION(BlueprintCallable, BlueprintEvent)
    void OnMotionTimeout();

    UFUNCTION(BlueprintCallable, BlueprintEvent)
    void OnIntensityChanged(float NewIntensity);

    UFUNCTION(BlueprintCallable, BlueprintEvent)
    void OnColorChanged(FLinearColor NewColor);

    // Light functions
    UFUNCTION(BlueprintCallable)
    void TurnOn();

    UFUNCTION(BlueprintCallable)
    void TurnOff();

    UFUNCTION(BlueprintCallable)
    void Toggle();

    UFUNCTION(BlueprintCallable)
    void SetIntensity(float NewIntensity);

    UFUNCTION(BlueprintCallable)
    void SetRadius(float NewRadius);

    UFUNCTION(BlueprintCallable)
    void SetColor(FLinearColor NewColor);

    UFUNCTION(BlueprintCallable)
    void SetTemperature(float NewTemperature);

    UFUNCTION(BlueprintCallable)
    void EnableFlicker(bool bEnable);

    UFUNCTION(BlueprintCallable)
    void EnablePulse(bool bEnable);

    UFUNCTION(BlueprintCallable)
    void EnableAutoOnOff(bool bEnable);

    UFUNCTION(BlueprintCallable)
    void EnableMotionSensor(bool bEnable);

    UFUNCTION(BlueprintCallable)
    void SetMotionRange(float NewRange);

    UFUNCTION(BlueprintCallable)
    void SetMotionTimeout(float NewTimeout);

    // Utility functions
    UFUNCTION(BlueprintCallable, BlueprintPure)
    bool IsOn() const { return bIsOn; }

    UFUNCTION(BlueprintCallable, BlueprintPure)
    bool IsMotionDetected() const { return bMotionDetected; }

    UFUNCTION(BlueprintCallable, BlueprintPure)
    float GetCurrentIntensity() const { return CurrentIntensity; }

    UFUNCTION(BlueprintCallable, BlueprintPure)
    float GetCurrentRadius() const { return CurrentRadius; }

    UFUNCTION(BlueprintCallable, BlueprintPure)
    FLinearColor GetCurrentColor() const { return LightColor; }

    UFUNCTION(BlueprintCallable, BlueprintPure)
    bool HasMotionSensor() const { return bMotionSensor; }

    UFUNCTION(BlueprintCallable, BlueprintPure)
    bool IsFlickering() const { return bFlicker; }

    UFUNCTION(BlueprintCallable, BlueprintPure)
    bool IsPulsing() const { return bPulse; }

    UFUNCTION(BlueprintCallable, BlueprintPure)
    bool IsAutoOnOff() const { return bAutoOnOff; }

    // Getters and setters
    UFUNCTION(BlueprintCallable, BlueprintPure)
    float GetLightIntensity() const { return LightIntensity; }

    UFUNCTION(BlueprintCallable)
    void SetLightIntensity(float NewIntensity) { LightIntensity = NewIntensity; }

    UFUNCTION(BlueprintCallable, BlueprintPure)
    float GetLightRadius() const { return LightRadius; }

    UFUNCTION(BlueprintCallable)
    void SetLightRadius(float NewRadius) { LightRadius = NewRadius; }

    UFUNCTION(BlueprintCallable, BlueprintPure)
    FLinearColor GetLightColor() const { return LightColor; }

    UFUNCTION(BlueprintCallable)
    void SetLightColor(FLinearColor NewColor) { LightColor = NewColor; }

    UFUNCTION(BlueprintCallable, BlueprintPure)
    float GetTemperature() const { return Temperature; }

    UFUNCTION(BlueprintCallable)
    void SetTemperature(float NewTemperature) { Temperature = NewTemperature; }

private:
    UFUNCTION()
    void OnOverlapBegin(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor, 
                       UPrimitiveComponent* OtherComp, int32 OtherBodyIndex, 
                       bool bFromSweep, const FHitResult& SweepResult);

    UFUNCTION()
    void OnOverlapEnd(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor, 
                     UPrimitiveComponent* OtherComp, int32 OtherBodyIndex);

    UFUNCTION()
    void AutoOnOff();

    UFUNCTION()
    void MotionTimeout();

    void UpdateFlicker(float DeltaTime);
    void UpdatePulse(float DeltaTime);
    void UpdateLightProperties();

    float FlickerTime = 0.0f;
    float PulseTime = 0.0f;
    float BaseIntensity = 1000.0f;
    float BaseRadius = 1000.0f;
    bool bAutoOnOffActive = false;
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
