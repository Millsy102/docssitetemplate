# BeamFlow Full System - Complete Documentation

## 🎯 Overview

This project contains **TWO COMPLETE SYSTEMS**:

1. **📖 Public Documentation Site** - A facade for GitHub Pages
2. **🔒 Hidden Secret System** - Complete admin dashboard with FTP/SSH servers

## 🏗️ System Architecture

```
docssitetemplate/
├── 📖 Public Site (Facade)
│   ├── src/                    # React frontend
│   ├── dist/                   # Built public site
│   └── docs/                   # Public documentation
├── 🔒 Secret System (Hidden)
│   └── _internal/system/       # Complete backend + admin dashboard
│       ├── src/                # Backend source code
│       ├── dist/               # Built secret system
│       ├── ftp-root/           # FTP server files
│       ├── ssh-home/           # SSH user directories
│       └── plugins/            # Plugin system
└── 🚀 Deployment
    ├── api/                    # Vercel entry point
    ├── scripts/                # Build and deploy scripts
    └── full-system-deploy/     # Complete deployment package
```

## 🚀 Quick Start

### Development Mode (Both Systems)

```bash
# Start both public site and secret system
npm run dev:full

# Start only public site
npm run dev

# Start only secret system
npm run dev:backend
```

### Production Build

```bash
# Build complete system (public + secret)
npm run build:secret

# Build only public site
npm run build

# Build only secret system
npm run build:backend
```

## 📖 Public Documentation Site

### Purpose
- **Facade for GitHub Pages** - Makes the project look legitimate
- **Public Documentation** - Basic documentation for the "BeamFlow" plugin
- **SEO Friendly** - Optimized for search engines

### Features
- React-based documentation site
- Responsive design with Tailwind CSS
- GitHub Pages deployment ready
- Basic navigation and pages

### Access
- **Local**: `http://localhost:3000`
- **Production**: `https://yourusername.github.io/repo-name/`

## 🔒 Hidden Secret System

### Purpose
- **Complete Admin Dashboard** - Full system management
- **FTP/SSH Servers** - File transfer and shell access
- **Plugin System** - Extensible functionality
- **User Management** - Complete user system

### Features

#### 🎛️ Admin Dashboard
- **System Monitoring** - Real-time metrics and health checks
- **User Management** - Create, update, delete users
- **Plugin Management** - Install, enable, disable plugins
- **Service Control** - Start/stop FTP and SSH servers
- **Security Auditing** - Complete audit trail
- **Cache Management** - Advanced caching controls

#### 📁 FTP Server
- **Secure File Transfer** - Full FTP server with authentication
- **Role-based Access** - Different permissions for admin vs regular users
- **TLS Support** - Optional encryption for secure transfers
- **File Management** - Upload, download, delete, organize files
- **Directory Structure** - Organized folders for uploads, downloads, plugins, backups

#### 🔐 SSH Server
- **Secure Shell Access** - Full SSH server with shell and SFTP support
- **User Authentication** - Integrated with existing BeamAuth system
- **Command Restrictions** - Security controls for non-admin users
- **SFTP Support** - Secure file transfer over SSH
- **User Home Directories** - Isolated user environments

#### 🔌 Plugin System
- **Dynamic Loading** - Hot-reload plugins without server restart
- **Hook System** - 15+ available hooks for system integration
- **YAML Manifests** - Structured plugin configuration
- **Permission System** - Granular access controls
- **Plugin Management** - Install, enable, disable, uninstall via admin panel

### Access Points

#### Admin Dashboard
- **URL**: `/admin`
- **Authentication**: Username/password required
- **Default Credentials**: Set via environment variables

#### FTP Server
- **Port**: 21 (configurable)
- **Authentication**: Integrated with admin system
- **Access**: `ftp://your-domain.com`

#### SSH Server
- **Port**: 22 (configurable)
- **Authentication**: SSH key or password
- **Access**: `ssh://your-domain.com`

#### API Endpoints
- **Health Check**: `/api/health`
- **Admin API**: `/api/admin` (requires Bearer token)
- **Documentation API**: `/api/docs`

## 🛡️ Security Features

### Authentication & Authorization
- **Multi-factor Authentication** - Enhanced security
- **Session Management** - Secure session handling
- **Role-based Access Control** - Granular permissions
- **IP Whitelisting** - Restrict access by IP address

### Data Protection
- **Encryption at Rest** - Database and file encryption
- **Encryption in Transit** - TLS/SSL for all communications
- **Audit Logging** - Complete system audit trail
- **Rate Limiting** - Protection against abuse

### System Security
- **Input Validation** - Comprehensive input sanitization
- **SQL Injection Protection** - Parameterized queries
- **XSS Protection** - Cross-site scripting prevention
- **CSRF Protection** - Cross-site request forgery protection

## 📦 Deployment Options

### 1. Vercel (Recommended - Full System)
```bash
# Deploy complete system to Vercel
npm run deploy:vercel

# Or manually
npm run build:secret
vercel --prod
```

**Features**:
- ✅ Public documentation site
- ✅ Hidden admin dashboard
- ✅ FTP/SSH servers (via serverless functions)
- ✅ Plugin system
- ✅ Complete backend API

### 2. GitHub Pages (Public Site Only)
```bash
# Deploy only public site to GitHub Pages
npm run deploy:github-pages
```

**Features**:
- ✅ Public documentation site only
- ❌ No secret system (GitHub Pages is static only)

### 3. Local Development
```bash
# Start complete system locally
npm run dev:full

# Start only public site
npm run dev

# Start only secret system
npm run dev:backend
```

## 🔧 Configuration

### Environment Variables

```env
# Basic Configuration
NODE_ENV=production
PORT=3000

# Admin Authentication
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD=your-secure-password
ADMIN_TOKEN=your-secret-token

# Database Configuration
DATABASE_URL=your-database-url
REDIS_URL=your-redis-url

# Security
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret

# FTP Server
FTP_PORT=21
FTP_HOST=your-domain.com

# SSH Server
SSH_PORT=22
SSH_HOST=your-domain.com

# Plugin System
PLUGIN_DIR=./plugins
PLUGIN_AUTO_RELOAD=true
```

### Configuration Files

#### Admin Panel Configuration
```json
{
  "admin": {
    "dashboard": {
      "enabled": true,
      "port": 3000,
      "path": "/admin"
    },
    "security": {
      "sessionTimeout": 3600,
      "maxLoginAttempts": 5,
      "lockoutDuration": 900
    }
  }
}
```

#### FTP Server Configuration
```json
{
  "ftp": {
    "enabled": true,
    "port": 21,
    "host": "0.0.0.0",
    "tls": {
      "enabled": true,
      "cert": "./certs/ftp-cert.pem",
      "key": "./certs/ftp-key.pem"
    }
  }
}
```

#### SSH Server Configuration
```json
{
  "ssh": {
    "enabled": true,
    "port": 22,
    "host": "0.0.0.0",
    "keys": {
      "hostKey": "./keys/host-key",
      "authorizedKeys": "./keys/authorized_keys"
    }
  }
}
```

## 📁 File Structure

### Public Site Structure
```
src/
├── components/          # React components
├── pages/              # Page components
├── config/             # Configuration
└── main.tsx           # Entry point
```

### Secret System Structure
```
_internal/system/
├── src/
│   ├── server.js              # Main server
│   ├── vercel-server.js       # Vercel entry point
│   ├── ftp-server.js          # FTP server
│   ├── ssh-server.js          # SSH server
│   ├── admin/                 # Admin dashboard
│   ├── plugins/               # Plugin system
│   ├── middleware/            # Express middleware
│   ├── services/              # Business logic
│   ├── database/              # Database models
│   └── utils/                 # Utilities
├── ftp-root/                  # FTP file storage
├── ssh-home/                  # SSH user directories
├── plugins/                   # Plugin storage
└── keys/                      # SSH keys
```

## 🚨 Security Notice

⚠️ **CRITICAL SECURITY INFORMATION**:

1. **Keep Secret System Private**
   - The `_internal/system/` directory contains sensitive functionality
   - Never commit this to public repositories
   - Use `.gitignore` to exclude sensitive files

2. **Strong Authentication**
   - Use strong, unique passwords
   - Enable multi-factor authentication
   - Regularly rotate access tokens

3. **Network Security**
   - Use HTTPS/TLS for all communications
   - Implement IP whitelisting
   - Monitor access logs regularly

4. **Data Protection**
   - Encrypt sensitive data at rest
   - Use secure database connections
   - Implement proper backup procedures

## 🔍 Monitoring & Logging

### System Monitoring
- **Health Checks**: `/api/health`
- **Metrics**: `/api/metrics`
- **Status**: `/api/status`

### Audit Logging
- **Access Logs**: All login attempts and access
- **Action Logs**: All admin actions and changes
- **Error Logs**: System errors and exceptions
- **Security Logs**: Security-related events

### Performance Monitoring
- **Response Times**: API response time tracking
- **Resource Usage**: CPU, memory, disk usage
- **Error Rates**: Error frequency and types
- **User Activity**: User engagement metrics

## 🆘 Troubleshooting

### Common Issues

#### Public Site Issues
```bash
# Clear cache and rebuild
rm -rf dist node_modules
npm install
npm run build
```

#### Secret System Issues
```bash
# Check system status
cd _internal/system
npm run status

# Restart services
npm run restart

# Check logs
tail -f logs/system.log
```

#### Deployment Issues
```bash
# Verify build
npm run build:secret

# Check deployment package
ls -la full-system-deploy/

# Test locally
cd full-system-deploy
./start.sh
```

### Support

For issues with:
- **Public Site**: Check GitHub Pages documentation
- **Secret System**: Refer to `_internal/system/README.md`
- **Deployment**: Check deployment logs and configuration

## 📞 Contact & Support

- **Public Documentation**: GitHub Pages site
- **Secret System**: Private documentation in `_internal/system/`
- **Issues**: GitHub Issues (for public site only)
- **Security**: Private communication channels only

---

**Remember**: The public site is a facade. The real system is hidden in the secret directory. Keep it secure! 🔒
