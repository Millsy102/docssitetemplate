// Environment configuration loader for static documentation site
const path = require('path');
const fs = require('fs');

// Load environment variables from .env files
const loadEnvFiles = () => {
  const envPaths = [
    path.join(process.cwd(), '.env'),
    path.join(process.cwd(), '_internal', 'system', '.env'),
    path.join(process.cwd(), 'src', '.env')
  ];

  // Try to load dotenv if available
  try {
    const dotenv = require('dotenv');
    
    // Load from multiple possible locations
    for (const envPath of envPaths) {
      if (fs.existsSync(envPath)) {
        const result = dotenv.config({ path: envPath });
        if (result.error) {
          console.warn(`Warning: Error loading .env file from ${envPath}:`, result.error.message);
        } else {
          console.log(`Loaded environment variables from: ${envPath}`);
          break; // Use the first valid .env file found
        }
      }
    }
  } catch (error) {
    console.warn('Warning: dotenv package not available, using system environment variables only');
  }
};

// Load environment files
loadEnvFiles();

const config = {
  // Application Settings
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT) || 3000,
  HOST: process.env.HOST || 'localhost',

  // Site Configuration
  SITE_TITLE: process.env.SITE_TITLE || 'Unreal Engine Plugin Documentation',
  SITE_DESCRIPTION: process.env.SITE_DESCRIPTION || 'Documentation for Unreal Engine Plugin',
  SITE_URL: process.env.SITE_URL || 'https://your-domain.com',

  // Analytics Configuration
  GA_MEASUREMENT_ID: process.env.GA_MEASUREMENT_ID,
  ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS === 'true',

  // GitHub Pages Deployment
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  REPOSITORY_NAME: process.env.REPOSITORY_NAME,
  GITHUB_PAGES_BRANCH: process.env.GITHUB_PAGES_BRANCH || 'gh-pages',

  // Build Configuration
  BUILD_OUTPUT_DIR: process.env.BUILD_OUTPUT_DIR || 'dist',
  ENABLE_SERVICE_WORKER: process.env.ENABLE_SERVICE_WORKER === 'true',
  ENABLE_PWA: process.env.ENABLE_PWA === 'true',

  // Development Settings
  ENABLE_HOT_RELOAD: process.env.ENABLE_HOT_RELOAD !== 'false',
  ENABLE_SOURCE_MAPS: process.env.ENABLE_SOURCE_MAPS !== 'false',

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  ENABLE_DEBUG_LOGGING: process.env.ENABLE_DEBUG_LOGGING === 'true',
};

// Validate required variables for static site
const requiredVariables = [
  'SITE_TITLE',
  'SITE_DESCRIPTION'
];

// Optional but recommended variables
const recommendedVariables = [
  'GA_MEASUREMENT_ID',
  'GITHUB_TOKEN',
  'SITE_URL'
];

const missingRequired = requiredVariables.filter(variable => !config[variable]);
const missingRecommended = recommendedVariables.filter(variable => !config[variable]);

if (missingRequired.length > 0) {
  console.error('❌ Missing required environment variables:', missingRequired);
  console.error('Please set these variables in your .env file');
}

if (missingRecommended.length > 0) {
  console.warn('⚠️  Missing recommended environment variables:', missingRecommended);
  console.warn('These are optional but recommended for production use');
}

if (missingRequired.length === 0 && missingRecommended.length === 0) {
  console.log('✅ All environment variables are properly configured');
}

// Helper functions
config.isProduction = () => config.NODE_ENV === 'production';
config.isDevelopment = () => config.NODE_ENV === 'development';
config.isTest = () => config.NODE_ENV === 'test';

module.exports = config;
