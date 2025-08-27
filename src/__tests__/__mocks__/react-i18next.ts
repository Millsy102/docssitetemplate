const mockTranslations: { [key: string]: string } = {
  'home.title': 'BeamFlow for Unreal Engine',
  'navigation.home': 'Home',
  'navigation.installation': 'Installation',
  'navigation.gettingStarted': 'Getting Started',
  'navigation.contributing': 'Contributing',
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'common.success': 'Success'
};

export const useTranslation = () => ({
  t: (key: string) => mockTranslations[key] || key,
  i18n: {
    changeLanguage: jest.fn(),
    language: 'en'
  }
});

export const initReactI18next = {
  type: '3rdParty',
  init: jest.fn()
};
