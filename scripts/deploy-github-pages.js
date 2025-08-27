#!/usr/bin/env node

/**
 * BeamFlow GitHub Pages Deployment Script
 * Deploys both the public documentation site and prepares the secret system
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

function checkGitStatus() {
    log('Checking Git status...');
    
    try {
        const status = execSync('git status --porcelain', { encoding: 'utf8' });
        if (status.trim()) {
            log('Uncommitted changes detected', 'WARN');
            log('Please commit your changes before deploying', 'WARN');
            return false;
        }
        log('Git status clean', 'SUCCESS');
        return true;
    } catch (error) {
        log(`Git status check failed: ${error.message}`, 'ERROR');
        return false;
    }
}

function buildPublicSite() {
    log('Building public documentation site...');
    
    try {
        // Set environment variables
        process.env.SITE_TITLE = 'BeamFlow Documentation';
        process.env.SITE_DESCRIPTION = 'Comprehensive documentation for the BeamFlow Unreal Engine plugin';
        process.env.SITE_URL = 'https://millsy102.github.io/docssitetemplate';
        process.env.NODE_ENV = 'production';
        
        // Build the site
        execSync('npm run build', { stdio: 'inherit' });
        log('Public site build completed', 'SUCCESS');
    } catch (error) {
        log(`Public site build failed: ${error.message}`, 'ERROR');
        process.exit(1);
    }
}

function buildSecretSystem() {
    log('Building hidden secret system...');
    
    try {
        execSync('npm run build:secret', { stdio: 'inherit' });
        log('Secret system build completed', 'SUCCESS');
    } catch (error) {
        log(`Secret system build failed: ${error.message}`, 'ERROR');
        process.exit(1);
    }
}

function deployToGitHubPages() {
    log('Deploying to GitHub Pages...');
    
    try {
        // Check if gh-pages branch exists
        try {
            execSync('git show-ref --verify --quiet refs/remotes/origin/gh-pages', { stdio: 'pipe' });
            log('gh-pages branch exists, updating...');
        } catch (error) {
            log('gh-pages branch does not exist, creating...');
        }
        
        // Deploy to GitHub Pages
        execSync('npx gh-pages -d dist -t true', { stdio: 'inherit' });
        log('GitHub Pages deployment completed', 'SUCCESS');
    } catch (error) {
        log(`GitHub Pages deployment failed: ${error.message}`, 'ERROR');
        process.exit(1);
    }
}

function createDeploymentSummary() {
    log('Creating deployment summary...');
    
    const summary = `
# 🚀 BeamFlow Deployment Summary

## ✅ Public Documentation Site
- **URL**: https://millsy102.github.io/docssitetemplate
- **Status**: Successfully deployed to GitHub Pages
- **Branch**: gh-pages
- **Last Deployed**: ${new Date().toISOString()}

## 🔒 Hidden Secret System
- **Location**: \`_internal/system/\`
- **Status**: Built and ready for deployment
- **Admin Panel**: Available at /admin (when deployed)
- **FTP Server**: Available on configured port
- **SSH Server**: Available on configured port

## 📦 Deployment Package
- **Location**: \`full-system-deploy/\`
- **Contains**: 
  - Public documentation site
  - Hidden secret system
  - Backend server
  - Admin dashboard
  - Plugin system

## 🔧 Next Steps

### 1. Verify Public Site
Visit: https://millsy102.github.io/docssitetemplate

### 2. Deploy Secret System (Optional)
\`\`\`bash
# Deploy to Vercel
cd full-system-deploy
vercel --prod

# Or deploy to other platforms
npm run deploy:vercel
\`\`\`

### 3. Access Admin Panel
- **URL**: /admin (after secret system deployment)
- **Username**: Set via environment variables
- **Password**: Set via environment variables

## 🛡️ Security Features
- IP Whitelisting enabled
- Session management active
- Rate limiting configured
- Audit logging enabled
- Encrypted data storage

## 📁 File Structure
\`\`\`
docssitetemplate/
├── dist/                    # Public site (deployed to GitHub Pages)
├── _internal/system/        # Hidden secret system
├── full-system-deploy/      # Complete deployment package
└── docs/                    # Documentation source
\`\`\`

---
*Deployment completed on ${new Date().toISOString()}*
`;
    
    try {
        fs.writeFile('DEPLOYMENT_SUMMARY.md', summary);
        log('Deployment summary created', 'SUCCESS');
    } catch (error) {
        log(`Failed to create deployment summary: ${error.message}`, 'WARN');
    }
}

function createGitHubPagesConfig() {
    log('Creating GitHub Pages configuration...');
    
    const config = {
        name: "BeamFlow Documentation",
        short_name: "BeamFlow",
        description: "Comprehensive documentation for the BeamFlow Unreal Engine plugin",
        start_url: "/docssitetemplate/",
        display: "standalone",
        background_color: "#000000",
        theme_color: "#ff0000",
        icons: [
            {
                src: "/docssitetemplate/favicon-16x16.png",
                sizes: "16x16",
                type: "image/png"
            },
            {
                src: "/docssitetemplate/favicon-32x32.png",
                sizes: "32x32",
                type: "image/png"
            }
        ]
    };
    
    try {
        fs.writeFile('dist/site.webmanifest', JSON.stringify(config, null, 2));
        log('GitHub Pages configuration created', 'SUCCESS');
    } catch (error) {
        log(`Failed to create GitHub Pages config: ${error.message}`, 'WARN');
    }
}

async function main() {
    console.log(`${colors.green}🚀 BeamFlow GitHub Pages Deployment${colors.reset}\n`);
    
    try {
        // Check prerequisites
        if (!checkGitStatus()) {
            process.exit(1);
        }
        
        // Build both systems
        buildPublicSite();
        buildSecretSystem();
        
        // Create GitHub Pages configuration
        createGitHubPagesConfig();
        
        // Deploy to GitHub Pages
        deployToGitHubPages();
        
        // Create deployment summary
        createDeploymentSummary();
        
        console.log(`\n${colors.green}🎉 Deployment completed successfully!${colors.reset}`);
        console.log(`${colors.cyan}Public site:${colors.reset} https://millsy102.github.io/docssitetemplate`);
        console.log(`${colors.yellow}Secret system:${colors.reset} Ready for deployment in full-system-deploy/`);
        console.log(`${colors.magenta}Admin panel:${colors.reset} Available at /admin (after secret system deployment)`);
        
    } catch (error) {
        log(`Deployment failed: ${error.message}`, 'ERROR');
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
    deployToGitHubPages
};
