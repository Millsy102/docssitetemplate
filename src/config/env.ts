import { 
  enforceEnvironmentValidation, 
  getEnvVar, 
  getBooleanEnvVar, 
  getIntegerEnvVar 
} from './env-validator';

// Environment configuration interface
interface EnvironmentConfig {
  // Application Settings
  NODE_ENV: string;
  PORT: number;
  HOST: string;

  // Site Configuration
  SITE_TITLE: string;
  SITE_DESCRIPTION: string;
  SITE_URL: string;

  // Analytics Configuration
  GA_MEASUREMENT_ID?: string;
  ENABLE_ANALYTICS: boolean;

  // GitHub Pages Deployment
  GH_TOKEN?: string;
  REPOSITORY_NAME?: string;
  GH_PAGES_BRANCH: string;

  // Build Configuration
  BUILD_OUTPUT_DIR: string;
  ENABLE_SERVICE_WORKER: boolean;
  ENABLE_PWA: boolean;

  // Development Settings
  ENABLE_HOT_RELOAD: boolean;
  ENABLE_SOURCE_MAPS: boolean;

  // Logging
  LOG_LEVEL: string;
  ENABLE_DEBUG_LOGGING: boolean;

  // Helper methods
  isProduction(): boolean;
  isDevelopment(): boolean;
  isTest(): boolean;
}

// Enforce environment validation before creating config
enforceEnvironmentValidation();

// Create configuration object with proper typing
const config: EnvironmentConfig = {
  // Application Settings
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  PORT: getIntegerEnvVar('PORT', 3000),
  HOST: getEnvVar('HOST', 'localhost'),

  // Site Configuration
  SITE_TITLE: getEnvVar('SITE_TITLE'),
  SITE_DESCRIPTION: getEnvVar('SITE_DESCRIPTION'),
  SITE_URL: getEnvVar('SITE_URL', 'https://your-domain.com'),

  // Analytics Configuration
  GA_MEASUREMENT_ID: process.env.GA_MEASUREMENT_ID,
  ENABLE_ANALYTICS: getBooleanEnvVar('ENABLE_ANALYTICS', false),

  // GitHub Pages Deployment
  GH_TOKEN: process.env.GH_TOKEN,
  REPOSITORY_NAME: process.env.REPOSITORY_NAME,
  GH_PAGES_BRANCH: getEnvVar('GH_PAGES_BRANCH', 'gh-pages'),

  // Build Configuration
  BUILD_OUTPUT_DIR: getEnvVar('BUILD_OUTPUT_DIR', 'dist'),
  ENABLE_SERVICE_WORKER: getBooleanEnvVar('ENABLE_SERVICE_WORKER', false),
  ENABLE_PWA: getBooleanEnvVar('ENABLE_PWA', false),

  // Development Settings
  ENABLE_HOT_RELOAD: getBooleanEnvVar('ENABLE_HOT_RELOAD', true),
  ENABLE_SOURCE_MAPS: getBooleanEnvVar('ENABLE_SOURCE_MAPS', true),

  // Logging
  LOG_LEVEL: getEnvVar('LOG_LEVEL', 'info'),
  ENABLE_DEBUG_LOGGING: getBooleanEnvVar('ENABLE_DEBUG_LOGGING', false),

  // Helper methods
  isProduction(): boolean {
    return this.NODE_ENV === 'production';
  },

  isDevelopment(): boolean {
    return this.NODE_ENV === 'development';
  },

  isTest(): boolean {
    return this.NODE_ENV === 'test';
  }
};

// Environment validation is now handled by enforceEnvironmentValidation() above

export default config;
