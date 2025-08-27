import React from 'react';
import { useAnalytics } from '../utils/analytics';
import { useCookieConsent } from '../contexts/CookieConsentContext';

const AnalyticsDemo: React.FC = () => {
  const analytics = useAnalytics();
  const { consent } = useCookieConsent();

  const handleDemoClick = () => {
    analytics.trackButtonClick('demo_button', 'analytics-demo');
  };

  const handleDemoSearch = () => {
    analytics.trackSearch('demo search query', 5);
  };

  const handleDemoDownload = () => {
    analytics.trackDownload('demo-file.pdf', 'pdf');
  };

  return (
    <div className='bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6'>
      <h3 className='text-white font-semibold text-lg mb-4'>Analytics Demo</h3>

      <div className='mb-4'>
        <p className='text-gray-300 text-sm mb-2'>
          Analytics consent status:
          <span
            className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
              consent.analytics
                ? 'bg-green-600 text-white'
                : 'bg-red-600 text-white'
            }`}
          >
            {consent.analytics ? 'Enabled' : 'Disabled'}
          </span>
        </p>

        {!consent.analytics && (
          <p className='text-yellow-400 text-sm'>
            Enable analytics in the cookie banner below to see tracking in
            action.
          </p>
        )}
      </div>

      <div className='space-y-3'>
        <button
          onClick={handleDemoClick}
          className='w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors'
        >
          Track Button Click
        </button>

        <button
          onClick={handleDemoSearch}
          className='w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors'
        >
          Track Search Event
        </button>

        <button
          onClick={handleDemoDownload}
          className='w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors'
        >
          Track Download Event
        </button>
      </div>

      <div className='mt-4 p-3 bg-gray-800 rounded text-xs text-gray-400'>
        <p className='font-medium mb-1'>What's tracked:</p>
        <ul className='space-y-1'>
          <li>• Button clicks with page context</li>
          <li>• Search queries and result counts</li>
          <li>• File downloads with file types</li>
          <li>• Page views (automatic)</li>
        </ul>
      </div>
    </div>
  );
};

export default AnalyticsDemo;
