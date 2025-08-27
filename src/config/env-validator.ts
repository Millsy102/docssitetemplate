import path from 'path';
import fs from 'fs';
import { log } from '../utils/logger';

// Environment validation interface
interface EnvValidationRule {
  name: string;
  required: boolean;
  description?: string;
  validator?: (value: string | undefined) => boolean;
  defaultValue?: string;
}

// Environment validation configuration
const envValidationRules: EnvValidationRule[] = [
  // Required variables
  {
    name: 'SITE_TITLE',
    required: true,
    description: 'The title of the documentation site'
  },
  {
    name: 'SITE_DESCRIPTION',
    required: true,
    description: 'The description of the documentation site'
  },
  
  // Optional but recommended variables
  {
    name: 'SITE_URL',
    required: false,
    description: 'The base URL of the site (recommended for production)',
    validator: (value) => !value || value.startsWith('http')
  },
  {
    name: 'GA_MEASUREMENT_ID',
    required: false,
    description: 'Google Analytics measurement ID (optional)'
  },
  {
    name: 'GH_TOKEN',
    required: false,
    description: 'GitHub token for deployment (optional)'
  },
  {
    name: 'REPOSITORY_NAME',
    required: false,
    description: 'GitHub repository name (optional)'
  }
];

/**
 * Load environment variables from .env files
 */
const loadEnvFiles = (): void => {
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
          log.warn(`Warning: Error loading .env file from ${envPath}: ${result.error.message}`);
        } else {
          log.info(`Loaded environment variables from: ${envPath}`);
          break; // Use the first valid .env file found
        }
      }
    }
  } catch (error) {
    log.warn('Warning: dotenv package not available, using system environment variables only');
  }
};

/**
 * Validate environment variables against rules
 */
const validateEnvironment = (): { isValid: boolean; missingRequired: string[]; missingRecommended: string[]; invalidValues: string[] } => {
  const missingRequired: string[] = [];
  const missingRecommended: string[] = [];
  const invalidValues: string[] = [];

  for (const rule of envValidationRules) {
    const value = process.env[rule.name];
    
    // Check if required variable is missing
    if (rule.required && !value) {
      missingRequired.push(rule.name);
      continue;
    }
    
    // Check if recommended variable is missing
    if (!rule.required && !value) {
      missingRecommended.push(rule.name);
      continue;
    }
    
    // Validate value if validator is provided
    if (value && rule.validator && !rule.validator(value)) {
      invalidValues.push(rule.name);
    }
  }

  return {
    isValid: missingRequired.length === 0 && invalidValues.length === 0,
    missingRequired,
    missingRecommended,
    invalidValues
  };
};

/**
 * Display validation results and exit if required variables are missing
 */
const enforceEnvironmentValidation = (): void => {
  // Load environment files first
  loadEnvFiles();
  
  // Validate environment
  const validation = validateEnvironment();
  
  // Display results
  log.info('\n Environment Variable Validation:');
  log.info('=====================================');
  
  if (validation.missingRequired.length > 0) {
    log.error('\n Missing required environment variables:');
    validation.missingRequired.forEach(variable => {
      const rule = envValidationRules.find(r => r.name === variable);
      log.error(`   • ${variable}${rule?.description ? ` - ${rule.description}` : ''}`);
    });
    log.error('\n Please set these variables in your .env file');
    log.error('   Application cannot start without required environment variables.');
    log.error('\n Example .env file:');
    log.error('   SITE_TITLE=Your Documentation Site');
    log.error('   SITE_DESCRIPTION=Description of your documentation');
    process.exit(1);
  }
  
  if (validation.missingRecommended.length > 0) {
    log.warn('\n  Missing recommended environment variables:');
    validation.missingRecommended.forEach(variable => {
      const rule = envValidationRules.find(r => r.name === variable);
      log.warn(`   • ${variable}${rule?.description ? ` - ${rule.description}` : ''}`);
    });
    log.warn('   These are optional but recommended for production use');
  }
  
  if (validation.invalidValues.length > 0) {
    log.error('\n Invalid environment variable values:');
    validation.invalidValues.forEach(variable => {
      log.error(`   • ${variable} - Value does not meet validation requirements`);
    });
    process.exit(1);
  }
  
  if (validation.isValid) {
    log.info(' All required environment variables are properly configured');
    if (validation.missingRecommended.length === 0) {
      log.info(' All recommended environment variables are configured');
    }
  }
  
  log.info('=====================================\n');
};

/**
 * Get environment variable with validation
 */
const getEnvVar = (name: string, defaultValue?: string): string => {
  const value = process.env[name];
  if (!value && defaultValue !== undefined) {
    return defaultValue;
  }
  if (!value) {
    throw new Error(`Environment variable ${name} is required but not set`);
  }
  return value;
};

/**
 * Get boolean environment variable
 */
const getBooleanEnvVar = (name: string, defaultValue: boolean = false): boolean => {
  const value = process.env[name];
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
};

/**
 * Get integer environment variable
 */
const getIntegerEnvVar = (name: string, defaultValue: number): number => {
  const value = process.env[name];
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

export {
  enforceEnvironmentValidation,
  getEnvVar,
  getBooleanEnvVar,
  getIntegerEnvVar,
  validateEnvironment,
  envValidationRules
};
