#!/usr/bin/env node

/**
 * BeamFlow GitHub Pages Deployment Script
 * Deploys both the public documentation site and prepares the secret system
 * Uses environment variables for all configuration - NO HARDCODED VALUES
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Import environment configuration
const envConfig = require('./env-config');

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
        // Set environment variables from environment manager
        process.env.SITE_TITLE = envConfig.siteTitle;
        process.env.SITE_DESCRIPTION = envConfig.siteDescription;
        process.env.SITE_URL = envConfig.siteUrl;
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
        execSync('npx gh-pages -d dist', { stdio: 'inherit' });
        log('GitHub Pages deployment completed', 'SUCCESS');
    } catch (error) {
        log(`GitHub Pages deployment failed: ${error.message}`, 'ERROR');
        process.exit(1);
    }
}

function createDeploymentSummary() {
    log('Creating deployment summary...');
    
    // Get configuration from environment manager (NO HARDCODED VALUES)
    const siteConfig = envConfig.getSiteConfig();
    const adminCredentials = envConfig.getAdminCredentials();
    
    const summary = `
#  BeamFlow Deployment Summary

##  Public Documentation Site
- **URL**: ${siteConfig.githubPagesUrl}
- **Status**: Successfully deployed to GitHub Pages
- **Branch**: gh-pages
- **Last Deployed**: ${new Date().toISOString()}

##  Hidden Secret System
- **Location**: \`_internal/system/\`
- **Status**: Built and ready for deployment
- **Admin Panel**: Available at /admin (when deployed)
- **FTP Server**: Available on configured port
- **SSH Server**: Available on configured port

##  Admin Credentials (From Environment Variables)
- **Username**: ${adminCredentials.username}
- **Password**: [HIDDEN - Set via ADMIN_PASSWORD environment variable]
- **API Key**: [HIDDEN - Set via ADMIN_API_KEY environment variable]

##  Deployment Package
- **Location**: \`full-system-deploy/\`
- **Contains**: 
  - Public documentation site
  - Hidden secret system
  - Backend server
  - Admin dashboard
  - Plugin system

##  Next Steps

### 1. Verify Public Site
Visit: ${siteConfig.githubPagesUrl}

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
- **Username**: ${adminCredentials.username}
- **Password**: Set via ADMIN_PASSWORD environment variable

##  Security Features
- Environment-based configuration (NO HARDCODED VALUES)
- IP Whitelisting enabled
- Session management active
- Rate limiting configured
- Audit logging enabled
- Encrypted data storage

##  File Structure
\`\`\`
[your-repo-name]/
├── dist/                    # Public site (deployed to GitHub Pages)
├── _internal/system/        # Hidden secret system
├── full-system-deploy/      # Complete deployment package
└── docs/                    # Documentation source
\`\`\`

##  Environment Variables Used
- **SITE_TITLE**: ${siteConfig.title}
- **SITE_DESCRIPTION**: ${siteConfig.description}
- **SITE_URL**: ${siteConfig.url}
- **ADMIN_USERNAME**: ${adminCredentials.username}
- **ADMIN_PASSWORD**: [HIDDEN]
- **ADMIN_API_KEY**: [HIDDEN]
- **GITHUB_USERNAME**: ${siteConfig.githubUsername}
- **REPOSITORY_NAME**: ${siteConfig.repositoryName}

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
        name: envConfig.siteTitle,
        short_name: "BeamFlow",
        description: envConfig.siteDescription,
        start_url: "/[your-repo-name]/",
        display: "standalone",
        background_color: "#000000",
        theme_color: "#ff0000",
        icons: [
            {
                src: "/[your-repo-name]/favicon-16x16.png",
                sizes: "16x16",
                type: "image/png"
            },
            {
                src: "/[your-repo-name]/favicon-32x32.png",
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
    console.log(`${colors.green} BeamFlow GitHub Pages Deployment${colors.reset}\n`);
    
    try {
        // Validate environment variables
        if (!envConfig.validateEnvironment()) {
            log('Environment validation failed', 'ERROR');
            process.exit(1);
        }
        
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
        
        const siteConfig = envConfig.getSiteConfig();
        const adminCredentials = envConfig.getAdminCredentials();
        
        console.log(`\n${colors.green} Deployment completed successfully!${colors.reset}`);
        console.log(`${colors.cyan}Public site:${colors.reset} ${siteConfig.githubPagesUrl}`);
        console.log(`${colors.yellow}Secret system:${colors.reset} Ready for deployment in full-system-deploy/`);
        console.log(`${colors.magenta}Admin panel:${colors.reset} Available at /admin (after secret system deployment)`);
        console.log(`${colors.blue}Admin username:${colors.reset} ${adminCredentials.username}`);
        console.log(`${colors.green}Environment variables:${colors.reset} All configuration from environment variables`);
        
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
    deployToGitHubPages,
    envConfig
};
