# Vercel Deployment Guide

This document explains the Vercel deployment configuration for the BeamFlow documentation site.

## Configuration Files

### vercel.json
The main Vercel configuration file that defines:
- Serverless function settings
- Routing rules
- Environment variables

### api/index.js
A serverless function entry point that imports and exports the Express app from `_internal/system/src/vercel-server.js`.

### _internal/system/src/vercel-server.js
A Vercel-compatible version of the main server that:
- Exports an Express app instead of starting a server
- Skips private services (FTP, SSH) in Vercel environment
- Handles database connections conditionally
- Provides basic API endpoints

## Deployment Process

1. **Environment Setup**: Ensure all required environment variables are configured in Vercel dashboard
2. **Database Configuration**: Set up external database (MongoDB, PostgreSQL) and configure connection strings
3. **Build Process**: Vercel will automatically install dependencies and deploy the serverless function
4. **Routing**: All requests are routed through the API function to the Express app

## Environment Variables

Required environment variables for Vercel deployment:

```bash
NODE_ENV=production
DATABASE_URL=your_database_connection_string
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password
GH_CLIENT_ID=your_github_oauth_client_id
GH_CLIENT_SECRET=your_github_oauth_client_secret
```

## Features Available in Vercel

-  Basic API endpoints
-  Authentication system
-  File upload/download
-  User management
-  Admin dashboard
-  Health checks and metrics
-  FTP server (not available in serverless)
-  SSH server (not available in serverless)
-  Real-time WebSocket connections (limited in serverless)

## Troubleshooting

### Common Issues

1. **Missing Dependencies**: Ensure all dependencies are listed in package.json
2. **Database Connection**: Verify database connection strings and network access
3. **File Upload Limits**: Vercel has limits on request body size (10MB default)
4. **Function Timeout**: API functions have a maximum execution time (30 seconds configured)

### Debugging

- Check Vercel function logs in the dashboard
- Use the `/health` endpoint to verify system status
- Monitor function execution times and memory usage

## Local Development

To test the Vercel configuration locally:

```bash
npm install
npm run dev
```

The development server will use the same Vercel-compatible server file.
