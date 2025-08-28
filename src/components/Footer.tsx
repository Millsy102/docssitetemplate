import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const Footer: React.FC = () => {
  const { t } = useTranslation()

  return (
    <footer 
      className="bg-black border-t border-red-600 px-6 py-8 mt-auto"
      role="contentinfo"
      id="footer-content"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <h3 className="text-xl font-bold text-red-600">BeamFlow</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t('footer.madeWith')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-lg">{t('footer.links.docs')}</h4>
            <nav className="space-y-2">
              <Link 
                to="/" 
                className="block text-gray-400 hover:text-red-400 transition-colors text-sm"
              >
                {t('footer.links.home')}
              </Link>
              <Link 
                to="/installation" 
                className="block text-gray-400 hover:text-red-400 transition-colors text-sm"
              >
                {t('navigation.installation')}
              </Link>
              <Link 
                to="/getting-started" 
                className="block text-gray-400 hover:text-red-400 transition-colors text-sm"
              >
                {t('navigation.gettingStarted')}
              </Link>
              <Link 
                to="/contributing" 
                className="block text-gray-400 hover:text-red-400 transition-colors text-sm"
              >
                {t('navigation.contributing')}
              </Link>
            </nav>
          </div>

          {/* External Links */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-lg">{t('footer.links.github')}</h4>
            <nav className="space-y-2">
              <a 
                href="https://github.com/[your-username]/[your-repo-name]" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-gray-400 hover:text-red-400 transition-colors text-sm"
              >
                {t('footer.links.github')}
              </a>
              <a 
                href="https://github.com/[your-username]/[your-repo-name]/issues" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-gray-400 hover:text-red-400 transition-colors text-sm"
              >
                {t('footer.links.issues')}
              </a>
              <Link 
                to="/privacy-policy" 
                className="block text-gray-400 hover:text-red-400 transition-colors text-sm"
              >
                {t('footer.links.privacy')}
              </Link>
              <a 
                href="#" 
                className="block text-gray-400 hover:text-red-400 transition-colors text-sm"
              >
                {t('footer.links.terms')}
              </a>
            </nav>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
