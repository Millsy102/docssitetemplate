import React, { useState } from 'react';
import { useCookieConsent } from '../contexts/CookieConsentContext';

interface CookiePreferencesProps {
  isOpen: boolean;
  onClose: () => void;
}

const CookiePreferences: React.FC<CookiePreferencesProps> = ({
  isOpen,
  onClose,
}) => {
  const { consent, updateConsent } = useCookieConsent();
  const [localConsent, setLocalConsent] = useState(consent);

  if (!isOpen) return null;

  const handleSave = () => {
    updateConsent(localConsent);
    onClose();
  };

  const handleAcceptAll = () => {
    setLocalConsent({
      analytics: true,
      necessary: true,
      preferences: true,
      marketing: true,
    });
  };

  const handleRejectAll = () => {
    setLocalConsent({
      analytics: false,
      necessary: true,
      preferences: false,
      marketing: false,
    });
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-gray-900 border border-gray-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
        <div className='p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-2xl font-bold text-white'>
              Cookie Preferences
            </h2>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded'
            >
              <svg
                className='w-6 h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>

          <p className='text-gray-300 mb-6'>
            Manage your cookie preferences below. You can change these settings
            at any time.
          </p>

          {/* Quick Actions */}
          <div className='flex gap-3 mb-6'>
            <button
              onClick={handleAcceptAll}
              className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors'
            >
              Accept All
            </button>
            <button
              onClick={handleRejectAll}
              className='px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors'
            >
              Reject All
            </button>
          </div>

          {/* Cookie Categories */}
          <div className='space-y-4'>
            {/* Necessary Cookies */}
            <div className='bg-gray-800 border border-gray-600 rounded-lg p-4'>
              <div className='flex items-center justify-between mb-2'>
                <div className='flex items-center gap-3'>
                  <div className='w-4 h-4 bg-green-500 rounded-full'></div>
                  <h3 className='text-white font-medium'>Necessary Cookies</h3>
                </div>
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    checked={localConsent.necessary}
                    disabled
                    className='w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500 focus:ring-2'
                  />
                </div>
              </div>
              <p className='text-gray-400 text-sm'>
                These cookies are essential for the website to function
                properly. They cannot be disabled.
              </p>
            </div>

            {/* Analytics Cookies */}
            <div className='bg-gray-800 border border-gray-600 rounded-lg p-4'>
              <div className='flex items-center justify-between mb-2'>
                <div className='flex items-center gap-3'>
                  <div className='w-4 h-4 bg-red-500 rounded-full'></div>
                  <h3 className='text-white font-medium'>Analytics Cookies</h3>
                </div>
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    checked={localConsent.analytics}
                    onChange={e =>
                      setLocalConsent(prev => ({
                        ...prev,
                        analytics: e.target.checked,
                      }))
                    }
                    className='w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500 focus:ring-2'
                  />
                </div>
              </div>
              <p className='text-gray-400 text-sm'>
                Help us understand how visitors interact with our website by
                collecting and reporting information anonymously.
              </p>
            </div>

            {/* Preference Cookies */}
            <div className='bg-gray-800 border border-gray-600 rounded-lg p-4'>
              <div className='flex items-center justify-between mb-2'>
                <div className='flex items-center gap-3'>
                  <div className='w-4 h-4 bg-yellow-500 rounded-full'></div>
                  <h3 className='text-white font-medium'>Preference Cookies</h3>
                </div>
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    checked={localConsent.preferences}
                    onChange={e =>
                      setLocalConsent(prev => ({
                        ...prev,
                        preferences: e.target.checked,
                      }))
                    }
                    className='w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500 focus:ring-2'
                  />
                </div>
              </div>
              <p className='text-gray-400 text-sm'>
                Allow the website to remember choices you make and provide
                enhanced, more personal features.
              </p>
            </div>

            {/* Marketing Cookies */}
            <div className='bg-gray-800 border border-gray-600 rounded-lg p-4'>
              <div className='flex items-center justify-between mb-2'>
                <div className='flex items-center gap-3'>
                  <div className='w-4 h-4 bg-blue-500 rounded-full'></div>
                  <h3 className='text-white font-medium'>Marketing Cookies</h3>
                </div>
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    checked={localConsent.marketing}
                    onChange={e =>
                      setLocalConsent(prev => ({
                        ...prev,
                        marketing: e.target.checked,
                      }))
                    }
                    className='w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500 focus:ring-2'
                  />
                </div>
              </div>
              <p className='text-gray-400 text-sm'>
                Used to track visitors across websites to display relevant and
                engaging advertisements.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex gap-3 mt-6 pt-6 border-t border-gray-700'>
            <button
              onClick={onClose}
              className='px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors'
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className='px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors'
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePreferences;
