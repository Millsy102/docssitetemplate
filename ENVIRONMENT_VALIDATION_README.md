# Environment Variable Validation System

This document explains the environment variable validation system implemented in the BeamFlow documentation site.

## Overview

The environment validation system ensures that required environment variables are properly configured before the application starts. If required variables are missing, the application will halt execution with a clear error message.

## How It Works

### Frontend (React/TypeScript)

The frontend validation is handled by `src/config/env-validator.ts` and integrated into `src/config/env.ts`.

**Key Features:**
- Validates required variables before application startup
- Provides clear error messages with descriptions
- Shows warnings for missing recommended variables
- Validates variable values (e.g., URLs must start with 'http')
- Halts execution with `process.exit(1)` if required variables are missing

### Backend (Node.js)

The backend validation is handled by `full-system-deploy/backend/src/config/env-validator.js` and integrated into the main server.

**Key Features:**
- Validates required variables before server startup
- Provides clear error messages with descriptions
- Shows warnings for missing recommended variables
- Validates variable values (e.g., PORT must be a positive number)
- Halts execution with `process.exit(1)` if required variables are missing

## Required Variables

### Frontend Required Variables
- `SITE_TITLE` - The title of the documentation site
- `SITE_DESCRIPTION` - The description of the documentation site

### Backend Required Variables
- `NODE_ENV` - Node.js environment (development, production, test)
- `PORT` - Server port number (must be a positive integer)

## Recommended Variables

### Frontend Recommended Variables
- `SITE_URL` - The base URL of the site (recommended for production)
- `GA_MEASUREMENT_ID` - Google Analytics measurement ID (optional)
- `GH_TOKEN` - GitHub token for deployment (optional)
- `REPOSITORY_NAME` - GitHub repository name (optional)

### Backend Recommended Variables
- `MONGODB_URI` - MongoDB connection URI (optional, uses default if not set)
- `REDIS_URI` - Redis connection URI (optional, uses default if not set)
- `JWT_SECRET` - JWT secret key (optional, uses default if not set)
- `ADMIN_USERNAME` - Admin username for authentication (optional)
- `ADMIN_PASSWORD` - Admin password for authentication (optional)
- `GH_CLIENT_ID` - GitHub OAuth client ID (optional)
- `GH_CLIENT_SECRET` - GitHub OAuth client secret (optional)

## Usage

### Setting Up Environment Variables

1. Copy the example file:
   ```bash
   cp env.example .env
   ```

2. Edit the `.env` file and set the required variables:
   ```bash
   # Required variables
   SITE_TITLE=Your Documentation Site
   SITE_DESCRIPTION=Description of your documentation
   
   # Recommended variables
   SITE_URL=https://yourusername.github.io/your-repo-name
   GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

### Running the Application

When you start the application, the validation system will automatically run:

```bash
# Frontend
npm run dev

# Backend
cd full-system-deploy/backend
npm start
```

### Example Output

**Success:**
```
🔍 Environment Variable Validation:
=====================================
✅ All required environment variables are properly configured
✅ All recommended environment variables are configured
=====================================
```

**Missing Required Variables:**
```
🔍 Environment Variable Validation:
=====================================

❌ Missing required environment variables:
   • SITE_TITLE - The title of the documentation site
   • SITE_DESCRIPTION - The description of the documentation site

💡 Please set these variables in your .env file
   Application cannot start without required environment variables.

📝 Example .env file:
   SITE_TITLE=Your Documentation Site
   SITE_DESCRIPTION=Description of your documentation
```

**Missing Recommended Variables:**
```
🔍 Environment Variable Validation:
=====================================

⚠️  Missing recommended environment variables:
   • SITE_URL - The base URL of the site (recommended for production)
   • GA_MEASUREMENT_ID - Google Analytics measurement ID (optional)
   These are optional but recommended for production use

✅ All required environment variables are properly configured
=====================================
```

## Validation Functions

### Frontend (TypeScript)

```typescript
import { 
  enforceEnvironmentValidation, 
  getEnvVar, 
  getBooleanEnvVar, 
  getIntegerEnvVar 
} from './src/config/env-validator';

// Enforce validation (will exit if required variables are missing)
enforceEnvironmentValidation();

// Get environment variables with validation
const siteTitle = getEnvVar('SITE_TITLE'); // Throws error if not set
const port = getIntegerEnvVar('PORT', 3000); // Uses default if not set
const enableAnalytics = getBooleanEnvVar('ENABLE_ANALYTICS', false);
```

### Backend (JavaScript)

```javascript
const { 
  enforceEnvironmentValidation, 
  getEnvVar, 
  getBooleanEnvVar, 
  getIntegerEnvVar 
} = require('./config/env-validator');

// Enforce validation (will exit if required variables are missing)
enforceEnvironmentValidation();

// Get environment variables with validation
const nodeEnv = getEnvVar('NODE_ENV', 'development');
const port = getIntegerEnvVar('PORT', 3000);
const isProduction = getBooleanEnvVar('IS_PRODUCTION', false);
```

## Adding New Variables

### Frontend

1. Add the variable to `envValidationRules` in `src/config/env-validator.ts`:
   ```typescript
   {
     name: 'NEW_VARIABLE',
     required: true, // or false for optional
     description: 'Description of the variable',
     validator: (value) => value && value.length > 0 // optional validation function
   }
   ```

2. Use the variable in `src/config/env.ts`:
   ```typescript
   NEW_VARIABLE: getEnvVar('NEW_VARIABLE', 'default-value'),
   ```

### Backend

1. Add the variable to `envValidationRules` in `full-system-deploy/backend/src/config/env-validator.js`:
   ```javascript
   {
     name: 'NEW_VARIABLE',
     required: true, // or false for optional
     description: 'Description of the variable',
     validator: (value) => value && value.length > 0 // optional validation function
   }
   ```

2. Use the variable in your server code:
   ```javascript
   const newVariable = getEnvVar('NEW_VARIABLE', 'default-value');
   ```

## Best Practices

1. **Always validate required variables** - Use the validation system for any critical configuration
2. **Provide clear descriptions** - Help users understand what each variable does
3. **Use sensible defaults** - Provide defaults for optional variables
4. **Validate values** - Use validator functions to ensure values meet requirements
5. **Keep sensitive data secure** - Never commit `.env` files to version control
6. **Document all variables** - Keep the example file updated with all variables

## Troubleshooting

### Common Issues

1. **Application exits immediately**
   - Check that all required variables are set in your `.env` file
   - Verify variable names match exactly (case-sensitive)

2. **Validation warnings**
   - These are informational and won't prevent the application from starting
   - Consider setting recommended variables for production use

3. **Invalid values**
   - Check that values meet validation requirements (e.g., URLs start with 'http')
   - Ensure numeric values are valid numbers

### Debug Mode

To see more detailed validation information, you can temporarily modify the validation functions to log additional details or run in debug mode.

## Security Notes

- Never commit `.env` files containing sensitive information
- Use environment-specific `.env` files (`.env.development`, `.env.production`)
- Rotate secrets and tokens regularly
- Use strong, unique values for secrets and passwords
