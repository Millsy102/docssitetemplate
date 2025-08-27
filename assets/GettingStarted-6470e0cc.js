import{j as r,a as e}from"./main-de056cc1.js";import"./vendor-3c8011bb.js";import"./router-efb9e7eb.js";const t=()=>r("div",{className:"max-w-4xl",children:[e("h1",{children:"Getting Started"}),e("p",{className:"text-xl text-gray-300 mb-8",children:"Learn the basics of using BeamFlow in your Unreal Engine project."}),r("div",{className:"space-y-8",children:[r("div",{className:"bg-gray-800 p-6 rounded-lg border border-gray-700",children:[e("h2",{children:"First Steps"}),e("p",{className:"text-gray-300 mb-4",children:"After installing BeamFlow, follow these steps to get started:"}),r("ol",{className:"text-gray-300 space-y-3",children:[e("li",{children:"1. Open your Unreal Engine project"}),e("li",{children:"2. Navigate to the BeamFlow menu in the toolbar"}),e("li",{children:'3. Click "Initialize BeamFlow" to set up the plugin'}),e("li",{children:"4. Configure your project settings in the BeamFlow panel"})]})]}),r("div",{className:"bg-gray-800 p-6 rounded-lg border border-gray-700",children:[e("h2",{children:"Basic Configuration"}),e("div",{className:"space-y-4 mt-4",children:r("div",{children:[e("h3",{children:"Project Settings"}),e("p",{className:"text-gray-300 mb-2",children:"Configure BeamFlow settings for your project:"}),e("pre",{children:e("code",{children:`// In your project's Build.cs file
PublicDependencyModuleNames.AddRange(new string[] { 
    "BeamFlow" 
});

// Add to your project's .uproject file
"Plugins": [
    {
        "Name": "BeamFlow",
        "Enabled": true
    }
]`})})]})})]}),r("div",{className:"bg-gray-800 p-6 rounded-lg border border-gray-700",children:[e("h2",{children:"Core Features"}),r("div",{className:"grid md:grid-cols-2 gap-6 mt-4",children:[r("div",{children:[e("h3",{children:"AI Integration"}),e("p",{className:"text-gray-300 mb-2",children:"BeamFlow provides advanced AI capabilities:"}),r("ul",{className:"text-gray-300 space-y-1 text-sm",children:[e("li",{children:"• Smart asset management"}),e("li",{children:"• Automated optimization"}),e("li",{children:"• Intelligent debugging"}),e("li",{children:"• Performance analysis"})]})]}),r("div",{children:[e("h3",{children:"Performance Tools"}),e("p",{className:"text-gray-300 mb-2",children:"Monitor and optimize your project:"}),r("ul",{className:"text-gray-300 space-y-1 text-sm",children:[e("li",{children:"• Real-time performance metrics"}),e("li",{children:"• Memory usage tracking"}),e("li",{children:"• Frame rate analysis"}),e("li",{children:"• Bottleneck detection"})]})]})]})]}),r("div",{className:"bg-gray-800 p-6 rounded-lg border border-gray-700",children:[e("h2",{children:"Example Usage"}),r("div",{className:"space-y-4 mt-4",children:[r("div",{children:[e("h3",{children:"Basic Setup in C++"}),e("pre",{children:e("code",{children:`#include "BeamFlow/Public/BeamFlowManager.h"

// In your game module
void AYourGameMode::BeginPlay()
{
    Super::BeginPlay();
    
    // Initialize BeamFlow
    UBeamFlowManager::Get().Initialize();
    
    // Configure settings
    UBeamFlowManager::Get().SetPerformanceMode(EBeamFlowPerformanceMode::Optimized);
}

// In your actor
void AYourActor::Tick(float DeltaTime)
{
    Super::Tick(DeltaTime);
    
    // Use BeamFlow performance monitoring
    UBeamFlowManager::Get().RecordPerformanceMetric("ActorUpdate", DeltaTime);
}`})})]}),r("div",{children:[e("h3",{children:"Blueprint Integration"}),e("p",{className:"text-gray-300 mb-2",children:"BeamFlow also supports Blueprint integration:"}),r("ul",{className:"text-gray-300 space-y-1",children:[e("li",{children:"• Drag and drop BeamFlow nodes"}),e("li",{children:"• Access performance metrics"}),e("li",{children:"• Configure AI settings"}),e("li",{children:"• Monitor system health"})]})]})]})]}),r("div",{className:"bg-gray-800 p-6 rounded-lg border border-gray-700",children:[e("h2",{children:"Next Steps"}),e("p",{className:"text-gray-300 mb-4",children:"Now that you have the basics, explore these advanced features:"}),r("div",{className:"grid md:grid-cols-3 gap-4",children:[r("div",{className:"p-4 bg-gray-700 rounded-lg",children:[e("h4",{className:"text-red-400 mb-2",children:"Advanced AI"}),e("p",{className:"text-gray-300 text-sm",children:"Learn about advanced AI features and customization options."})]}),r("div",{className:"p-4 bg-gray-700 rounded-lg",children:[e("h4",{className:"text-red-400 mb-2",children:"Performance Tuning"}),e("p",{className:"text-gray-300 text-sm",children:"Optimize your project for maximum performance."})]}),r("div",{className:"p-4 bg-gray-700 rounded-lg",children:[e("h4",{className:"text-red-400 mb-2",children:"API Reference"}),e("p",{className:"text-gray-300 text-sm",children:"Explore the complete API documentation."})]})]})]})]})]});export{t as default};
