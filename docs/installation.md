# Installation Guide

This guide provides detailed instructions for installing and configuring Beam Website System, including the public/private access pattern setup.

## 📋 Prerequisites

Before installing Beam Website System, ensure you have:

### System Requirements
- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (or yarn)
- **Database**: PostgreSQL 12+, MySQL 8+, or SQLite 3
- **Git**: For version control
- **Memory**: Minimum 2GB RAM (4GB recommended)
- **Storage**: At least 1GB free space

### Development Tools
- **Code Editor**: VS Code, Sublime Text, or similar
- **Terminal**: Command line interface
- **Browser**: Modern browser for testing

## 🚀 Installation Methods

### Method 1: Quick Install (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-username/beam-website.git
cd beam-website

# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

### Method 2: Manual Installation

```bash
# Create project directory
mkdir beam-website
cd beam-website

# Initialize git repository
git init

# Initialize npm project
npm init -y

# Install dependencies
npm install express react react-dom react-router-dom
npm install @beam/components @beam/plugins
npm install --save-dev nodemon webpack

# Create directory structure
mkdir -p src/{components,pages,routes,middleware,utils,styles}
mkdir -p public/{assets,images}
mkdir -p docs admin-docs
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in your project root:

```env
# Server Configuration
NODE_ENV=development
PORT=3000
HOST=localhost

# Database Configuration
DATABASE_URL=postgresql://localhost/beam_website
DATABASE_TYPE=postgresql
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=beam_website
DATABASE_USER=beam_user
DATABASE_PASSWORD=secure_password

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
SESSION_SECRET=your-session-secret-key

# GitHub OAuth (Optional)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_REDIRECT_URI=http://localhost:3000/auth/github/callback

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Redis Configuration (Optional)
REDIS_URL=redis://localhost:6379

# Logging
LOG_LEVEL=info
LOG_FILE=logs/beam-website.log

# Security
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX=100

# File Upload
MAX_FILE_SIZE=10MB
UPLOAD_PATH=uploads/

# Plugin System
PLUGIN_PATH=plugins/
PLUGIN_AUTO_LOAD=true
```

### Database Setup

#### PostgreSQL (Recommended)

```bash
# Install PostgreSQL
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS
brew install postgresql

# Windows
# Download from https://www.postgresql.org/download/windows/

# Create database and user
sudo -u postgres psql

CREATE DATABASE beam_website;
CREATE USER beam_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE beam_website TO beam_user;
\q
```

#### MySQL

```bash
# Install MySQL
# Ubuntu/Debian
sudo apt-get install mysql-server

# macOS
brew install mysql

# Create database and user
mysql -u root -p

CREATE DATABASE beam_website;
CREATE USER 'beam_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON beam_website.* TO 'beam_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### SQLite (Development Only)

```bash
# SQLite is included with Node.js
# No additional installation required
# Database file will be created automatically
```

### Authentication Setup

#### GitHub OAuth Configuration

1. **Create GitHub OAuth App**
   - Go to GitHub Settings > Developer settings > OAuth Apps
   - Click "New OAuth App"
   - Fill in the details:
     - Application name: "Beam Website System"
     - Homepage URL: `http://localhost:3000`
     - Authorization callback URL: `http://localhost:3000/auth/github/callback`
   - Click "Register application"
   - Copy the Client ID and Client Secret

2. **Update Environment Variables**
   ```env
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   ```

#### Traditional Authentication

For username/password authentication, ensure these environment variables are set:

```env
JWT_SECRET=your-super-secret-jwt-key-here
SESSION_SECRET=your-session-secret-key
```

## 🔐 Access Control Configuration

### Public/Private Access Pattern Setup

Configure the access control system in your `src/config/access-control.js`:

```javascript
const accessControlConfig = {
  // Public site configuration (template site)
  public: {
    routes: [
      '/',
      '/about',
      '/features',
      '/contact',
      '/docs/public',
      '/docs/getting-started',
      '/docs/installation',
      '/docs/examples',
      '/docs/faq'
    ],
    content: [
      'getting-started',
      'installation',
      'examples',
      'faq'
    ],
    features: [
      'demo',
      'showcase',
      'basic-search'
    ],
    api: [
      '/api/health',
      '/api/public/content',
      '/api/public/search'
    ]
  },

  // Private site configuration (real site)
  private: {
    routes: [
      '/dashboard',
      '/docs',
      '/plugins',
      '/admin',
      '/settings'
    ],
    content: [
      'all'
    ],
    features: [
      'all'
    ],
    api: [
      '/api/*'
    ],
    requireAuth: true
  },

  // Admin configuration
  admin: {
    routes: [
      '/admin/*'
    ],
    content: [
      'all'
    ],
    features: [
      'all'
    ],
    api: [
      '/api/admin/*'
    ],
    requireRole: 'admin'
  }
};

module.exports = accessControlConfig;
```

### Role-Based Access Control

Define user roles and permissions:

```javascript
const rolePermissions = {
  public: {
    description: 'Public users (no authentication)',
    permissions: [
      'read:public-content',
      'read:public-docs',
      'use:demo-features'
    ]
  },
  user: {
    description: 'Authenticated users',
    permissions: [
      'read:all-content',
      'read:all-docs',
      'use:all-features',
      'manage:own-profile',
      'install:plugins'
    ]
  },
  moderator: {
    description: 'Content moderators',
    permissions: [
      'read:all-content',
      'write:content',
      'moderate:comments',
      'manage:users'
    ]
  },
  admin: {
    description: 'System administrators',
    permissions: [
      'all'
    ]
  }
};
```

## 🧩 Plugin System Setup

### Plugin Directory Structure

```bash
# Create plugin directories
mkdir -p plugins/installed
mkdir -p plugins/available
mkdir -p plugins/cache

# Set permissions
chmod 755 plugins/
chmod 755 plugins/installed/
```

### Plugin Configuration

```javascript
// src/config/plugins.js
const pluginConfig = {
  // Plugin directories
  directories: {
    installed: './plugins/installed',
    available: './plugins/available',
    cache: './plugins/cache'
  },

  // Plugin settings
  settings: {
    autoLoad: true,
    autoUpdate: false,
    sandboxMode: true,
    maxPlugins: 50
  },

  // Plugin permissions
  permissions: {
    fileSystem: ['read', 'write'],
    network: ['http', 'https'],
    database: ['read', 'write'],
    system: ['limited']
  }
};

module.exports = pluginConfig;
```

## 🎨 Component System Setup

### Install Beam Components

```bash
# Install component library
npm install @beam/components

# Install design system
npm install @beam/design-system
```

### Configure Component System

```javascript
// src/config/components.js
const componentConfig = {
  // Component library settings
  library: {
    theme: 'default',
    locale: 'en',
    rtl: false
  },

  // Design system settings
  designSystem: {
    colors: {
      primary: '#3b82f6',
      secondary: '#6b7280',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    },
    fonts: {
      primary: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, monospace'
    },
    spacing: {
      unit: 4
    }
  }
};

module.exports = componentConfig;
```

## 📊 Database Migration

### Run Initial Migrations

```bash
# Run database migrations
npm run db:migrate

# Seed initial data
npm run db:seed

# Verify database setup
npm run db:verify
```

### Migration Commands

```bash
# Create new migration
npm run db:migrate:create -- --name create_users_table

# Run specific migration
npm run db:migrate:up -- --name 001_create_users_table

# Rollback migration
npm run db:migrate:down -- --name 001_create_users_table

# Reset database
npm run db:reset

# Check migration status
npm run db:migrate:status
```

## 🔍 Verification

### Test Installation

```bash
# Run tests
npm test

# Run linting
npm run lint

# Check build
npm run build

# Start development server
npm run dev
```

### Verify Access Control

1. **Test Public Access**
   - Visit `http://localhost:3000`
   - Verify template site is displayed
   - Check that limited content is available

2. **Test Authentication**
   - Visit `http://localhost:3000/login`
   - Test login functionality
   - Verify redirect to dashboard

3. **Test Private Access**
   - After login, verify full site access
   - Check that all features are available
   - Test plugin management

4. **Test Admin Access**
   - Login as admin user
   - Verify admin panel access
   - Test user management features

## 🚀 Production Deployment

### Build for Production

```bash
# Install production dependencies
npm ci --only=production

# Build frontend assets
npm run build

# Run database migrations
npm run db:migrate

# Start production server
npm start
```

### Production Environment Variables

```env
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Production database
DATABASE_URL=postgresql://user:pass@host:port/database

# Production secrets
JWT_SECRET=your-production-jwt-secret
SESSION_SECRET=your-production-session-secret

# Production OAuth
GITHUB_CLIENT_ID=your-production-github-client-id
GITHUB_CLIENT_SECRET=your-production-github-client-secret
GITHUB_REDIRECT_URI=https://yourdomain.com/auth/github/callback

# Security
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_MAX=1000

# Logging
LOG_LEVEL=warn
LOG_FILE=/var/log/beam-website.log
```

### Process Management

```bash
# Using PM2
npm install -g pm2
pm2 start ecosystem.config.js

# Using Docker
docker build -t beam-website .
docker run -p 3000:3000 beam-website
```

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   ```bash
   # Check database status
   sudo systemctl status postgresql
   
   # Test connection
   psql -h localhost -U beam_user -d beam_website
   ```

2. **Port Already in Use**
   ```bash
   # Find process using port
   lsof -i :3000
   
   # Kill process
   kill -9 <PID>
   ```

3. **Permission Errors**
   ```bash
   # Fix file permissions
   chmod -R 755 .
   chown -R $USER:$USER .
   ```

4. **Node.js Version Issues**
   ```bash
   # Check Node.js version
   node --version
   
   # Use nvm to switch versions
   nvm use 18
   ```

### Debug Mode

```bash
# Enable debug logging
export DEBUG=beam:*
export NODE_ENV=development

# Start with debug
npm run dev:debug
```

## 📚 Next Steps

After successful installation:

1. **Configure Access Control**: Set up public/private access patterns
2. **Install Plugins**: Add functionality through the plugin system
3. **Customize Components**: Modify the design system for your needs
4. **Set Up Monitoring**: Configure logging and analytics
5. **Deploy to Production**: Follow production deployment guide

## 🆘 Getting Help

- **Documentation**: Check the comprehensive documentation
- **GitHub Issues**: Report bugs and request features
- **Community Forum**: Ask questions and share solutions
- **Email Support**: Contact support for technical issues

---

**Installation complete!** Your Beam Website System is now ready with the public/private access pattern configured.
