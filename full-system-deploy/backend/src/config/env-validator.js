const path = require('path');
const fs = require('fs');

// Environment validation configuration for backend
const envValidationRules = [
  // Required variables for backend
  {
    name: 'NODE_ENV',
    required: true,
    description: 'Node.js environment (development, production, test)',
    validator: (value) => ['development', 'production', 'test'].includes(value)
  },
  {
    name: 'PORT',
    required: true,
    description: 'Server port number',
    validator: (value) => !isNaN(parseInt(value)) && parseInt(value) > 0
  },
  
  // Optional but recommended variables
  {
    name: 'MONGODB_URI',
    required: false,
    description: 'MongoDB connection URI (optional, uses default if not set)'
  },
  {
    name: 'REDIS_URI',
    required: false,
    description: 'Redis connection URI (optional, uses default if not set)'
  },
  {
    name: 'JWT_SECRET',
    required: false,
    description: 'JWT secret key (optional, uses default if not set)'
  },
  {
    name: 'ADMIN_USERNAME',
    required: false,
    description: 'Admin username for authentication (optional)'
  },
  {
    name: 'ADMIN_PASSWORD',
    required: false,
    description: 'Admin password for authentication (optional)'
  },
  {
    name: 'GH_CLIENT_ID',
    required: false,
    description: 'GitHub OAuth client ID (optional)'
  },
  {
    name: 'GH_CLIENT_SECRET',
    required: false,
    description: 'GitHub OAuth client secret (optional)'
  }
];

/**
 * Load environment variables from .env files
 */
const loadEnvFiles = () => {
  const envPaths = [
    path.join(process.cwd(), '.env'),
    path.join(process.cwd(), '_internal', 'system', '.env'),
    path.join(process.cwd(), 'src', '.env'),
    path.join(process.cwd(), '..', '.env'),
    path.join(process.cwd(), '..', '..', '.env')
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

/**
 * Validate environment variables against rules
 */
const validateEnvironment = () => {
  const missingRequired = [];
  const missingRecommended = [];
  const invalidValues = [];

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
const enforceEnvironmentValidation = () => {
  // Load environment files first
  loadEnvFiles();
  
  // Validate environment
  const validation = validateEnvironment();
  
  // Display results
  console.log('\n🔍 Backend Environment Variable Validation:');
  console.log('===========================================');
  
  if (validation.missingRequired.length > 0) {
    console.error('\n❌ Missing required environment variables:');
    validation.missingRequired.forEach(variable => {
      const rule = envValidationRules.find(r => r.name === variable);
      console.error(`   • ${variable}${rule?.description ? ` - ${rule.description}` : ''}`);
    });
    console.error('\n💡 Please set these variables in your .env file');
    console.error('   Backend server cannot start without required environment variables.');
    console.error('\n📝 Example .env file:');
    console.error('   NODE_ENV=development');
    console.error('   PORT=3000');
    process.exit(1);
  }
  
  if (validation.missingRecommended.length > 0) {
    console.warn('\n⚠️  Missing recommended environment variables:');
    validation.missingRecommended.forEach(variable => {
      const rule = envValidationRules.find(r => r.name === variable);
      console.warn(`   • ${variable}${rule?.description ? ` - ${rule.description}` : ''}`);
    });
    console.warn('   These are optional but recommended for production use');
  }
  
  if (validation.invalidValues.length > 0) {
    console.error('\n❌ Invalid environment variable values:');
    validation.invalidValues.forEach(variable => {
      console.error(`   • ${variable} - Value does not meet validation requirements`);
    });
    process.exit(1);
  }
  
  if (validation.isValid) {
    console.log('✅ All required environment variables are properly configured');
    if (validation.missingRecommended.length === 0) {
      console.log('✅ All recommended environment variables are configured');
    }
  }
  
  console.log('===========================================\n');
};

/**
 * Get environment variable with validation
 */
const getEnvVar = (name, defaultValue) => {
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
const getBooleanEnvVar = (name, defaultValue = false) => {
  const value = process.env[name];
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
};

/**
 * Get integer environment variable
 */
const getIntegerEnvVar = (name, defaultValue) => {
  const value = process.env[name];
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

module.exports = {
  enforceEnvironmentValidation,
  getEnvVar,
  getBooleanEnvVar,
  getIntegerEnvVar,
  validateEnvironment,
  envValidationRules
};
