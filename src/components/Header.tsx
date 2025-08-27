import React from 'react'
import { Link } from 'react-router-dom'

const Header: React.FC = () => {
  return (
    <header className="bg-black border-b border-red-600 px-6 py-4">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <h1 className="text-2xl font-bold text-red-600">BeamFlow</h1>
          <span className="text-gray-400 text-sm">Documentation</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-300 hover:text-red-400 transition-colors">
            Home
          </Link>
          <Link to="/installation" className="text-gray-300 hover:text-red-400 transition-colors">
            Installation
          </Link>
          <Link to="/getting-started" className="text-gray-300 hover:text-red-400 transition-colors">
            Getting Started
          </Link>
          <Link to="/contributing" className="text-gray-300 hover:text-red-400 transition-colors">
            Contributing
          </Link>
        </nav>

        <div className="md:hidden">
          <button className="text-gray-300 hover:text-red-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
