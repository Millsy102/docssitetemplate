import React from 'react'
import { useTranslation } from 'react-i18next'

const SkipLinks: React.FC = () => {
  const { t } = useTranslation()

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-red-600 text-white px-4 py-2 rounded-md z-50 text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black"
      >
        {t('navigation.skipToMain')}
      </a>
      <a
        href="#footer-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-16 focus:left-4 bg-red-600 text-white px-4 py-2 rounded-md z-50 text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black"
      >
        {t('navigation.skipToNav')}
      </a>
    </>
  )
}

export default SkipLinks
