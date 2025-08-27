import React from 'react'
import { Link } from 'react-router-dom'

const Home: React.FC = () => {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1>BeamFlow for Unreal Engine</h1>
        <p className="text-xl text-gray-300 mb-6">
          A powerful plugin that enhances Unreal Engine development with advanced features and tools.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-red-400 mb-4">🚀 Key Features</h3>
          <ul className="space-y-2 text-gray-300">
            <li>• Advanced AI integration</li>
            <li>• Performance optimization tools</li>
            <li>• Enhanced development workflow</li>
            <li>• Real-time monitoring</li>
            <li>• Plugin management system</li>
          </ul>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-red-400 mb-4">⚡ Quick Start</h3>
          <div className="space-y-3">
            <p className="text-gray-300">Get up and running in minutes:</p>
            <Link 
              to="/installation" 
              className="inline-block bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
            >
              Install Plugin
            </Link>
            <Link 
              to="/getting-started" 
              className="inline-block bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors ml-2"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8">
        <h2>System Requirements</h2>
        <div className="grid md:grid-cols-2 gap-6 mt-4">
          <div>
            <h4 className="text-red-400 mb-2">Minimum Requirements</h4>
            <ul className="text-gray-300 space-y-1">
              <li>• Unreal Engine 5.0+</li>
              <li>• Windows 10/11</li>
              <li>• 8GB RAM</li>
              <li>• DirectX 11 compatible GPU</li>
            </ul>
          </div>
          <div>
            <h4 className="text-red-400 mb-2">Recommended</h4>
            <ul className="text-gray-300 space-y-1">
              <li>• Unreal Engine 5.3+</li>
              <li>• Windows 11</li>
              <li>• 16GB+ RAM</li>
              <li>• RTX 3060 or better</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h2>Getting Help</h2>
        <p className="text-gray-300 mb-4">
          Need assistance with BeamFlow? Here are some resources to help you get started:
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <a 
            href="https://github.com/yourusername/beamflow-docs/issues" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <h4 className="text-red-400 mb-2">🐛 Report Issues</h4>
            <p className="text-gray-300 text-sm">Found a bug? Let us know!</p>
          </a>
          <a 
            href="https://github.com/yourusername/beamflow-docs/discussions" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <h4 className="text-red-400 mb-2">💬 Community</h4>
            <p className="text-gray-300 text-sm">Join the discussion</p>
          </a>
          <Link 
            to="/contributing" 
            className="block p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <h4 className="text-red-400 mb-2">🤝 Contribute</h4>
            <p className="text-gray-300 text-sm">Help improve BeamFlow</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home
