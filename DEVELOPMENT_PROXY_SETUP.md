# Development Proxy Setup Guide

This guide explains how to set up the development environment with API proxy for seamless frontend-backend communication during development.

## Overview

The development setup includes:
- **Frontend**: Vite dev server running on port 3000
- **Backend**: Express API server running on port 3001
- **Proxy**: Vite proxy configuration that forwards API requests from frontend to backend

## Quick Start

### 1. Start Both Frontend and Backend

```bash
# Start both frontend and backend with proxy
npm run dev:full

# Or start them separately:
npm run dev              # Frontend only (port 3000)
npm run dev:backend:env  # Backend only (port 3001)
```

### 2. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Admin Dashboard**: http://localhost:3000/admin (proxied to backend)

## Proxy Configuration

The Vite development server is configured with the following proxy rules:

### API Endpoints
- `/api/*` → `http://localhost:3001/api/*`
- `/admin/*` → `http://localhost:3001/admin/*`
- `/upload/*` → `http://localhost:3001/upload/*`
- `/health/*` → `http://localhost:3001/health/*`

### WebSocket Support
- `/socket.io/*` → `http://localhost:3001/socket.io/*` (WebSocket enabled)

## Development Environment Variables

### Backend Configuration (`_internal/system/dev.env`)
```env
NODE_ENV=development
PORT=3001
HOST=localhost

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
CORS_ORIGIN=http://localhost:3000

# Development credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### Frontend Configuration
The frontend automatically uses the proxy configuration in `vite.config.ts`.

## API Usage in Frontend

### Making API Calls

```javascript
// These requests will be automatically proxied to the backend
const response = await fetch('/api/users');
const data = await response.json();

// File uploads
const formData = new FormData();
formData.append('file', file);
await fetch('/upload/files', {
  method: 'POST',
  body: formData
});

// Admin endpoints
await fetch('/admin/dashboard', {
  headers: {
    'Authorization': 'Bearer your-token'
  }
});
```

### WebSocket Connections

```javascript
// WebSocket connections are also proxied
const socket = io('/socket.io', {
  transports: ['websocket', 'polling']
});
```

## Troubleshooting

### Port Conflicts
If you encounter port conflicts:

1. **Check if ports are in use**:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   netstat -ano | findstr :3001
   
   # Linux/Mac
   lsof -i :3000
   lsof -i :3001
   ```

2. **Kill processes using the ports**:
   ```bash
   # Windows
   taskkill /PID <PID> /F
   
   # Linux/Mac
   kill -9 <PID>
   ```

### Proxy Not Working
1. Ensure the backend is running on port 3001
2. Check that the Vite dev server is running on port 3000
3. Verify the proxy configuration in `vite.config.ts`
4. Check browser console for CORS errors

### Backend Not Starting
1. Ensure all dependencies are installed:
   ```bash
   cd _internal/system
   npm install
   ```

2. Check if required services are running:
   - MongoDB (if using database features)
   - Redis (if using caching)

3. Use the development environment:
   ```bash
   npm run dev:backend:env
   ```

## Development Workflow

### 1. Start Development Environment
```bash
npm run dev:full
```

### 2. Make Changes
- Frontend changes: Edit files in `src/`
- Backend changes: Edit files in `_internal/system/src/`

### 3. Hot Reload
- Frontend: Changes are automatically reflected
- Backend: Nodemon automatically restarts the server

### 4. Testing API Endpoints
```bash
# Test API directly
curl http://localhost:3001/api/health

# Test through proxy
curl http://localhost:3000/api/health
```

## Production vs Development

### Development
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- Proxy: Enabled in Vite config
- Hot reload: Enabled

### Production
- Frontend and backend are served from the same origin
- No proxy needed
- Static files served by Express
- Optimized builds

## Environment-Specific Configurations

### Development
- Uses `dev.env` for backend configuration
- Proxy enabled in Vite
- Debug logging enabled
- More lenient rate limiting

### Production
- Uses production environment variables
- No proxy (same-origin requests)
- Optimized logging
- Strict rate limiting

## Security Considerations

### Development
- Admin credentials: `admin/admin123`
- JWT secret: Development-only key
- CORS: Allows localhost origins
- Rate limiting: More lenient

### Production
- Strong admin credentials required
- Secure JWT secret
- Restricted CORS origins
- Strict rate limiting

## Next Steps

1. **Database Setup**: Configure MongoDB/Redis for full functionality
2. **Authentication**: Set up proper admin credentials
3. **File Uploads**: Configure upload directories
4. **Monitoring**: Set up logging and monitoring
5. **Testing**: Write tests for API endpoints

## Support

For issues with the development setup:
1. Check the troubleshooting section above
2. Review the proxy configuration in `vite.config.ts`
3. Verify environment variables are set correctly
4. Check that all required services are running
