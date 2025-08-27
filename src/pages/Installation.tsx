import React from 'react'

const Installation: React.FC = () => {
  return (
    <div className="max-w-4xl">
      <h1>Installation Guide</h1>
      <p className="text-xl text-gray-300 mb-8">
        Follow these steps to install BeamFlow in your Unreal Engine project.
      </p>

      <div className="space-y-8">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2>Prerequisites</h2>
          <ul className="text-gray-300 space-y-2 mt-4">
            <li>• Unreal Engine 5.0 or later</li>
            <li>• Visual Studio 2019 or later (Windows)</li>
            <li>• Git installed on your system</li>
            <li>• C++ project (Blueprint-only projects not supported)</li>
          </ul>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2>Method 1: Plugin Marketplace (Recommended)</h2>
          <ol className="text-gray-300 space-y-3 mt-4">
            <li>1. Open your Unreal Engine project</li>
            <li>2. Go to <code>Edit → Plugins</code></li>
            <li>3. Click on the <code>Marketplace</code> tab</li>
            <li>4. Search for "BeamFlow"</li>
            <li>5. Click <code>Install</code> and restart the editor</li>
          </ol>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2>Method 2: Manual Installation</h2>
          <div className="space-y-4 mt-4">
            <div>
              <h3>Step 1: Download the Plugin</h3>
              <pre className="mt-2">
                <code>git clone https://github.com/yourusername/beamflow-plugin.git</code>
              </pre>
            </div>
            
            <div>
              <h3>Step 2: Copy to Your Project</h3>
              <p className="text-gray-300 mb-2">Copy the plugin folder to your project's Plugins directory:</p>
              <pre>
                <code>YourProject/Plugins/BeamFlow/</code>
              </pre>
            </div>
            
            <div>
              <h3>Step 3: Enable the Plugin</h3>
              <ol className="text-gray-300 space-y-2">
                <li>1. Open your project in Unreal Engine</li>
                <li>2. Go to <code>Edit → Plugins</code></li>
                <li>3. Find "BeamFlow" in the list</li>
                <li>4. Check the box to enable it</li>
                <li>5. Restart the editor when prompted</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2>Verification</h2>
          <p className="text-gray-300 mb-4">
            After installation, verify that BeamFlow is working correctly:
          </p>
          <ul className="text-gray-300 space-y-2">
            <li>• Check that "BeamFlow" appears in the Plugins list</li>
            <li>• Look for the BeamFlow menu in the editor toolbar</li>
            <li>• Verify no compilation errors in the Output Log</li>
          </ul>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2>Troubleshooting</h2>
          <div className="space-y-4 mt-4">
            <div>
              <h3>Common Issues</h3>
              <ul className="text-gray-300 space-y-2">
                <li>• <strong>Compilation errors:</strong> Make sure you have Visual Studio installed</li>
                <li>• <strong>Plugin not found:</strong> Verify the plugin is in the correct directory</li>
                <li>• <strong>Engine version mismatch:</strong> Ensure you're using UE5.0+</li>
              </ul>
            </div>
            
            <div>
              <h3>Getting Help</h3>
              <p className="text-gray-300">
                If you encounter issues, please check our{' '}
                <a href="https://github.com/yourusername/beamflow-docs/issues" className="text-red-400 hover:text-red-300">
                  GitHub Issues
                </a>{' '}
                or create a new one with detailed information about your setup.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Installation
