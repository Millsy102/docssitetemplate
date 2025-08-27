import React from 'react'

const GettingStarted: React.FC = () => {
  return (
    <div className="max-w-4xl">
      <h1>Getting Started</h1>
      <p className="text-xl text-gray-300 mb-8">
        Learn the basics of using BeamFlow in your Unreal Engine project.
      </p>

      <div className="space-y-8">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2>First Steps</h2>
          <p className="text-gray-300 mb-4">
            After installing BeamFlow, follow these steps to get started:
          </p>
          <ol className="text-gray-300 space-y-3">
            <li>1. Open your Unreal Engine project</li>
            <li>2. Navigate to the BeamFlow menu in the toolbar</li>
            <li>3. Click "Initialize BeamFlow" to set up the plugin</li>
            <li>4. Configure your project settings in the BeamFlow panel</li>
          </ol>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2>Basic Configuration</h2>
          <div className="space-y-4 mt-4">
            <div>
              <h3>Project Settings</h3>
              <p className="text-gray-300 mb-2">
                Configure BeamFlow settings for your project:
              </p>
              <pre>
                <code>{`// In your project's Build.cs file
PublicDependencyModuleNames.AddRange(new string[] { 
    "BeamFlow" 
});

// Add to your project's .uproject file
"Plugins": [
    {
        "Name": "BeamFlow",
        "Enabled": true
    }
]`}</code>
              </pre>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2>Core Features</h2>
          <div className="grid md:grid-cols-2 gap-6 mt-4">
            <div>
              <h3>AI Integration</h3>
              <p className="text-gray-300 mb-2">
                BeamFlow provides advanced AI capabilities:
              </p>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>• Smart asset management</li>
                <li>• Automated optimization</li>
                <li>• Intelligent debugging</li>
                <li>• Performance analysis</li>
              </ul>
            </div>
            
            <div>
              <h3>Performance Tools</h3>
              <p className="text-gray-300 mb-2">
                Monitor and optimize your project:
              </p>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>• Real-time performance metrics</li>
                <li>• Memory usage tracking</li>
                <li>• Frame rate analysis</li>
                <li>• Bottleneck detection</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2>Example Usage</h2>
          <div className="space-y-4 mt-4">
            <div>
              <h3>Basic Setup in C++</h3>
              <pre>
                <code>{`#include "BeamFlow/Public/BeamFlowManager.h"

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
}`}</code>
              </pre>
            </div>
            
            <div>
              <h3>Blueprint Integration</h3>
              <p className="text-gray-300 mb-2">
                BeamFlow also supports Blueprint integration:
              </p>
              <ul className="text-gray-300 space-y-1">
                <li>• Drag and drop BeamFlow nodes</li>
                <li>• Access performance metrics</li>
                <li>• Configure AI settings</li>
                <li>• Monitor system health</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2>Next Steps</h2>
          <p className="text-gray-300 mb-4">
            Now that you have the basics, explore these advanced features:
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-700 rounded-lg">
              <h4 className="text-red-400 mb-2">Advanced AI</h4>
              <p className="text-gray-300 text-sm">
                Learn about advanced AI features and customization options.
              </p>
            </div>
            <div className="p-4 bg-gray-700 rounded-lg">
              <h4 className="text-red-400 mb-2">Performance Tuning</h4>
              <p className="text-gray-300 text-sm">
                Optimize your project for maximum performance.
              </p>
            </div>
            <div className="p-4 bg-gray-700 rounded-lg">
              <h4 className="text-red-400 mb-2">API Reference</h4>
              <p className="text-gray-300 text-sm">
                Explore the complete API documentation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GettingStarted
