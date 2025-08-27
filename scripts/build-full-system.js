#!/usr/bin/env node

/**
 * BeamFlow Full System Build Script
 * Builds both the public documentation site and the hidden secret system
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, level = 'INFO') {
    const timestamp = new Date().toISOString().replace('T', ' ').substr(0, 19);
    const color = level === 'ERROR' ? colors.red : 
                  level === 'WARN' ? colors.yellow : 
                  level === 'SUCCESS' ? colors.green : colors.blue;
    
    console.log(`${color}[${timestamp}] [${level}]${colors.reset} ${message}`);
}

function checkPrerequisites() {
    log('Checking prerequisites...');
    
    const required = ['node', 'npm'];
    for (const tool of required) {
        try {
            execSync(`${tool} --version`, { stdio: 'pipe' });
        } catch (error) {
            log(`Missing prerequisite: ${tool}`, 'ERROR');
            process.exit(1);
        }
    }
    
    log('Prerequisites check passed', 'SUCCESS');
}

function buildPublicSite() {
    log('Building public documentation site...');
    
    try {
        // Install dependencies
        execSync('npm install', { stdio: 'inherit' });
        
        // Build frontend
        execSync('npm run build', { stdio: 'inherit' });
        
        log('Public site build completed', 'SUCCESS');
    } catch (error) {
        log(`Public site build failed: ${error.message}`, 'ERROR');
        process.exit(1);
    }
}

function buildSecretSystem() {
    log('Building hidden secret system...');
    
    const secretPath = '_internal/system';
    
    if (!fsSync.existsSync(secretPath)) {
        log('Secret system directory not found', 'ERROR');
        process.exit(1);
    }
    
    try {
        // Change to secret system directory
        process.chdir(secretPath);
        
        // Install dependencies
        execSync('npm install', { stdio: 'inherit' });
        
        // Build the secret system (just the backend, no frontend)
        execSync('npm run build', { stdio: 'inherit' });
        
        // Return to root directory
        process.chdir('../..');
        
        log('Secret system build completed', 'SUCCESS');
    } catch (error) {
        // Return to root directory on error
        process.chdir('../..');
        log(`Secret system build failed: ${error.message}`, 'ERROR');
        process.exit(1);
    }
}

async function createDeploymentPackage() {
    log('Creating comprehensive deployment package...');
    
    const deployDir = 'full-system-deploy';
    
    try {
        // Clean previous deployment
        try {
            await fs.access(deployDir);
            await fs.rm(deployDir, { recursive: true, force: true });
            log('Cleaned previous deployment directory');
        } catch (error) {
            // Directory doesn't exist, which is fine
        }
        
        await fs.mkdir(deployDir, { recursive: true });
        
        // Copy public site
        try {
            await fs.access('dist');
            await fs.cp('dist', `${deployDir}/public`, { recursive: true });
            log('Copied public site to deployment package');
        } catch (error) {
            log('Public site dist directory not found, skipping', 'WARN');
        }
        
        // Copy secret system
        try {
            await fs.access('_internal/system/dist');
            await fs.cp('_internal/system/dist', `${deployDir}/secret`, { recursive: true });
            log('Copied secret system to deployment package');
        } catch (error) {
            log('Secret system dist directory not found, skipping', 'WARN');
        }
        
        // Copy backend source
        await fs.mkdir(`${deployDir}/backend`, { recursive: true });
        await fs.cp('_internal/system/src', `${deployDir}/backend/src`, { recursive: true });
        await fs.copyFile('_internal/system/package.json', `${deployDir}/backend/package.json`);
        await fs.copyFile('_internal/system/package-lock.json', `${deployDir}/backend/package-lock.json`);
        
        // Copy API entry point
        await fs.copyFile('api/index.js', `${deployDir}/api.js`);
        
        // Copy configuration files
        try {
            await fs.access('vercel.json');
            await fs.copyFile('vercel.json', `${deployDir}/vercel.json`);
        } catch (error) {
            log('vercel.json not found, skipping', 'WARN');
        }
        
        // Create deployment README
        await createDeploymentReadme(deployDir);
        
        log('Deployment package created successfully', 'SUCCESS');
        return deployDir;
    } catch (error) {
        log(`Failed to create deployment package: ${error.message}`, 'ERROR');
        throw error;
    }
}

async function createDeploymentReadme(deployDir) {
    const readmeContent = `# BeamFlow Full System Deployment

This package contains both the public documentation site and the hidden secret system.

## 🚀 Public Documentation Site
- **Location**: \`public/\` directory
- **Purpose**: Public-facing documentation for GitHub Pages
- **Access**: Open to everyone

## 🔒 Hidden Secret System
- **Location**: \`secret/\` directory  
- **Purpose**: Private admin dashboard, FTP/SSH servers, plugin system
- **Access**: Restricted with authentication

## 🏗️ Backend System
- **Location**: \`backend/\` directory
- **Purpose**: Complete backend with all services
- **Features**: Express server, database, authentication, file management

## 📦 Deployment Options

### 1. Vercel (Recommended)
\`\`\`bash
# Deploy to Vercel
vercel --prod
\`\`\`

### 2. GitHub Pages (Public Site Only)
\`\`\`bash
# Deploy public site to GitHub Pages
npm run deploy:github-pages
\`\`\`

### 3. Local Development
\`\`\`bash
# Start both systems
npm run dev:full

# Start public site only
npm run dev

# Start secret system only  
npm run dev:backend
\`\`\`

## 🔐 Secret System Access

### Admin Dashboard
- **URL**: \`/admin\`
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
- **Location**: \`backend/src/plugins/\`
- **Management**: Via admin dashboard
- **Features**: Hot-reload, hook system, YAML manifests

## 🛡️ Security Features

- **IP Whitelisting**: Restrict access by IP address
- **Session Management**: Secure session handling
- **Audit Logging**: Complete system audit trail
- **Rate Limiting**: Protection against abuse
- **Encryption**: Data encryption at rest and in transit

## 📁 File Structure

\`\`\`
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
\`\`\`

## 🔧 Configuration

### Environment Variables
\`\`\`env
NODE_ENV=production
PORT=3000
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD=your-secure-password
ADMIN_TOKEN=your-secret-token
DATABASE_URL=your-database-url
REDIS_URL=your-redis-url
JWT_SECRET=your-jwt-secret
\`\`\`

### Admin Access
- **Default Username**: Set via ADMIN_USERNAME env var
- **Default Password**: Set via ADMIN_PASSWORD env var
- **Secret Token**: Set via ADMIN_TOKEN env var

## 🚨 Security Notice

⚠️ **IMPORTANT**: This system contains sensitive functionality. Ensure:
- Strong passwords are used
- Environment variables are properly secured
- Access is restricted to authorized users only
- Regular security audits are performed

## 📞 Support

For issues or questions about the secret system, refer to the private documentation in \`_internal/system/\`.

---

**Remember**: The public site is a facade. The real system is hidden in the secret directory.
`;
    
    await fs.writeFile(`${deployDir}/README.md`, readmeContent);
    log('Created deployment README');
}

async function createStartScripts(deployDir) {
    try {
        // Create start script for the full system
        const startScript = `#!/bin/bash
# BeamFlow Full System Start Script

echo "🚀 Starting BeamFlow Full System..."

# Set environment
export NODE_ENV="production"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Start the backend server
echo "🔒 Starting secret system..."
node api.js

echo "✅ BeamFlow Full System started!"
echo "📖 Public site: http://localhost:3000"
echo "🔐 Admin panel: http://localhost:3000/admin"
echo "📊 Health check: http://localhost:3000/api/health"
`;

        await fs.writeFile(`${deployDir}/start.sh`, startScript);
        await fs.chmod(`${deployDir}/start.sh`, '755');
        
        // Create PowerShell version
        const startScriptPS = `# BeamFlow Full System Start Script (PowerShell)

Write-Host "🚀 Starting BeamFlow Full System..." -ForegroundColor Green

# Set environment
$env:NODE_ENV = "production"

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Start the backend server
Write-Host "🔒 Starting secret system..." -ForegroundColor Yellow
node api.js

Write-Host "✅ BeamFlow Full System started!" -ForegroundColor Green
Write-Host "📖 Public site: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔐 Admin panel: http://localhost:3000/admin" -ForegroundColor Cyan
Write-Host "📊 Health check: http://localhost:3000/api/health" -ForegroundColor Cyan
`;

        await fs.writeFile(`${deployDir}/start.ps1`, startScriptPS);
        log('Created start scripts');
    } catch (error) {
        log(`Failed to create start scripts: ${error.message}`, 'ERROR');
        throw error;
    }
}

async function main() {
    console.log(`${colors.green}🚀 BeamFlow Full System Build${colors.reset}\n`);
    
    try {
        checkPrerequisites();
        buildPublicSite();
        buildSecretSystem();
        const deployDir = await createDeploymentPackage();
        await createStartScripts(deployDir);
        
        console.log(`\n${colors.green}🎉 Full system build completed!${colors.reset}`);
        console.log(`${colors.yellow}Deployment package:${colors.reset} ${deployDir}`);
        console.log(`${colors.cyan}Next steps:${colors.reset}`);
        console.log('1. Review the deployment package');
        console.log('2. Deploy to Vercel: vercel --prod');
        console.log('3. Or deploy to GitHub Pages: npm run deploy:github-pages');
        console.log('4. Access admin panel at: /admin');
        
    } catch (error) {
        log(`Build failed: ${error.message}`, 'ERROR');
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = {
    buildPublicSite,
    buildSecretSystem,
    createDeploymentPackage
};
