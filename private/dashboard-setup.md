# Admin Dashboard Setup

**PRIVATE DOCUMENTATION - FOR YOUR USE ONLY**

This document explains how to set up and configure your real admin dashboard system.

## 🎯 Overview

Your admin dashboard is a private system that gives you full control over your application. It's completely separate from the public-facing DataFlow documentation facade.

## 🚀 Installation

### Prerequisites

- Node.js 16+
- PostgreSQL 12+
- Redis 6+
- Your admin credentials

### Step 1: Clone Your Repository

```bash
git clone https://github.com/yourusername/your-real-repo.git
cd your-real-repo
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Environment Configuration

Create a `.env` file:

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_admin_db
DB_USER=your_admin_user
DB_PASSWORD=your_secure_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Admin Panel
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password
ADMIN_SECRET=your_jwt_secret

# Security
SESSION_SECRET=your_session_secret
ENCRYPTION_KEY=your_encryption_key

# Server
PORT=3000
NODE_ENV=development
```

### Step 4: Database Setup

```bash
# Create database
createdb your_admin_db

# Run migrations
npm run migrate

# Seed admin user
npm run seed:admin
```

### Step 5: Start the System

```bash
# Development
npm run dev

# Production
npm start
```

## 🔐 Admin Access

### Default Credentials

- **URL**: `http://localhost:3000/admin`
- **Username**: `admin`
- **Password**: `admin123` (change immediately)

### First Login

1. Navigate to `/admin`
2. Login with default credentials
3. Change password immediately
4. Configure 2FA if enabled

## 📊 Dashboard Features

### User Management
- View all users
- Edit user permissions
- Delete users
- Reset passwords

### System Monitoring
- Real-time system metrics
- Error logs
- Performance monitoring
- Resource usage

### Data Management
- Database backups
- Data export/import
- Schema management
- Query execution

### Configuration
- System settings
- Feature toggles
- API keys management
- Security settings

## 🔧 Configuration Files

### Admin Panel Config (`config/admin.json`)

```json
{
  "dashboard": {
    "title": "Your Admin Dashboard",
    "theme": "dark",
    "refreshInterval": 30000
  },
  "security": {
    "sessionTimeout": 3600000,
    "maxLoginAttempts": 5,
    "lockoutDuration": 900000,
    "require2FA": true
  },
  "features": {
    "userManagement": true,
    "systemMonitoring": true,
    "dataManagement": true,
    "configuration": true
  }
}
```

### Database Config (`config/database.json`)

```json
{
  "development": {
    "host": "localhost",
    "port": 5432,
    "database": "your_admin_db_dev",
    "username": "your_admin_user",
    "password": "your_password"
  },
  "production": {
    "host": "your-production-host",
    "port": 5432,
    "database": "your_admin_db_prod",
    "username": "your_prod_user",
    "password": "your_prod_password",
    "ssl": true
  }
}
```

## 🛡️ Security Configuration

### IP Whitelisting

Add your IP addresses to `config/security.json`:

```json
{
  "allowedIPs": [
    "192.168.1.100",
    "10.0.0.50",
    "your.public.ip.address"
  ],
  "blockedIPs": [],
  "geoRestrictions": {
    "enabled": false,
    "allowedCountries": ["US", "CA", "GB"]
  }
}
```

### Session Management

```json
{
  "session": {
    "secret": "your_session_secret",
    "maxAge": 3600000,
    "secure": true,
    "httpOnly": true,
    "sameSite": "strict"
  }
}
```

## 📝 Logging

### Log Configuration (`config/logging.json`)

```json
{
  "level": "info",
  "format": "json",
  "file": "/var/log/admin-dashboard/app.log",
  "maxSize": "10m",
  "maxFiles": 5,
  "audit": {
    "enabled": true,
    "file": "/var/log/admin-dashboard/audit.log"
  }
}
```

## 🔄 Backup Configuration

### Automated Backups

```json
{
  "backup": {
    "enabled": true,
    "schedule": "0 2 * * *",
    "retention": 30,
    "location": "/backups/admin-dashboard",
    "encryption": true
  }
}
```

## 🚨 Emergency Access

### Recovery Mode

If you're locked out:

1. Stop the application
2. Set `EMERGENCY_MODE=true` in `.env`
3. Restart the application
4. Access `/admin/recovery`
5. Reset your credentials
6. Disable emergency mode

### Backup Admin Account

Create a backup admin account:

```bash
npm run create:backup-admin
```

## 📞 Support

For issues with your admin dashboard:

- Check logs: `/var/log/admin-dashboard/`
- Review configuration files
- Test database connectivity
- Verify Redis connection

---

**Remember**: This is your private system. The public `docs/` folder is just a facade for the DataFlow API documentation.
