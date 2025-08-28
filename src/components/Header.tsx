import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSelector from './LanguageSelector'

const Header: React.FC = () => {
  const { t } = useTranslation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      closeMobileMenu()
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <header className="bg-black border-b border-red-600 px-6 py-4 relative">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3" onClick={closeMobileMenu}>
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <h1 className="text-2xl font-bold text-red-600">BeamFlow</h1>
          <span className="text-gray-400 text-sm">for Unreal Engine</span>
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

        <div className="hidden md:flex items-center space-x-4">
          <LanguageSelector />
          <a 
            href="/admin.html" 
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            Admin
          </a>
        </div>

        <div className="md:hidden">
          <button 
            className="text-gray-300 hover:text-red-400 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-black"
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <nav 
          id="mobile-menu"
          className="md:hidden absolute top-full left-0 right-0 bg-black border-b border-red-600 shadow-lg z-50"
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="px-6 py-4 space-y-4">
            <Link 
              to="/" 
              className="block text-gray-300 hover:text-red-400 transition-colors py-2 border-b border-gray-700"
              onClick={closeMobileMenu}
            >
              Home
            </Link>
            <Link 
              to="/installation" 
              className="block text-gray-300 hover:text-red-400 transition-colors py-2 border-b border-gray-700"
              onClick={closeMobileMenu}
            >
              Installation
            </Link>
            <Link 
              to="/getting-started" 
              className="block text-gray-300 hover:text-red-400 transition-colors py-2 border-b border-gray-700"
              onClick={closeMobileMenu}
            >
              Getting Started
            </Link>
            <Link 
              to="/contributing" 
              className="block text-gray-300 hover:text-red-400 transition-colors py-2 border-b border-gray-700"
              onClick={closeMobileMenu}
            >
              Contributing
            </Link>
            <div className="pt-4 border-t border-gray-700">
              <LanguageSelector />
            </div>
            <a 
              href="/admin.html" 
              className="block bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-medium text-center"
              onClick={closeMobileMenu}
            >
              Admin
            </a>
          </div>
        </nav>
      )}
    </header>
  )
}

export default Header


