# BeamFlow Environment Variables Reference

This document provides a comprehensive reference for all environment variables used in the BeamFlow system, organized by category and functionality.

## Table of Contents

1. [Application Settings](#application-settings)
2. [Site Configuration](#site-configuration)
3. [Database Configuration](#database-configuration)
4. [Authentication & Security](#authentication--security)
5. [GitHub Integration](#github-integration)
6. [Email Configuration](#email-configuration)
7. [File Upload Settings](#file-upload-settings)
8. [Rate Limiting Configuration](#rate-limiting-configuration)
9. [Cache Configuration](#cache-configuration)
10. [Performance & Monitoring](#performance--monitoring)
11. [Logging](#logging)
12. [AI Integration](#ai-integration)
13. [Unreal Engine Integration](#unreal-engine-integration)
14. [FTP Server Configuration](#ftp-server-configuration)
15. [SSH Server Configuration](#ssh-server-configuration)
16. [PC Link Service](#pc-link-service)
17. [Analytics & Tracking](#analytics--tracking)
18. [Deployment & Build](#deployment--build)
19. [Testing](#testing)
20. [Vercel Deployment](#vercel-deployment)

---

## Application Settings

### `NODE_ENV`
- **Type**: String
- **Default**: `development`
- **Values**: `development`, `production`, `test`
- **Description**: Node.js environment setting that affects behavior and configuration
- **Required**: Yes

### `PORT`
- **Type**: Number
- **Default**: `3000`
- **Description**: Port number for the server to listen on
- **Required**: Yes

### `HOST`
- **Type**: String
- **Default**: `localhost`
- **Description**: Host address for the server
- **Required**: No

---

## Site Configuration

### `SITE_TITLE`
- **Type**: String
- **Default**: None
- **Description**: The title of the documentation site
- **Required**: Yes (Frontend)

### `SITE_NAME`
- **Type**: String
- **Default**: `BeamFlow Documentation`
- **Description**: The name of the documentation site
- **Required**: No

### `SITE_DESCRIPTION`
- **Type**: String
- **Default**: None
- **Description**: The description of the documentation site
- **Required**: Yes (Frontend)

### `SITE_AUTHOR`
- **Type**: String
- **Default**: `BeamFlow Team`
- **Description**: The author of the documentation site
- **Required**: No

### `SITE_URL`
- **Type**: String
- **Default**: `https://yourusername.github.io/your-repo-name`
- **Description**: The base URL of the site (recommended for production)
- **Required**: No

---

## Database Configuration

### `DATABASE_URL`
- **Type**: String
- **Default**: `mongodb://localhost:27017/beamflow`
- **Description**: MongoDB connection URI
- **Required**: No

### `MONGODB_URI`
- **Type**: String
- **Default**: `mongodb://localhost:27017/beamflow`
- **Description**: MongoDB connection URI (alternative to DATABASE_URL)
- **Required**: No

### `REDIS_URL`
- **Type**: String
- **Default**: `redis://localhost:6379`
- **Description**: Redis connection URL for caching and rate limiting
- **Required**: No

### `REDIS_URI`
- **Type**: String
- **Default**: `redis://localhost:6379`
- **Description**: Redis connection URI (alternative to REDIS_URL)
- **Required**: No

---

## Authentication & Security

### `JWT_SECRET`
- **Type**: String
- **Default**: `your-super-secret-jwt-key`
- **Description**: Secret key for JWT token signing
- **Required**: No (but recommended for production)

### `BCRYPT_ROUNDS`
- **Type**: Number
- **Default**: `12`
- **Description**: Number of bcrypt rounds for password hashing
- **Required**: No

### `ADMIN_USERNAME`
- **Type**: String
- **Default**: `admin`
- **Description**: Admin username for authentication
- **Required**: No

### `ADMIN_PASSWORD`
- **Type**: String
- **Default**: None
- **Description**: Admin password for authentication
- **Required**: No

### `ADMIN_API_KEY`
- **Type**: String
- **Default**: None
- **Description**: API key for admin operations
- **Required**: No

### `SESSION_TIMEOUT`
- **Type**: Number
- **Default**: `3600000` (1 hour)
- **Description**: Session timeout in milliseconds
- **Required**: No

### `ALLOWED_ORIGINS`
- **Type**: String (comma-separated)
- **Default**: `http://localhost:3000`
- **Description**: Comma-separated list of allowed CORS origins
- **Required**: No

### `CORS_ORIGIN`
- **Type**: String
- **Default**: `http://localhost:3000`
- **Description**: CORS origin setting
- **Required**: No

---

## GitHub Integration

### `GH_CLIENT_ID`
- **Type**: String
- **Default**: None
- **Description**: GitHub OAuth client ID
- **Required**: No

### `GH_CLIENT_SECRET`
- **Type**: String
- **Default**: None
- **Description**: GitHub OAuth client secret
- **Required**: No

### `GH_TOKEN`
- **Type**: String
- **Default**: None
- **Description**: GitHub personal access token for deployment
- **Required**: No

### `REPOSITORY_NAME`
- **Type**: String
- **Default**: None
- **Description**: GitHub repository name
- **Required**: No

### `GH_PAGES_BRANCH`
- **Type**: String
- **Default**: `gh-pages`
- **Description**: GitHub Pages branch name
- **Required**: No

---

## Email Configuration

### `SMTP_HOST`
- **Type**: String
- **Default**: `smtp.gmail.com`
- **Description**: SMTP server hostname
- **Required**: No

### `SMTP_PORT`
- **Type**: Number
- **Default**: `587`
- **Description**: SMTP server port
- **Required**: No

### `SMTP_SECURE`
- **Type**: Boolean
- **Default**: `false`
- **Description**: Whether to use secure SMTP connection
- **Required**: No

### `SMTP_USER`
- **Type**: String
- **Default**: None
- **Description**: SMTP username
- **Required**: No

### `SMTP_PASS`
- **Type**: String
- **Default**: None
- **Description**: SMTP password
- **Required**: No

### `SMTP_FROM`
- **Type**: String
- **Default**: `noreply@beamflow.com`
- **Description**: From email address for SMTP
- **Required**: No

### `FROM_EMAIL`
- **Type**: String
- **Default**: `noreply@beamflow.com`
- **Description**: From email address (alternative to SMTP_FROM)
- **Required**: No

### `EMAIL_PROVIDER`
- **Type**: String
- **Default**: `smtp`
- **Values**: `smtp`, `sendgrid`, `mailgun`, `aws`
- **Description**: Email service provider
- **Required**: No

### `CLIENT_URL`
- **Type**: String
- **Default**: `http://localhost:3000`
- **Description**: Client URL for email links
- **Required**: No

---

## File Upload Settings

### `UPLOAD_PATH`
- **Type**: String
- **Default**: `./uploads`
- **Description**: Path for file uploads
- **Required**: No

### `MAX_FILE_SIZE`
- **Type**: Number
- **Default**: `104857600` (100MB)
- **Description**: Maximum file size in bytes
- **Required**: No

### `ALLOWED_FILE_TYPES`
- **Type**: String (comma-separated)
- **Default**: `image/jpeg,image/png,image/gif,application/pdf`
- **Description**: Comma-separated list of allowed MIME types
- **Required**: No

---

## Rate Limiting Configuration

### `RATE_LIMIT_WHITELIST`
- **Type**: String (comma-separated)
- **Default**: `127.0.0.1,::1`
- **Description**: Comma-separated list of IP addresses to whitelist
- **Required**: No

### `RATE_LIMIT_BLACKLIST`
- **Type**: String (comma-separated)
- **Default**: Empty
- **Description**: Comma-separated list of IP addresses to blacklist
- **Required**: No

### `RATE_LIMIT_LOGGING`
- **Type**: Boolean
- **Default**: `true`
- **Description**: Enable rate limiting logging
- **Required**: No

### `RATE_LIMIT_LOG_LEVEL`
- **Type**: String
- **Default**: `warn`
- **Description**: Log level for rate limiting
- **Required**: No

### `RATE_LIMIT_WINDOW_MS`
- **Type**: Number
- **Default**: `900000` (15 minutes)
- **Description**: Rate limiting window in milliseconds (legacy)
- **Required**: No

### `RATE_LIMIT_MAX_REQUESTS`
- **Type**: Number
- **Default**: `100`
- **Description**: Maximum requests per window (legacy)
- **Required**: No

---

## Cache Configuration

### `CACHE_MAX_SIZE`
- **Type**: Number
- **Default**: `1000`
- **Description**: Maximum number of cache entries
- **Required**: No

### `CACHE_TTL`
- **Type**: Number
- **Default**: `300000` (5 minutes)
- **Description**: Cache time-to-live in milliseconds
- **Required**: No

---

## Performance & Monitoring

### `SLOW_REQUEST_THRESHOLD`
- **Type**: Number
- **Default**: `1000` (1 second)
- **Description**: Threshold for slow request logging
- **Required**: No

### `MONITORING_INTERVAL`
- **Type**: Number
- **Default**: `30000` (30 seconds)
- **Description**: Monitoring interval in milliseconds
- **Required**: No

### `ENABLE_METRICS`
- **Type**: Boolean
- **Default**: `true`
- **Description**: Enable metrics collection
- **Required**: No

### `METRICS_PORT`
- **Type**: Number
- **Default**: `9090`
- **Description**: Port for metrics endpoint
- **Required**: No

### `HEALTH_CHECK_INTERVAL`
- **Type**: Number
- **Default**: `30000` (30 seconds)
- **Description**: Health check interval in milliseconds
- **Required**: No

---

## Logging

### `LOG_LEVEL`
- **Type**: String
- **Default**: `info`
- **Values**: `error`, `warn`, `info`, `debug`
- **Description**: Logging level
- **Required**: No

### `LOG_FILE`
- **Type**: String
- **Default**: `./logs/beamflow.log`
- **Description**: Log file path
- **Required**: No

---

## AI Integration

### `OPENAI_API_KEY`
- **Type**: String
- **Default**: None
- **Description**: OpenAI API key for AI features
- **Required**: No

### `AI_MODEL`
- **Type**: String
- **Default**: `gpt-3.5-turbo`
- **Description**: OpenAI model to use
- **Required**: No

### `AI_MAX_TOKENS`
- **Type**: Number
- **Default**: `1000`
- **Description**: Maximum tokens for AI responses
- **Required**: No

---

## Unreal Engine Integration

### `UNREAL_ENGINE_PATH`
- **Type**: String
- **Default**: `C:/Program Files/Epic Games/UE_5.3/Engine`
- **Description**: Path to Unreal Engine installation
- **Required**: No

### `UNREAL_PROJECT_PATH`
- **Type**: String
- **Default**: `C:/Users/YourUsername/Documents/Unreal Projects/YourProject`
- **Description**: Path to Unreal Engine project
- **Required**: No

### `UNREAL_PYTHON_PATH`
- **Type**: String
- **Default**: `C:/Program Files/Epic Games/UE_5.3/Engine/Binaries/ThirdParty/Python3/Win64/python.exe`
- **Description**: Path to Unreal Engine Python executable
- **Required**: No

### `UNREAL_REMOTE_CONTROL_PORT`
- **Type**: Number
- **Default**: `30010`
- **Description**: Unreal Engine Remote Control port
- **Required**: No

---

## FTP Server Configuration

### `FTP_ENABLED`
- **Type**: Boolean
- **Default**: `false`
- **Description**: Enable FTP server
- **Required**: No

### `FTP_PORT`
- **Type**: Number
- **Default**: `21`
- **Description**: FTP server port
- **Required**: No

### `FTP_PASV_URL`
- **Type**: String
- **Default**: `localhost`
- **Description**: FTP passive mode URL
- **Required**: No

### `FTP_TLS_ENABLED`
- **Type**: Boolean
- **Default**: `false`
- **Description**: Enable FTP TLS
- **Required**: No

### `FTP_TLS_KEY_PATH`
- **Type**: String
- **Default**: None
- **Description**: Path to FTP TLS private key
- **Required**: No

### `FTP_TLS_CERT_PATH`
- **Type**: String
- **Default**: None
- **Description**: Path to FTP TLS certificate
- **Required**: No

---

## SSH Server Configuration

### `SSH_ENABLED`
- **Type**: Boolean
- **Default**: `false`
- **Description**: Enable SSH server
- **Required**: No

### `SSH_PORT`
- **Type**: Number
- **Default**: `22`
- **Description**: SSH server port
- **Required**: No

### `SSH_HOST_KEY_PATH`
- **Type**: String
- **Default**: `./keys/host_key`
- **Description**: Path to SSH host key
- **Required**: No

---

## PC Link Service

### `BEAMFLOW_PC_LINK_API_KEY`
- **Type**: String
- **Default**: None
- **Description**: API key for PC Link service
- **Required**: No

---

## Analytics & Tracking

### `GA_MEASUREMENT_ID`
- **Type**: String
- **Default**: None
- **Description**: Google Analytics measurement ID
- **Required**: No

---

## Deployment & Build

### `BUILD_OUTPUT_DIR`
- **Type**: String
- **Default**: `dist`
- **Description**: Build output directory
- **Required**: No

---

## Testing

### `TEST_BASE_URL`
- **Type**: String
- **Default**: `http://localhost:3000`
- **Description**: Base URL for testing
- **Required**: No

### `TEST_DELAY`
- **Type**: Number
- **Default**: `100`
- **Description**: Delay between test requests in milliseconds
- **Required**: No

---

## Vercel Deployment

### `VERCEL`
- **Type**: String
- **Default**: `0`
- **Description**: Vercel deployment flag
- **Required**: No

---

## Environment File Locations

The system looks for `.env` files in the following order:

1. **Project root** (`.env`) - **Primary location for user configuration**
2. **System directory** (`_internal/system/.env`) - **Secondary location**
3. **Source directory** (`src/.env`) - **Tertiary location**

## Security Best Practices

1. **Change all default passwords and secrets** in production
2. **Use strong, unique passwords** for admin accounts
3. **Keep API keys secure** and never commit them to version control
4. **Use environment-specific .env files** (`.env.development`, `.env.production`)
5. **Regularly rotate secrets and API keys**
6. **Never commit .env files** to version control

## Quick Setup

1. Copy the appropriate example file:
   ```bash
   cp env.example .env
   ```

2. Edit the `.env` file with your specific configuration

3. For backend-only deployments:
   ```bash
   cp full-system-deploy/backend/env.example .env
   ```

## Validation

The system includes environment validation that will:
- Check for required variables
- Validate variable formats
- Provide helpful error messages
- Show warnings for missing recommended variables

Run the application to see validation results:
```bash
npm start
```
