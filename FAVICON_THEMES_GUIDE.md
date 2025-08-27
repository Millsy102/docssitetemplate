# Parameterized Favicon Generation Guide

## Overview

The BeamFlow documentation site now supports parameterized favicon generation with multiple theme variants. This system allows you to generate favicons in different color schemes and easily switch between themes.

## Features

- 🎨 **Multiple Theme Variants**: 6 pre-configured themes (Default, Dark, Light, Blue, Green, Purple)
- 📱 **Multi-Format Support**: SVG, PNG, WebP, AVIF, and ICO formats
- 🔧 **Easy Customization**: Simple theme configuration system
- ⚡ **Automated Generation**: Command-line tools for batch generation
- 🎯 **React Integration**: Theme switcher component for user interface
- 💾 **Persistent Preferences**: User theme preferences saved in localStorage

## Available Themes

### 1. Default (Red & Black)
- **Primary**: `#dc2626` (Red)
- **Background**: `#111827` (Dark Gray)
- **Description**: Current BeamFlow branding theme

### 2. Dark
- **Primary**: `#dc2626` (Red)
- **Background**: `#000000` (Pure Black)
- **Description**: Dark theme with red accents

### 3. Light
- **Primary**: `#dc2626` (Red)
- **Background**: `#ffffff` (White)
- **Description**: Light theme with red accents

### 4. Blue
- **Primary**: `#3b82f6` (Blue)
- **Background**: `#111827` (Dark Gray)
- **Description**: Blue theme variant

### 5. Green
- **Primary**: `#10b981` (Green)
- **Background**: `#111827` (Dark Gray)
- **Description**: Green theme variant

### 6. Purple
- **Primary**: `#8b5cf6` (Purple)
- **Background**: `#111827` (Dark Gray)
- **Description**: Purple theme variant

## Usage

### Command Line Generation

#### Generate All Themes
```bash
npm run generate:favicons:all
# or
node scripts/generate-favicons.js all
```

#### Generate Specific Theme
```bash
# Generate default theme
npm run generate:favicons:default

# Generate dark theme
npm run generate:favicons:dark

# Generate light theme
npm run generate:favicons:light

# Generate blue theme
npm run generate:favicons:blue

# Generate green theme
npm run generate:favicons:green

# Generate purple theme
npm run generate:favicons:purple
```

#### Legacy Generation (from existing SVG)
```bash
npm run generate:favicons
# or
node scripts/generate-favicons.js legacy
```

### React Component Usage

#### Basic Theme Switcher
```tsx
import ThemeSwitcher from './components/ThemeSwitcher';

function App() {
  return (
    <div>
      <ThemeSwitcher />
    </div>
  );
}
```

#### Customized Theme Switcher
```tsx
import ThemeSwitcher from './components/ThemeSwitcher';

function App() {
  return (
    <div>
      {/* Dropdown variant */}
      <ThemeSwitcher 
        variant="dropdown" 
        size="md" 
        showLabels={true} 
      />
      
      {/* Button grid variant */}
      <ThemeSwitcher 
        variant="grid" 
        size="lg" 
        showLabels={true} 
      />
      
      {/* Individual buttons */}
      <ThemeSwitcher 
        variant="buttons" 
        size="sm" 
        showLabels={false} 
      />
    </div>
  );
}
```

### JavaScript API Usage

#### Import Theme Configuration
```javascript
import { 
  THEMES, 
  getTheme, 
  getThemeColors, 
  applyTheme,
  getFaviconPath 
} from './config/themes';

// Get all themes
const allThemes = THEMES;

// Get specific theme
const defaultTheme = getTheme('default');

// Get theme colors
const colors = getThemeColors('blue');

// Apply theme
applyTheme('green');

// Get favicon path
const faviconPath = getFaviconPath('purple', 'svg');
```

## File Structure

After generation, the following structure is created:

```
public/
├── themes/
│   ├── theme-config.json          # Theme configuration
│   ├── default/                   # Default theme favicons
│   │   ├── favicon.svg
│   │   ├── favicon.ico
│   │   ├── favicon-16x16.png
│   │   ├── favicon-32x32.png
│   │   ├── apple-touch-icon.png
│   │   ├── android-chrome-192x192.png
│   │   ├── android-chrome-512x512.png
│   │   ├── favicon-16x16.webp
│   │   ├── favicon-32x32.webp
│   │   ├── favicon-16x16.avif
│   │   └── favicon-32x32.avif
│   ├── dark/                      # Dark theme favicons
│   ├── light/                     # Light theme favicons
│   ├── blue/                      # Blue theme favicons
│   ├── green/                     # Green theme favicons
│   └── purple/                    # Purple theme favicons
└── favicon.svg                    # Original favicon (unchanged)
```

## Customization

### Adding New Themes

1. **Update Theme Configuration**
   
   Edit `src/config/themes.js`:
   ```javascript
   export const THEMES = {
     // ... existing themes
     custom: {
       name: 'Custom',
       description: 'Custom theme description',
       colors: {
         primary: '#your-color',
         primaryDark: '#your-dark-color',
         background: '#your-bg-color',
         accent: '#your-accent-color',
         stroke: '#your-stroke-color',
         // ... other colors
       },
       tailwind: {
         // ... Tailwind classes
       }
     }
   };
   ```

2. **Update Generation Script**
   
   Edit `scripts/generate-favicons.js`:
   ```javascript
   const THEMES = {
     // ... existing themes
     custom: {
       name: 'Custom',
       description: 'Custom theme description',
       colors: {
         primary: '#your-color',
         primaryDark: '#your-dark-color',
         background: '#your-bg-color',
         accent: '#your-accent-color',
         stroke: '#your-stroke-color'
       }
     }
   };
   ```

3. **Add NPM Script**
   
   Edit `package.json`:
   ```json
   {
     "scripts": {
       "generate:favicons:custom": "node scripts/generate-favicons.js custom"
     }
   }
   ```

### Modifying Existing Themes

To modify an existing theme, update the color values in both:
- `src/config/themes.js`
- `scripts/generate-favicons.js`

Then regenerate the favicons:
```bash
npm run generate:favicons:all
```

## Integration with HTML

### Manual HTML Integration

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Theme-specific favicon -->
  <link rel="icon" type="image/svg+xml" href="/themes/default/favicon.svg">
  
  <!-- Fallback favicons -->
  <link rel="icon" type="image/png" sizes="32x32" href="/themes/default/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/themes/default/favicon-16x16.png">
  
  <!-- Apple touch icon -->
  <link rel="apple-touch-icon" href="/themes/default/apple-touch-icon.png">
  
  <!-- Theme color -->
  <meta name="theme-color" content="#dc2626">
</head>
<body>
  <!-- Your content -->
</body>
</html>
```

### Dynamic Theme Switching

```javascript
import { applyTheme, getAllFaviconPaths } from './config/themes';

// Switch to blue theme
applyTheme('blue');

// Get all favicon paths for a theme
const paths = getAllFaviconPaths('green');
console.log(paths.svg); // "/themes/green/favicon.svg"
```

## Performance Considerations

### File Sizes
- **SVG**: ~1-2KB (scalable, best quality)
- **PNG**: ~3-8KB (good compatibility)
- **WebP**: ~1-3KB (modern browsers, 60-80% smaller than PNG)
- **AVIF**: ~0.5-2KB (latest browsers, 70-90% smaller than PNG)

### Browser Support
- **SVG**: Modern browsers (Chrome 4+, Firefox 3+, Safari 4+)
- **PNG**: All browsers
- **WebP**: Chrome 23+, Firefox 65+, Safari 14+
- **AVIF**: Chrome 85+, Firefox 93+, Safari 16.1+

### Loading Strategy
1. Load SVG as primary favicon (fastest, scalable)
2. Use WebP/AVIF for modern browsers (smaller size)
3. Fall back to PNG for older browsers (best compatibility)

## Troubleshooting

### Common Issues

#### Favicons Not Generating
```bash
# Check if Sharp is installed
npm install sharp

# Check if output directory exists
mkdir -p public/themes
```

#### Theme Not Applying
```javascript
// Check if theme exists
import { THEMES } from './config/themes';
console.log(Object.keys(THEMES));

// Check localStorage
console.log(localStorage.getItem('preferred-theme'));
```

#### File Size Too Large
```bash
# Regenerate with different quality settings
# Edit scripts/generate-favicons.js and adjust quality values
```

### Debug Mode

Enable debug logging:
```javascript
// Add to your application
localStorage.setItem('debug-themes', 'true');
```

## Best Practices

1. **Always generate all formats** for maximum compatibility
2. **Use SVG as primary** for best quality and smallest size
3. **Test on multiple browsers** to ensure compatibility
4. **Cache favicons** to improve loading performance
5. **Provide fallbacks** for older browsers
6. **Use consistent naming** across all themes
7. **Document custom themes** for team members

## Migration from Legacy System

If you're migrating from the old favicon system:

1. **Backup existing favicons**:
   ```bash
   cp -r public/favicon* backup/
   ```

2. **Generate new theme-based favicons**:
   ```bash
   npm run generate:favicons:all
   ```

3. **Update HTML references**:
   ```html
   <!-- Old -->
   <link rel="icon" href="/favicon.svg">
   
   <!-- New -->
   <link rel="icon" href="/themes/default/favicon.svg">
   ```

4. **Test thoroughly** on all target browsers

## Future Enhancements

- [ ] **Automatic theme detection** based on user's system preferences
- [ ] **Custom theme builder** with color picker interface
- [ ] **Theme presets** for different seasons or events
- [ ] **Animation support** for SVG favicons
- [ ] **PWA manifest integration** with theme-specific icons
- [ ] **CDN integration** for faster favicon delivery

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the generated files in `public/themes/`
3. Check browser console for errors
4. Verify theme configuration in `src/config/themes.js`

---

*This guide covers the complete parameterized favicon generation system. For additional customization or advanced usage, refer to the source code in `scripts/generate-favicons.js` and `src/config/themes.js`.*
