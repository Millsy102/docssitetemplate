import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-red-600 mb-4">404</h1>
          <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
          <p className="text-gray-300 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link 
            to="/" 
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Go Home
          </Link>
          
          <div className="text-sm text-gray-400">
            <p>Or try one of these pages:</p>
            <div className="mt-2 space-y-1">
              <Link to="/installation" className="block text-red-400 hover:text-red-300 transition-colors">
                Installation
              </Link>
              <Link to="/getting-started" className="block text-red-400 hover:text-red-300 transition-colors">
                Getting Started
              </Link>
              <Link to="/contributing" className="block text-red-400 hover:text-red-300 transition-colors">
                Contributing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
