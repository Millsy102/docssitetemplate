# BeamFlow Full System Deployment

This package contains both the public documentation site and the hidden secret system.

##  Public Documentation Site
- **Location**: `public/` directory
- **Purpose**: Public-facing documentation for GitHub Pages
- **Access**: Open to everyone

##  Hidden Secret System
- **Location**: `secret/` directory  
- **Purpose**: Private admin dashboard, FTP/SSH servers, plugin system
- **Access**: Restricted with authentication

##  Backend System
- **Location**: `backend/` directory
- **Purpose**: Complete backend with all services
- **Features**: Express server, database, authentication, file management

##  Deployment Options

### 1. Vercel (Recommended)
```bash
# Deploy to Vercel
vercel --prod
```

### 2. GitHub Pages (Public Site Only)
```bash
# Deploy public site to GitHub Pages
npm run deploy:github-pages
```

### 3. Local Development
```bash
# Start both systems
npm run dev:full

# Start public site only
npm run dev

# Start secret system only  
npm run dev:backend
```

##  Secret System Access

### Admin Dashboard
- **URL**: `/admin`
- **Authentication**: Username/password required
- **Features**: System monitoring, user management, plugin management

### FTP Server
- **Port**: 21 (configurable)
- **Authentication**: Integrated with admin system
- **Features**: File upload/download, role-based access

### SSH Server  
- **Port**: 22 (configurable)
- **Authentication**: SSH key or password
- **Features**: Shell access, SFTP, command restrictions

### Plugin System
- **Location**: `backend/src/plugins/`
- **Management**: Via admin dashboard
- **Features**: Hot-reload, hook system, YAML manifests

##  Security Features

- **IP Whitelisting**: Restrict access by IP address
- **Session Management**: Secure session handling
- **Audit Logging**: Complete system audit trail
- **Rate Limiting**: Protection against abuse
- **Encryption**: Data encryption at rest and in transit

##  File Structure

```
full-system-deploy/
├── public/              # Public documentation site
│   ├── index.html
│   └── assets/
├── secret/              # Hidden secret system
│   ├── admin/
│   ├── ftp-root/
│   └── ssh-home/
├── backend/             # Backend source code
│   ├── src/
│   └── package.json
├── api.js               # Vercel entry point
└── vercel.json          # Vercel configuration
```

##  Configuration

### Environment Variables
```env
NODE_ENV=production
PORT=3000
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD=your-secure-password
ADMIN_TOKEN=your-secret-token
DATABASE_URL=your-database-url
REDIS_URL=your-redis-url
JWT_SECRET=your-jwt-secret
```

### Admin Access
- **Default Username**: Set via ADMIN_USERNAME env var
- **Default Password**: Set via ADMIN_PASSWORD env var
- **Secret Token**: Set via ADMIN_TOKEN env var

##  Security Notice

 **IMPORTANT**: This system contains sensitive functionality. Ensure:
- Strong passwords are used
- Environment variables are properly secured
- Access is restricted to authorized users only
- Regular security audits are performed

##  Support

For issues or questions about the secret system, refer to the private documentation in `_internal/system/`.

---

**Remember**: The public site is a facade. The real system is hidden in the secret directory.
