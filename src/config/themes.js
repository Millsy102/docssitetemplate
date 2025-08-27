/**
 * Theme Configuration for BeamFlow Documentation Site
 *
 * This file defines all available themes and their color schemes.
 * Themes can be used for favicons, UI components, and styling.
 */

export const THEMES = {
  default: {
    name: 'Default',
    description: 'Red and black theme (current)',
    colors: {
      primary: '#dc2626',
      primaryDark: '#991b1b',
      background: '#111827',
      accent: '#ffffff',
      stroke: '#dc2626',
      // Additional colors for UI components
      text: '#ffffff',
      textSecondary: '#9ca3af',
      border: '#374151',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
    // Tailwind color classes
    tailwind: {
      primary: 'text-red-600',
      primaryBg: 'bg-red-600',
      primaryBorder: 'border-red-600',
      background: 'bg-gray-900',
      text: 'text-white',
      textSecondary: 'text-gray-400',
    },
  },
  dark: {
    name: 'Dark',
    description: 'Dark theme with red accents',
    colors: {
      primary: '#dc2626',
      primaryDark: '#991b1b',
      background: '#000000',
      accent: '#ffffff',
      stroke: '#dc2626',
      text: '#ffffff',
      textSecondary: '#9ca3af',
      border: '#374151',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
    tailwind: {
      primary: 'text-red-600',
      primaryBg: 'bg-red-600',
      primaryBorder: 'border-red-600',
      background: 'bg-black',
      text: 'text-white',
      textSecondary: 'text-gray-400',
    },
  },
  light: {
    name: 'Light',
    description: 'Light theme with red accents',
    colors: {
      primary: '#dc2626',
      primaryDark: '#991b1b',
      background: '#ffffff',
      accent: '#000000',
      stroke: '#dc2626',
      text: '#000000',
      textSecondary: '#6b7280',
      border: '#d1d5db',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
    tailwind: {
      primary: 'text-red-600',
      primaryBg: 'bg-red-600',
      primaryBorder: 'border-red-600',
      background: 'bg-white',
      text: 'text-black',
      textSecondary: 'text-gray-600',
    },
  },
  blue: {
    name: 'Blue',
    description: 'Blue theme variant',
    colors: {
      primary: '#3b82f6',
      primaryDark: '#1d4ed8',
      background: '#111827',
      accent: '#ffffff',
      stroke: '#3b82f6',
      text: '#ffffff',
      textSecondary: '#9ca3af',
      border: '#374151',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
    tailwind: {
      primary: 'text-blue-500',
      primaryBg: 'bg-blue-500',
      primaryBorder: 'border-blue-500',
      background: 'bg-gray-900',
      text: 'text-white',
      textSecondary: 'text-gray-400',
    },
  },
  green: {
    name: 'Green',
    description: 'Green theme variant',
    colors: {
      primary: '#10b981',
      primaryDark: '#059669',
      background: '#111827',
      accent: '#ffffff',
      stroke: '#10b981',
      text: '#ffffff',
      textSecondary: '#9ca3af',
      border: '#374151',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
    tailwind: {
      primary: 'text-green-500',
      primaryBg: 'bg-green-500',
      primaryBorder: 'border-green-500',
      background: 'bg-gray-900',
      text: 'text-white',
      textSecondary: 'text-gray-400',
    },
  },
  purple: {
    name: 'Purple',
    description: 'Purple theme variant',
    colors: {
      primary: '#8b5cf6',
      primaryDark: '#7c3aed',
      background: '#111827',
      accent: '#ffffff',
      stroke: '#8b5cf6',
      text: '#ffffff',
      textSecondary: '#9ca3af',
      border: '#374151',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
    tailwind: {
      primary: 'text-purple-500',
      primaryBg: 'bg-purple-500',
      primaryBorder: 'border-purple-500',
      background: 'bg-gray-900',
      text: 'text-white',
      textSecondary: 'text-gray-400',
    },
  },
};

/**
 * Get the current theme
 * @param {string} themeKey - The theme key to get
 * @returns {Object} The theme configuration
 */
export function getTheme(themeKey = 'default') {
  return THEMES[themeKey] || THEMES.default;
}

/**
 * Get all available themes
 * @returns {Object} All theme configurations
 */
export function getAllThemes() {
  return THEMES;
}

/**
 * Get theme colors
 * @param {string} themeKey - The theme key to get colors for
 * @returns {Object} The theme colors
 */
export function getThemeColors(themeKey = 'default') {
  const theme = getTheme(themeKey);
  return theme.colors;
}

/**
 * Get theme Tailwind classes
 * @param {string} themeKey - The theme key to get Tailwind classes for
 * @returns {Object} The theme Tailwind classes
 */
export function getThemeTailwind(themeKey = 'default') {
  const theme = getTheme(themeKey);
  return theme.tailwind;
}

/**
 * Get favicon path for a theme
 * @param {string} themeKey - The theme key
 * @param {string} format - The favicon format (svg, png, webp, avif)
 * @param {string} size - The favicon size (16x16, 32x32, etc.)
 * @returns {string} The favicon path
 */
export function getFaviconPath(
  themeKey = 'default',
  format = 'svg',
  size = ''
) {
  const basePath = `/themes/${themeKey}`;

  if (format === 'svg') {
    return `${basePath}/favicon.svg`;
  }

  if (size) {
    return `${basePath}/favicon-${size}.${format}`;
  }

  return `${basePath}/favicon.${format}`;
}

/**
 * Get all favicon paths for a theme
 * @param {string} themeKey - The theme key
 * @returns {Object} Object containing all favicon paths
 */
export function getAllFaviconPaths(themeKey = 'default') {
  const basePath = `/themes/${themeKey}`;

  return {
    svg: `${basePath}/favicon.svg`,
    ico: `${basePath}/favicon.ico`,
    png16: `${basePath}/favicon-16x16.png`,
    png32: `${basePath}/favicon-32x32.png`,
    appleTouch: `${basePath}/apple-touch-icon.png`,
    android192: `${basePath}/android-chrome-192x192.png`,
    android512: `${basePath}/android-chrome-512x512.png`,
    webp16: `${basePath}/favicon-16x16.webp`,
    webp32: `${basePath}/favicon-32x32.webp`,
    avif16: `${basePath}/favicon-16x16.avif`,
    avif32: `${basePath}/favicon-32x32.avif`,
  };
}

/**
 * Generate CSS custom properties for a theme
 * @param {string} themeKey - The theme key
 * @returns {string} CSS custom properties string
 */
export function generateThemeCSS(themeKey = 'default') {
  const colors = getThemeColors(themeKey);

  return `
    :root {
      --color-primary: ${colors.primary};
      --color-primary-dark: ${colors.primaryDark};
      --color-background: ${colors.background};
      --color-accent: ${colors.accent};
      --color-stroke: ${colors.stroke};
      --color-text: ${colors.text};
      --color-text-secondary: ${colors.textSecondary};
      --color-border: ${colors.border};
      --color-success: ${colors.success};
      --color-warning: ${colors.warning};
      --color-error: ${colors.error};
      --color-info: ${colors.info};
    }
  `;
}

/**
 * Apply theme to document
 * @param {string} themeKey - The theme key to apply
 */
export function applyTheme(themeKey = 'default') {
  const theme = getTheme(themeKey);
  const faviconPaths = getAllFaviconPaths(themeKey);

  // Update favicon
  const faviconLink = document.querySelector('link[rel="icon"]');
  if (faviconLink) {
    faviconLink.href = faviconPaths.svg;
  }

  // Update theme color meta tag
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (themeColorMeta) {
    themeColorMeta.content = theme.colors.primary;
  }

  // Apply CSS custom properties
  const style = document.createElement('style');
  style.textContent = generateThemeCSS(themeKey);
  document.head.appendChild(style);

  // Store theme preference
  localStorage.setItem('preferred-theme', themeKey);
}

/**
 * Get user's preferred theme
 * @returns {string} The preferred theme key
 */
export function getPreferredTheme() {
  return localStorage.getItem('preferred-theme') || 'default';
}

/**
 * Initialize theme on page load
 */
export function initializeTheme() {
  const preferredTheme = getPreferredTheme();
  applyTheme(preferredTheme);
}

// Default export
export default THEMES;
