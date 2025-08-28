#!/usr/bin/env node

/**
 * BeamFlow Documentation Site - Deployment Preparation Script
 * Prepares the built static site for GitHub Pages deployment
 */

const fs = require('fs');
const path = require('path');

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
    
    // Check if dist directory exists
    if (!fs.existsSync('dist')) {
        log('Build output directory "dist" not found. Please run "npm run build" first.', 'ERROR');
        process.exit(1);
    }
    
    // Check if index.html exists in dist
    if (!fs.existsSync('dist/index.html')) {
        log('Build output missing index.html. Please run "npm run build" first.', 'ERROR');
        process.exit(1);
    }
    
    log('Prerequisites check passed', 'SUCCESS');
}

function prepareDeployment() {
    log('Preparing GitHub Pages deployment...');
    
    const deployDir = 'gh-pages-deploy';
    
    // Clean previous deployment directory
    if (fs.existsSync(deployDir)) {
        fs.rmSync(deployDir, { recursive: true, force: true });
        log('Cleaned previous deployment directory');
    }
    
    // Create deployment directory
    fs.mkdirSync(deployDir, { recursive: true });
    log('Created deployment directory');
    
    // Copy built files
    copyDirectory('dist', deployDir);
    log('Copied built files to deployment directory');
    
    // Copy additional files for GitHub Pages
    copyAdditionalFiles(deployDir);
    
    // Create .nojekyll file
    fs.writeFileSync(path.join(deployDir, '.nojekyll'), '');
    log('Created .nojekyll file');
    
    // Create deployment README
    createDeploymentReadme(deployDir);
    
    log('Deployment preparation completed', 'SUCCESS');
    log(`Deployment package ready in: ${deployDir}`);
    
    return deployDir;
}

function copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
            copyDirectory(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

function copyAdditionalFiles(deployDir) {
    const additionalFiles = [
        { src: 'public/favicon.svg', dest: 'favicon.svg' },
        { src: 'public/manifest.json', dest: 'manifest.json' },
        { src: 'public/site.webmanifest', dest: 'site.webmanifest' }
    ];
    
    for (const file of additionalFiles) {
        if (fs.existsSync(file.src)) {
            fs.copyFileSync(file.src, path.join(deployDir, file.dest));
            log(`Copied ${file.dest}`);
        }
    }
}

function createDeploymentReadme(deployDir) {
    const readmeContent = `# BeamFlow Documentation Site

This is the built documentation site for BeamFlow.

## Deployment

This directory contains the static files ready for GitHub Pages deployment.

### Manual Deployment

1. Push the contents of this directory to the \`gh-pages\` branch
2. Configure GitHub Pages in your repository settings
3. Set the source to the \`gh-pages\` branch

### Automated Deployment

Use GitHub Actions to automatically deploy on push to main branch.

## Files

- \`index.html\` - Main documentation page
- \`assets/\` - CSS, JS, and other assets
- \`.nojekyll\` - Prevents GitHub Pages from processing with Jekyll

## Support

For issues or questions, please refer to the main repository.
`;
    
    fs.writeFileSync(path.join(deployDir, 'README.md'), readmeContent);
    log('Created deployment README');
}

function createDeploymentArchive(deployDir) {
    log('Creating deployment archive...');
    
    const archiveName = `docssitetemplate-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.zip`;
    
    // Note: This is a simplified version. In a real implementation,
    // you might want to use a library like 'archiver' for proper zip creation
    log(`Archive name would be: ${archiveName}`, 'WARN');
    log('For proper archive creation, install and use the "archiver" package', 'INFO');
    
    return archiveName;
}

function main() {
    console.log(`${colors.green} BeamFlow Documentation Site - Deployment Preparation${colors.reset}\n`);
    
    try {
        checkPrerequisites();
        const deployDir = prepareDeployment();
        const archiveName = createDeploymentArchive(deployDir);
        
        console.log(`\n${colors.green} Deployment preparation completed!${colors.reset}`);
        console.log(`${colors.yellow}Next steps:${colors.reset}`);
        console.log(`1. Review the deployment package in: ${deployDir}`);
        console.log('2. For GitHub Pages: Push contents to gh-pages branch');
        console.log('3. Configure GitHub Pages in repository settings');
        
    } catch (error) {
        log(`Deployment preparation failed: ${error.message}`, 'ERROR');
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = {
    prepareDeployment,
    checkPrerequisites,
    copyDirectory,
    copyAdditionalFiles,
    createDeploymentReadme
};
