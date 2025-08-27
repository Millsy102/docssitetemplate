import React, { useState, useEffect } from 'react';
import {
  THEMES,
  applyTheme,
  getPreferredTheme,
  getAllThemes,
} from '../config/themes';

interface ThemeSwitcherProps {
  className?: string;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dropdown' | 'buttons' | 'grid';
}

/**
 * Theme Switcher Component
 *
 * Allows users to switch between different theme variants.
 * Supports dropdown, button grid, and individual button layouts.
 */
const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  className = '',
  showLabels = true,
  size = 'md',
  variant = 'dropdown',
}) => {
  const [currentTheme, setCurrentTheme] = useState(getPreferredTheme());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Apply theme on component mount
    applyTheme(currentTheme);
  }, [currentTheme]);

  const handleThemeChange = (themeKey: string) => {
    setCurrentTheme(themeKey);
    applyTheme(themeKey);
    setIsOpen(false);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm px-2 py-1';
      case 'lg':
        return 'text-lg px-4 py-2';
      default:
        return 'text-base px-3 py-2';
    }
  };

  const getThemeButtonClasses = (themeKey: string) => {
    const baseClasses =
      'rounded-lg border-2 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2';
    const sizeClasses = getSizeClasses();

    if (themeKey === currentTheme) {
      return `${baseClasses} ${sizeClasses} border-gray-400 ring-2 ring-offset-2 ring-gray-400`;
    }

    return `${baseClasses} ${sizeClasses} border-gray-300 hover:border-gray-400 focus:ring-gray-400`;
  };

  const renderThemeButton = (themeKey: string, theme: any) => {
    const colors = theme.colors;

    return (
      <button
        key={themeKey}
        onClick={() => handleThemeChange(themeKey)}
        className={getThemeButtonClasses(themeKey)}
        title={theme.description}
        style={{
          backgroundColor: colors.background,
          color: colors.text,
        }}
      >
        <div className='flex items-center space-x-2'>
          {/* Theme preview icon */}
          <div
            className='w-4 h-4 rounded border'
            style={{
              backgroundColor: colors.primary,
              borderColor: colors.stroke,
            }}
          />

          {showLabels && <span className='font-medium'>{theme.name}</span>}
        </div>
      </button>
    );
  };

  const renderDropdown = () => {
    const currentThemeData = THEMES[currentTheme];

    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center space-x-2 ${getSizeClasses()} bg-gray-800 text-white rounded-lg border border-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500`}
        >
          <div
            className='w-4 h-4 rounded border'
            style={{
              backgroundColor: currentThemeData.colors.primary,
              borderColor: currentThemeData.colors.stroke,
            }}
          />
          {showLabels && (
            <>
              <span className='font-medium'>{currentThemeData.name}</span>
              <svg
                className='w-4 h-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 9l-7 7-7-7'
                />
              </svg>
            </>
          )}
        </button>

        {isOpen && (
          <div className='absolute top-full left-0 mt-1 w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50'>
            <div className='p-2 space-y-1'>
              {Object.entries(THEMES).map(([themeKey, theme]) => (
                <button
                  key={themeKey}
                  onClick={() => handleThemeChange(themeKey)}
                  className={`w-full flex items-center space-x-2 ${getSizeClasses()} rounded text-left hover:bg-gray-700 focus:outline-none focus:bg-gray-700 ${
                    themeKey === currentTheme ? 'bg-gray-700' : ''
                  }`}
                  style={{ color: theme.colors.text }}
                >
                  <div
                    className='w-4 h-4 rounded border flex-shrink-0'
                    style={{
                      backgroundColor: theme.colors.primary,
                      borderColor: theme.colors.stroke,
                    }}
                  />
                  <div className='flex-1'>
                    <div className='font-medium'>{theme.name}</div>
                    <div className='text-xs opacity-75'>
                      {theme.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderButtons = () => {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {Object.entries(THEMES).map(([themeKey, theme]) =>
          renderThemeButton(themeKey, theme)
        )}
      </div>
    );
  };

  const renderGrid = () => {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 ${className}`}>
        {Object.entries(THEMES).map(([themeKey, theme]) => (
          <button
            key={themeKey}
            onClick={() => handleThemeChange(themeKey)}
            className={`${getThemeButtonClasses(themeKey)} flex flex-col items-center space-y-2`}
            title={theme.description}
            style={{
              backgroundColor: theme.colors.background,
              color: theme.colors.text,
            }}
          >
            {/* Theme preview icon */}
            <div
              className='w-8 h-8 rounded border-2'
              style={{
                backgroundColor: theme.colors.primary,
                borderColor: theme.colors.stroke,
              }}
            />

            {showLabels && (
              <div className='text-center'>
                <div className='font-medium text-sm'>{theme.name}</div>
                <div className='text-xs opacity-75'>{theme.description}</div>
              </div>
            )}
          </button>
        ))}
      </div>
    );
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && !(event.target as Element).closest('.theme-switcher')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  switch (variant) {
    case 'dropdown':
      return renderDropdown();
    case 'buttons':
      return renderButtons();
    case 'grid':
      return renderGrid();
    default:
      return renderDropdown();
  }
};

export default ThemeSwitcher;
