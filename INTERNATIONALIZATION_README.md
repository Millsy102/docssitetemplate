# Internationalization (i18n) Setup

This document describes the internationalization setup for the BeamFlow documentation site.

## Overview

The site now supports multiple languages using `react-i18next` with the following features:

- **6 Supported Languages**: English, Spanish, French, German, Chinese, Japanese
- **Automatic Language Detection**: Based on browser settings
- **Persistent Language Preference**: Stored in localStorage
- **Dynamic Language Switching**: Real-time language changes without page reload
- **Accessible Language Selector**: Keyboard navigation and screen reader support

## Supported Languages

| Language | Code | Flag | Native Name |
|----------|------|------|-------------|
| English | `en` | 🇺🇸 | English |
| Spanish | `es` | 🇪🇸 | Español |
| French | `fr` | 🇫🇷 | Français |
| German | `de` | 🇩🇪 | Deutsch |
| Chinese | `zh` | 🇨🇳 | 中文 |
| Japanese | `ja` | 🇯🇵 | 日本語 |

## File Structure

```
src/
├── i18n/
│   ├── index.ts              # i18n configuration
│   └── locales/
│       ├── en.json           # English translations
│       ├── es.json           # Spanish translations
│       ├── fr.json           # French translations
│       ├── de.json           # German translations
│       ├── zh.json           # Chinese translations
│       └── ja.json           # Japanese translations
├── components/
│   ├── LanguageSelector.tsx  # Language switcher component
│   └── ...
├── hooks/
│   └── useLanguage.ts        # Language management hook
└── styles/
    └── LanguageSelector.module.css  # Language selector styles
```

## Components

### LanguageSelector

A dropdown component that allows users to switch languages. Features:

- **Visual Language Indicators**: Country flags and native language names
- **Keyboard Navigation**: Full keyboard accessibility
- **Mobile Responsive**: Adapts to mobile screens
- **Red/Black Theme**: Matches the site's design
- **Accessibility**: ARIA labels and screen reader support

### useLanguage Hook

Custom React hook for language management:

```typescript
const { 
  currentLanguage, 
  currentLangInfo, 
  availableLanguages, 
  changeLanguage, 
  getBrowserLanguage, 
  t 
} = useLanguage()
```

## Usage

### In Components

```tsx
import { useTranslation } from 'react-i18next'

const MyComponent = () => {
  const { t } = useTranslation()
  
  return (
    <div>
      <h1>{t('home.welcome')}</h1>
      <p>{t('home.description')}</p>
    </div>
  )
}
```

### Adding New Translations

1. **Add to all language files** in `src/i18n/locales/`:

```json
{
  "newSection": {
    "title": "English Title",
    "description": "English description"
  }
}
```

2. **Update the i18n configuration** in `src/i18n/index.ts`:

```typescript
export const languages = {
  // ... existing languages
  newLang: { name: 'New Language', flag: '🏳️' }
}
```

### Adding New Languages

1. **Create translation file** `src/i18n/locales/newlang.json`
2. **Update i18n configuration** in `src/i18n/index.ts`
3. **Add language to public/locales** using the copy script

## Translation Structure

Translations are organized hierarchically:

```json
{
  "common": {
    "loading": "Loading...",
    "error": "Error"
  },
  "navigation": {
    "home": "Home",
    "installation": "Installation"
  },
  "home": {
    "title": "Welcome",
    "features": {
      "title": "Features",
      "streaming": "Real-time Streaming"
    }
  }
}
```

## Scripts

### Development

```bash
# Start development with i18n support
npm run i18n:dev

# Copy translation files to public
npm run i18n:copy
```

### Building

```bash
# Build with translations
npm run i18n:build
```

## Technical Details

### Language Detection Order

1. **localStorage**: User's saved preference
2. **Browser Language**: Navigator language setting
3. **HTML Tag**: Document lang attribute
4. **Fallback**: English (en)

### Storage

- **localStorage Key**: `i18nextLng`
- **Document Attributes**: `lang` and `data-lang` attributes updated automatically

### Performance

- **Lazy Loading**: Translations loaded on-demand
- **Caching**: Browser caching for translation files
- **Bundle Optimization**: Translations not bundled with main app

## Accessibility Features

- **Skip Links**: Keyboard-accessible language switching
- **Screen Reader Support**: Proper ARIA labels and roles
- **High Contrast**: Supports high contrast mode
- **Reduced Motion**: Respects user's motion preferences
- **Focus Management**: Proper focus handling in dropdown

## Browser Support

- **Modern Browsers**: Full support
- **Legacy Browsers**: Graceful degradation
- **Mobile Browsers**: Responsive design
- **Screen Readers**: Full compatibility

## Testing

### Manual Testing

1. **Language Switching**: Test all language options
2. **Persistence**: Verify language preference is saved
3. **Accessibility**: Test with keyboard navigation and screen readers
4. **Mobile**: Test on mobile devices

### Automated Testing

```bash
# Test i18n functionality
npm test

# Test accessibility
npm run test:accessibility
```

## Troubleshooting

### Common Issues

1. **Translations Not Loading**
   - Check file paths in `public/locales/`
   - Verify translation file format (valid JSON)
   - Check browser console for errors

2. **Language Not Switching**
   - Verify translation keys exist
   - Check localStorage for saved preference
   - Clear browser cache

3. **Missing Translations**
   - Add missing keys to all language files
   - Use fallback language (English)
   - Check translation file syntax

### Debugging

```typescript
// Enable debug mode
const { i18n } = useTranslation()
console.log('Current language:', i18n.language)
console.log('Available languages:', i18n.languages)
```

## Future Enhancements

- **Auto-translation**: Integration with translation services
- **RTL Support**: Right-to-left language support
- **Pluralization**: Advanced pluralization rules
- **Context Support**: Context-aware translations
- **Translation Memory**: Reuse existing translations

## Contributing

When adding new content:

1. **Always use translation keys** instead of hardcoded text
2. **Add translations to all supported languages**
3. **Test with different languages**
4. **Update this documentation** for new features

## Resources

- [react-i18next Documentation](https://react.i18next.com/)
- [i18next Documentation](https://www.i18next.com/)
- [Language Codes](https://www.loc.gov/standards/iso639-2/)
- [Country Flags](https://emojipedia.org/flags/)
