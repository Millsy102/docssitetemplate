import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Sidebar: React.FC = () => {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Overview', icon: '🏠' },
    { path: '/installation', label: 'Installation', icon: '📦' },
    { path: '/getting-started', label: 'Getting Started', icon: '🚀' },
    { path: '/contributing', label: 'Contributing', icon: '🤝' },
  ]

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-700 p-6">
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname === item.path
                ? 'bg-red-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-red-400'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-8 pt-8 border-t border-gray-700">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Quick Links
        </h3>
        <div className="space-y-2">
          <a
            href="https://github.com/Millsy102/docssitetemplate"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-3 px-4 py-2 text-gray-300 hover:text-red-400 transition-colors"
          >
            <span>📚</span>
            <span>GitHub Repository</span>
          </a>
          <a
            href="https://github.com/Millsy102/docssitetemplate/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-3 px-4 py-2 text-gray-300 hover:text-red-400 transition-colors"
          >
            <span>🐛</span>
            <span>Report Issues</span>
          </a>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
