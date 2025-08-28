import{j as e}from"./index-BJjdACgg.js";const s=()=>e.jsxs("div",{className:"max-w-4xl",children:[e.jsx("h1",{children:"Getting Started"}),e.jsx("p",{className:"text-xl text-gray-300 mb-8",children:"Learn the basics of using BeamFlow in your Unreal Engine project."}),e.jsxs("div",{className:"space-y-8",children:[e.jsxs("div",{className:"bg-gray-800 p-6 rounded-lg border border-gray-700",children:[e.jsx("h2",{children:"First Steps"}),e.jsx("p",{className:"text-gray-300 mb-4",children:"After installing BeamFlow, follow these steps to get started:"}),e.jsxs("ol",{className:"text-gray-300 space-y-3",children:[e.jsx("li",{children:"1. Open your Unreal Engine project"}),e.jsx("li",{children:"2. Navigate to the BeamFlow menu in the toolbar"}),e.jsx("li",{children:'3. Click "Initialize BeamFlow" to set up the plugin'}),e.jsx("li",{children:"4. Configure your project settings in the BeamFlow panel"})]})]}),e.jsxs("div",{className:"bg-gray-800 p-6 rounded-lg border border-gray-700",children:[e.jsx("h2",{children:"Basic Configuration"}),e.jsx("div",{className:"space-y-4 mt-4",children:e.jsxs("div",{children:[e.jsx("h3",{children:"Project Settings"}),e.jsx("p",{className:"text-gray-300 mb-2",children:"Configure BeamFlow settings for your project:"}),e.jsx("pre",{children:e.jsx("code",{children:`// In your project's Build.cs file
PublicDependencyModuleNames.AddRange(new string[] { 
    "BeamFlow" 
});

// Add to your project's .uproject file
"Plugins": [
    {
        "Name": "BeamFlow",
        "Enabled": true
    }
]`})})]})})]}),e.jsxs("div",{className:"bg-gray-800 p-6 rounded-lg border border-gray-700",children:[e.jsx("h2",{children:"Core Features"}),e.jsxs("div",{className:"grid md:grid-cols-2 gap-6 mt-4",children:[e.jsxs("div",{children:[e.jsx("h3",{children:"AI Integration"}),e.jsx("p",{className:"text-gray-300 mb-2",children:"BeamFlow provides advanced AI capabilities:"}),e.jsxs("ul",{className:"text-gray-300 space-y-1 text-sm",children:[e.jsx("li",{children:"• Smart asset management"}),e.jsx("li",{children:"• Automated optimization"}),e.jsx("li",{children:"• Intelligent debugging"}),e.jsx("li",{children:"• Performance analysis"})]})]}),e.jsxs("div",{children:[e.jsx("h3",{children:"Performance Tools"}),e.jsx("p",{className:"text-gray-300 mb-2",children:"Monitor and optimize your project:"}),e.jsxs("ul",{className:"text-gray-300 space-y-1 text-sm",children:[e.jsx("li",{children:"• Real-time performance metrics"}),e.jsx("li",{children:"• Memory usage tracking"}),e.jsx("li",{children:"• Frame rate analysis"}),e.jsx("li",{children:"• Bottleneck detection"})]})]})]})]}),e.jsxs("div",{className:"bg-gray-800 p-6 rounded-lg border border-gray-700",children:[e.jsx("h2",{children:"Example Usage"}),e.jsxs("div",{className:"space-y-4 mt-4",children:[e.jsxs("div",{children:[e.jsx("h3",{children:"Basic Setup in C++"}),e.jsx("pre",{children:e.jsx("code",{children:`#include "BeamFlow/Public/BeamFlowManager.h"

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
}`})})]}),e.jsxs("div",{children:[e.jsx("h3",{children:"Blueprint Integration"}),e.jsx("p",{className:"text-gray-300 mb-2",children:"BeamFlow also supports Blueprint integration:"}),e.jsxs("ul",{className:"text-gray-300 space-y-1",children:[e.jsx("li",{children:"• Drag and drop BeamFlow nodes"}),e.jsx("li",{children:"• Access performance metrics"}),e.jsx("li",{children:"• Configure AI settings"}),e.jsx("li",{children:"• Monitor system health"})]})]})]})]}),e.jsxs("div",{className:"bg-gray-800 p-6 rounded-lg border border-gray-700",children:[e.jsx("h2",{children:"Next Steps"}),e.jsx("p",{className:"text-gray-300 mb-4",children:"Now that you have the basics, explore these advanced features:"}),e.jsxs("div",{className:"grid md:grid-cols-3 gap-4",children:[e.jsxs("div",{className:"p-4 bg-gray-700 rounded-lg",children:[e.jsx("h4",{className:"text-red-400 mb-2",children:"Advanced AI"}),e.jsx("p",{className:"text-gray-300 text-sm",children:"Learn about advanced AI features and customization options."})]}),e.jsxs("div",{className:"p-4 bg-gray-700 rounded-lg",children:[e.jsx("h4",{className:"text-red-400 mb-2",children:"Performance Tuning"}),e.jsx("p",{className:"text-gray-300 text-sm",children:"Optimize your project for maximum performance."})]}),e.jsxs("div",{className:"p-4 bg-gray-700 rounded-lg",children:[e.jsx("h4",{className:"text-red-400 mb-2",children:"API Reference"}),e.jsx("p",{className:"text-gray-300 text-sm",children:"Explore the complete API documentation."})]})]})]})]})]});export{s as default};
