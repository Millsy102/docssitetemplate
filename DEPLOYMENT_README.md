# BeamFlow Deployment Guide

This guide covers how to build and deploy the BeamFlow application using the provided scripts and tools.

## 🚀 Quick Start

### Windows (PowerShell)
```powershell
# Full build and deploy
.\build-and-deploy.ps1

# Quick deploy (skips some validations)
.\quick-deploy.ps1

# Deploy to specific target
.\build-and-deploy.ps1 -DeployTarget vercel
```

### Linux/Mac (Bash)
```bash
# Make script executable
chmod +x build-and-deploy.sh

# Full build and deploy
./build-and-deploy.sh

# Quick deploy with options
./build-and-deploy.sh --skip-tests --deploy-target local
```

## 📋 Prerequisites

Before deploying, ensure you have:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **Git** (for version control)
- **PowerShell** (Windows) or **Bash** (Linux/Mac)

### Optional Dependencies
- **Vercel CLI** (for Vercel deployment)
- **PM2** (for production process management)
- **Docker** (for containerized deployment)

## 🎯 Deployment Targets

### 1. Local Deployment
Deploys to your local filesystem for testing or development.

```powershell
.\build-and-deploy.ps1 -DeployTarget local
```

**Default Path:** `C:\BeamFlow` (Windows) or `/opt/BeamFlow` (Linux/Mac)

### 2. Vercel Deployment
Deploys to Vercel platform for hosting.

```powershell
# Install Vercel CLI first
npm install -g vercel

# Deploy
.\build-and-deploy.ps1 -DeployTarget vercel
```

### 3. GitHub Pages
Deploys to GitHub Pages for static hosting.

```powershell
.\build-and-deploy.ps1 -DeployTarget github-pages
```

### 4. Remote Server
Deploys to a remote server via SSH.

```powershell
.\build-and-deploy.ps1 -DeployTarget server
```

**Note:** Configure server details in `deploy-config.json`

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the `_internal/system` directory:

```env
# Application
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=your_database_url
REDIS_URL=your_redis_url

# Authentication
JWT_SECRET=your_jwt_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Email (optional)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password

# File Storage (optional)
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

### Deployment Configuration

Edit `deploy-config.json` to customize deployment settings:

```json
{
  "deployment": {
    "defaultTarget": "local",
    "targets": {
      "local": {
        "path": "C:\\BeamFlow",
        "type": "filesystem"
      }
    }
  }
}
```

## 🔧 Build Process

The build process includes:

1. **Dependency Installation**
   - Installs all required npm packages
   - Cleans previous installations for fresh builds

2. **Code Validation**
   - **Linting:** ESLint code quality checks
   - **Testing:** Jest unit and integration tests
   - **Security:** npm audit for vulnerability checks

3. **Frontend Build**
   - Vite build process
   - Asset optimization and minification
   - Static file generation

4. **Backend Build**
   - TypeScript compilation (if applicable)
   - Node.js optimization

5. **Deployment Package**
   - Creates deployment directory
   - Copies necessary files
   - Generates start scripts
   - Creates deployment archive

## 📦 Deployment Package Structure

```
deploy/
├── dist/                 # Built frontend assets
├── src/                  # Backend source code
├── package.json          # Dependencies
├── package-lock.json     # Locked dependencies
├── start.ps1            # Windows start script
├── start.sh             # Linux/Mac start script
├── start.bat            # Windows batch start script
├── deploy.ps1           # Deployment script
├── deploy.sh            # Linux deployment script
├── README.md            # Deployment instructions
└── .env.example         # Environment template
```

## 🚀 Starting the Application

### Windows
```powershell
# Navigate to deployment directory
cd C:\BeamFlow

# Start the application
.\start.ps1
```

### Linux/Mac
```bash
# Navigate to deployment directory
cd /opt/BeamFlow

# Make start script executable
chmod +x start.sh

# Start the application
./start.sh
```

### Manual Start
```bash
# Set environment
export NODE_ENV=production

# Install production dependencies
npm ci --only=production

# Start the server
node src/server.js
```

## 🔍 Troubleshooting

### Common Issues

1. **Permission Denied**
   ```bash
   # Linux/Mac: Fix permissions
   chmod +x build-and-deploy.sh
   sudo chown -R $USER:$USER /opt/BeamFlow
   ```

2. **Node Version Issues**
   ```bash
   # Check Node.js version
   node --version
   
   # Use nvm to switch versions
   nvm use 18
   ```

3. **Port Already in Use**
   ```bash
   # Find process using port
   lsof -i :3000
   
   # Kill process
   kill -9 <PID>
   ```

4. **Build Failures**
   ```bash
   # Clean and rebuild
   rm -rf node_modules dist
   npm install
   npm run build
   ```

### Logs and Debugging

- **Application Logs:** Check console output or log files
- **Build Logs:** Review build script output
- **Network Issues:** Verify firewall and port settings
- **Database Issues:** Check connection strings and credentials

## 🔒 Security Considerations

1. **Environment Variables**
   - Never commit `.env` files to version control
   - Use strong, unique secrets
   - Rotate secrets regularly

2. **File Permissions**
   - Restrict access to sensitive files
   - Use appropriate file permissions

3. **Network Security**
   - Use HTTPS in production
   - Configure firewalls appropriately
   - Enable rate limiting

4. **Dependencies**
   - Regularly update dependencies
   - Monitor for security vulnerabilities
   - Use `npm audit` regularly

## 📈 Monitoring and Maintenance

### Health Checks
```bash
# Check application status
curl http://localhost:3000/health

# Check database connection
curl http://localhost:3000/api/status
```

### Performance Monitoring
- Monitor CPU and memory usage
- Track response times
- Monitor error rates
- Set up alerts for critical issues

### Regular Maintenance
- Update dependencies monthly
- Review and rotate secrets
- Monitor log files
- Backup data regularly

## 🆘 Support

For deployment issues:

1. Check the troubleshooting section
2. Review build logs for errors
3. Verify configuration settings
4. Check system requirements
5. Consult the main project documentation

## 📝 Changelog

### Version 1.0.0
- Initial deployment scripts
- Support for multiple deployment targets
- Comprehensive build process
- Cross-platform compatibility

---

**Note:** This deployment system replaces the previous GitHub Actions workflow. All deployments are now manual and controlled through these scripts.
