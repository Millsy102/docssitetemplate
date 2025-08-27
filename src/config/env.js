// Environment configuration loader
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

  // Authentication Settings
  ADMIN_USERNAME: process.env.ADMIN_USERNAME,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  SESSION_SECRET: process.env.SESSION_SECRET,

  // Database Configuration
  DATABASE_URL: process.env.DATABASE_URL,
  REDIS_URL: process.env.REDIS_URL,

  // GitHub OAuth
  GH_CLIENT_ID: process.env.GH_CLIENT_ID || process.env.GITHUB_CLIENT_ID,
  GH_CLIENT_SECRET: process.env.GH_CLIENT_SECRET || process.env.GITHUB_CLIENT_SECRET,
  GH_CALLBACK_URL: process.env.GH_CALLBACK_URL || process.env.GITHUB_CALLBACK_URL,

  // Email Configuration
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseInt(process.env.SMTP_PORT) || 587,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM: process.env.SMTP_FROM,

  // File Upload Settings
  UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 10485760,
  ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES?.split(',') || ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],

  // Security Settings
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_FILE: process.env.LOG_FILE || './logs/beamflow.log',

  // FTP Server
  FTP_PORT: parseInt(process.env.FTP_PORT) || 21,
  FTP_USER: process.env.FTP_USER,
  FTP_PASS: process.env.FTP_PASS,

  // SSH Server
  SSH_PORT: parseInt(process.env.SSH_PORT) || 22,
  SSH_HOST_KEY_PATH: process.env.SSH_HOST_KEY_PATH,
  SSH_AUTHORIZED_KEYS_PATH: process.env.SSH_AUTHORIZED_KEYS_PATH,

  // AI Integration
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  AI_MODEL: process.env.AI_MODEL || 'gpt-3.5-turbo',
  AI_MAX_TOKENS: parseInt(process.env.AI_MAX_TOKENS) || 1000,

  // Monitoring
  ENABLE_METRICS: process.env.ENABLE_METRICS === 'true',
  METRICS_PORT: parseInt(process.env.METRICS_PORT) || 9090,
  HEALTH_CHECK_INTERVAL: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000,
};

// Validate required secrets
const requiredSecrets = [
  'ADMIN_USERNAME',
  'ADMIN_PASSWORD',
  'JWT_SECRET',
  'SESSION_SECRET'
];

// Optional secrets that are recommended for production
const recommendedSecrets = [
  'DATABASE_URL',
  'REDIS_URL',
  'GH_CLIENT_SECRET',
  'SMTP_PASS',
  'FTP_PASS',
  'OPENAI_API_KEY'
];

const missingRequired = requiredSecrets.filter(secret => !config[secret]);
const missingRecommended = recommendedSecrets.filter(secret => !config[secret]);

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

// Helper function to check if running in production
config.isProduction = () => config.NODE_ENV === 'production';
config.isDevelopment = () => config.NODE_ENV === 'development';
config.isTest = () => config.NODE_ENV === 'test';

module.exports = config;
