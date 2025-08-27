import React, { useState } from 'react';
import { useCookieConsent } from '../contexts/CookieConsentContext';

const AnalyticsOptInBanner: React.FC = () => {
  const { showBanner, acceptAnalytics, rejectAnalytics, dismissBanner } =
    useCookieConsent();
  const [showDetails, setShowDetails] = useState(false);

  if (!showBanner) {
    return null;
  }

  return (
    <div className='fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-red-600 shadow-lg'>
      <div className='max-w-7xl mx-auto px-4 py-6'>
        <div className='flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4'>
          {/* Main content */}
          <div className='flex-1'>
            <h3 className='text-white font-semibold text-lg mb-2'>
               We use cookies to improve your experience
            </h3>
            <p className='text-gray-300 text-sm mb-3'>
              We use cookies to analyze site traffic and optimize your
              experience. You can choose which cookies to accept below.
            </p>

            {/* Details section */}
            {showDetails && (
              <div className='bg-gray-900 border border-gray-700 rounded-lg p-4 mb-4'>
                <h4 className='text-white font-medium mb-3'>Cookie Details:</h4>
                <div className='space-y-3 text-sm'>
                  <div className='flex items-start gap-3'>
                    <div className='w-3 h-3 bg-green-500 rounded-full mt-1 flex-shrink-0'></div>
                    <div>
                      <span className='text-white font-medium'>
                        Necessary cookies
                      </span>
                      <p className='text-gray-400'>
                        Required for the website to function properly. These
                        cannot be disabled.
                      </p>
                    </div>
                  </div>
                  <div className='flex items-start gap-3'>
                    <div className='w-3 h-3 bg-red-500 rounded-full mt-1 flex-shrink-0'></div>
                    <div>
                      <span className='text-white font-medium'>
                        Analytics cookies
                      </span>
                      <p className='text-gray-400'>
                        Help us understand how visitors interact with our
                        website by collecting and reporting information
                        anonymously.
                      </p>
                    </div>
                  </div>
                  <div className='flex items-start gap-3'>
                    <div className='w-3 h-3 bg-yellow-500 rounded-full mt-1 flex-shrink-0'></div>
                    <div>
                      <span className='text-white font-medium'>
                        Preference cookies
                      </span>
                      <p className='text-gray-400'>
                        Allow the website to remember choices you make and
                        provide enhanced, more personal features.
                      </p>
                    </div>
                  </div>
                  <div className='flex items-start gap-3'>
                    <div className='w-3 h-3 bg-blue-500 rounded-full mt-1 flex-shrink-0'></div>
                    <div>
                      <span className='text-white font-medium'>
                        Marketing cookies
                      </span>
                      <p className='text-gray-400'>
                        Used to track visitors across websites to display
                        relevant and engaging advertisements.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy policy link */}
            <div className='flex items-center gap-4 text-sm'>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className='text-red-400 hover:text-red-300 underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black rounded'
              >
                {showDetails ? 'Hide details' : 'Show details'}
              </button>
              <a
                href='/privacy-policy'
                className='text-red-400 hover:text-red-300 underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black rounded'
              >
                Privacy Policy
              </a>
            </div>
          </div>

          {/* Action buttons */}
          <div className='flex flex-col sm:flex-row gap-3 w-full lg:w-auto'>
            <button
              onClick={rejectAnalytics}
              className='px-6 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-black transition-colors'
            >
              Reject All
            </button>
            <button
              onClick={acceptAnalytics}
              className='px-6 py-2 bg-red-600 text-white border border-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black transition-colors'
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsOptInBanner;
