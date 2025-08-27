import React from 'react'

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-700 border-t-red-600 mx-auto mb-4"></div>
        <p className="text-gray-400 text-lg font-medium">Loading...</p>
        <p className="text-gray-600 text-sm mt-2">BeamFlow Documentation</p>
      </div>
    </div>
  )
}

export default LoadingSpinner
