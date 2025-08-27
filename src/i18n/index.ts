import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-http-backend'

// Import translation files
import enTranslations from './locales/en.json'
import esTranslations from './locales/es.json'
import frTranslations from './locales/fr.json'
import deTranslations from './locales/de.json'
import zhTranslations from './locales/zh.json'
import jaTranslations from './locales/ja.json'

// Available languages
export const languages = {
  en: { name: 'English', flag: '🇺🇸' },
  es: { name: 'Español', flag: '🇪🇸' },
  fr: { name: 'Français', flag: '🇫🇷' },
  de: { name: 'Deutsch', flag: '🇩🇪' },
  zh: { name: '中文', flag: '🇨🇳' },
  ja: { name: '日本語', flag: '🇯🇵' }
}

// Translation resources
const resources = {
  en: {
    translation: enTranslations
  },
  es: {
    translation: esTranslations
  },
  fr: {
    translation: frTranslations
  },
  de: {
    translation: deTranslations
  },
  zh: {
    translation: zhTranslations
  },
  ja: {
    translation: jaTranslations
  }
}

i18n
  // Use backend for loading translations
  .use(Backend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',

    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    interpolation: {
      escapeValue: false, // React already does escaping
    },

    // Backend options
    backend: {
      loadPath: '/locales/{{lng}}.json',
    },

    // React i18next options
    react: {
      useSuspense: false, // Disable suspense for better error handling
    },

    // Namespace options
    defaultNS: 'translation',
    ns: ['translation'],

    // Language options
    supportedLngs: Object.keys(languages),
    preload: ['en'], // Preload English
  })

export default i18n
