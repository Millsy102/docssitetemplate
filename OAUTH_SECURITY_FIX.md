# OAuth Security Fix

## Issue Fixed
The GitHub OAuth client ID was previously hardcoded in `public/login.js`, which exposed the identifier to anyone who could view the client-side source code. This is a security vulnerability as it allows unauthorized access to OAuth configuration.

## Changes Made

### 1. Server-Side Security
- **New Endpoint**: `/api/auth/oauth-client-id` - Securely provides the OAuth client ID only to authenticated users
- **New Endpoint**: `/api/auth/configure-oauth` - Allows authenticated users to configure OAuth settings
- **Authentication Required**: Both endpoints require a valid JWT token

### 2. Client-Side Updates
- **Removed Hardcoded Values**: The `ghClientId` is no longer hardcoded in the client bundle
- **Secure Fetching**: Client ID is now fetched from the server using authenticated requests
- **JWT Token Management**: Added proper JWT token storage and management
- **Error Handling**: Improved error handling for OAuth operations

### 3. Environment Configuration
- **Environment Variables**: OAuth credentials are now stored as environment variables
- **Example Configuration**: Added `env.example` file with required variables
- **Security Best Practices**: Documented secure configuration practices

## Security Benefits

1. **No Client-Side Exposure**: OAuth client ID is no longer visible in client-side code
2. **Authentication Required**: Only authenticated users can access OAuth configuration
3. **Environment-Based**: Credentials are stored securely in environment variables
4. **JWT Protection**: All OAuth operations require valid authentication tokens

## Configuration Required

### Environment Variables
Set these environment variables securely (never commit them to version control):

```bash
# Required for authentication
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD=your-secure-password
JWT_SECRET=your-super-secret-jwt-key

# GitHub OAuth (set these securely)
GH_CLIENT_ID=your-github-oauth-client-id
GH_CLIENT_SECRET=your-github-oauth-client-secret
GH_REDIRECT_URI=https://your-domain.com/auth/callback
```

### GitHub OAuth App Setup
1. Go to GitHub Developer Settings
2. Create a new OAuth App
3. Set the callback URL to match your `GH_REDIRECT_URI`
4. Copy the Client ID and Client Secret to your environment variables

## Usage

1. **Initial Setup**: Admin logs in with username/password
2. **OAuth Configuration**: Admin configures GitHub OAuth credentials
3. **Secure Access**: Client ID is fetched securely when needed for OAuth flows
4. **Token Management**: JWT tokens handle authentication state

## Best Practices

1. **Never hardcode secrets** in client-side code
2. **Use environment variables** for all sensitive configuration
3. **Implement proper authentication** before exposing sensitive data
4. **Use HTTPS** in production to protect data in transit
5. **Rotate secrets regularly** for enhanced security
6. **Monitor access logs** for suspicious activity

## Migration Notes

- Existing OAuth configurations stored in localStorage will need to be reconfigured
- The new system requires proper environment variable setup
- Authentication flow now uses JWT tokens instead of simple localStorage flags
