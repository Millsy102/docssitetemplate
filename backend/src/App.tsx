import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'

// Simple placeholder components to replace missing imports
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gradient-to-br from-red-900 to-black">
    <nav className="bg-black/50 backdrop-blur-sm border-b border-red-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-red-500 font-bold text-xl">BeamFlow</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => useAuthStore.getState().logout()}
              className="text-red-400 hover:text-red-300 px-3 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {children}
    </main>
  </div>
)

const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }
  
  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-red-500 border-t-transparent`}></div>
    </div>
  )
}

// Placeholder page components
const Dashboard: React.FC = () => (
  <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-red-500/20">
    <h2 className="text-2xl font-bold text-red-400 mb-4">Dashboard</h2>
    <p className="text-gray-300">Welcome to BeamFlow Dashboard</p>
  </div>
)

const PluginMarketplace: React.FC = () => (
  <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-red-500/20">
    <h2 className="text-2xl font-bold text-red-400 mb-4">Plugin Marketplace</h2>
    <p className="text-gray-300">Plugin marketplace coming soon...</p>
  </div>
)

const AdminPanel: React.FC = () => (
  <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-red-500/20">
    <h2 className="text-2xl font-bold text-red-400 mb-4">Admin Panel</h2>
    <p className="text-gray-300">Admin panel coming soon...</p>
  </div>
)

const Settings: React.FC = () => (
  <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-red-500/20">
    <h2 className="text-2xl font-bold text-red-400 mb-4">Settings</h2>
    <p className="text-gray-300">Settings panel coming soon...</p>
  </div>
)

const Login: React.FC = () => {
  const { login, isLoading, error } = useAuthStore()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(email, password)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 to-black flex items-center justify-center">
      <div className="bg-black/30 backdrop-blur-sm rounded-lg p-8 border border-red-500/20 w-full max-w-md">
        <h2 className="text-3xl font-bold text-red-400 mb-6 text-center">BeamFlow Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-red-400 text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-black/50 border border-red-500/20 rounded-md text-white focus:outline-none focus:border-red-500"
              required
            />
          </div>
          <div>
            <label className="block text-red-400 text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-black/50 border border-red-500/20 rounded-md text-white focus:outline-none focus:border-red-500"
              required
            />
          </div>
          {error && (
            <div className="text-red-400 text-sm">{error}</div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}

const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 to-black flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 to-black">
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/marketplace" element={<PluginMarketplace />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </div>
  )
}

export default App
