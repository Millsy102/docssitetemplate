import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        'home.title': 'BeamFlow for Unreal Engine',
        'home.welcome': 'BeamFlow for Unreal Engine',
        'home.description': 'A powerful streaming and processing plugin for Unreal Engine',
        'home.features.title': 'Key Features',
        'home.features.streaming': 'Real-time streaming capabilities',
        'home.features.processing': 'Advanced data processing',
        'home.features.integration': 'Seamless Unreal Engine integration',
        'home.features.performance': 'High-performance optimization',
        'home.features.scalability': 'Scalable architecture',
        'home.getStarted.title': 'Quick Start',
        'home.getStarted.description': 'Get started with BeamFlow in minutes',
        'home.getStarted.installButton': 'Install Plugin',
        'home.getStarted.learnMoreButton': 'Learn More',
        'navigation.home': 'Home',
        'navigation.installation': 'Installation',
        'navigation.gettingStarted': 'Getting Started',
        'navigation.contributing': 'Contributing',
        'common.loading': 'Loading...',
        'common.error': 'Error',
        'common.success': 'Success'
      };
      return translations[key] || key;
    },
    i18n: {
      changeLanguage: jest.fn(),
      language: 'en'
    }
  }),
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn()
  }
}));

// Configure testing library
configure({ testIdAttribute: 'data-testid' });

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};
