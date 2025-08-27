// Environment configuration loader
const config = {
  // Application Settings
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
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
  GH_CLIENT_ID: process.env.GH_CLIENT_ID,
  GH_CLIENT_SECRET: process.env.GH_CLIENT_SECRET,
  GH_CALLBACK_URL: process.env.GH_CALLBACK_URL,

  // Email Configuration
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM: process.env.SMTP_FROM,

  // File Upload Settings
  UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || 10485760,
  ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES?.split(',') || ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],

  // Security Settings
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || 900000,
  RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS || 100,

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_FILE: process.env.LOG_FILE || './logs/beamflow.log',

  // FTP Server
  FTP_PORT: process.env.FTP_PORT || 21,
  FTP_USER: process.env.FTP_USER,
  FTP_PASS: process.env.FTP_PASS,

  // SSH Server
  SSH_PORT: process.env.SSH_PORT || 22,
  SSH_HOST_KEY_PATH: process.env.SSH_HOST_KEY_PATH,
  SSH_AUTHORIZED_KEYS_PATH: process.env.SSH_AUTHORIZED_KEYS_PATH,

  // AI Integration
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  AI_MODEL: process.env.AI_MODEL || 'gpt-3.5-turbo',
  AI_MAX_TOKENS: process.env.AI_MAX_TOKENS || 1000,

  // Monitoring
  ENABLE_METRICS: process.env.ENABLE_METRICS === 'true',
  METRICS_PORT: process.env.METRICS_PORT || 9090,
  HEALTH_CHECK_INTERVAL: process.env.HEALTH_CHECK_INTERVAL || 30000,
};

// Validate required secrets
const requiredSecrets = [
  'ADMIN_PASSWORD',
  'JWT_SECRET',
  'SESSION_SECRET',
  'DATABASE_URL',
  'REDIS_URL',
  'GH_CLIENT_SECRET',
  'SMTP_PASS',
  'FTP_PASS',
  'OPENAI_API_KEY'
];

const missingSecrets = requiredSecrets.filter(secret => !config[secret]);

if (missingSecrets.length > 0) {
  console.warn('Missing required secrets:', missingSecrets);
}

module.exports = config;
