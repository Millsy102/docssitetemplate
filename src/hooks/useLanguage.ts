import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import { languages } from '../i18n'

export const useLanguage = () => {
  const { i18n, t } = useTranslation()

  // Get current language info
  const currentLanguage = i18n.language
  const currentLangInfo = languages[currentLanguage as keyof typeof languages] || languages.en

  // Get available languages
  const availableLanguages = Object.entries(languages)

  // Change language
  const changeLanguage = (languageCode: string) => {
    if (languages[languageCode as keyof typeof languages]) {
      i18n.changeLanguage(languageCode)
      
      // Update document attributes
      document.documentElement.lang = languageCode
      document.documentElement.setAttribute('data-lang', languageCode)
      
      // Store preference
      localStorage.setItem('i18nextLng', languageCode)
      
      // Dispatch custom event for other components
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { language: languageCode } 
      }))
    }
  }

  // Get browser language
  const getBrowserLanguage = () => {
    const browserLang = navigator.language || navigator.languages?.[0] || 'en'
    const langCode = browserLang.split('-')[0]
    return Object.keys(languages).includes(langCode) ? langCode : 'en'
  }

  // Initialize language on mount
  useEffect(() => {
    // Set initial language if not already set
    if (!localStorage.getItem('i18nextLng')) {
      const browserLang = getBrowserLanguage()
      changeLanguage(browserLang)
    }
    
    // Set document attributes
    document.documentElement.lang = currentLanguage
    document.documentElement.setAttribute('data-lang', currentLanguage)
  }, [currentLanguage])

  return {
    currentLanguage,
    currentLangInfo,
    availableLanguages,
    changeLanguage,
    getBrowserLanguage,
    t
  }
}
