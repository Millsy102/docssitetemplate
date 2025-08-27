#!/usr/bin/env node

/**
 * BeamFlow Documentation Site - GitHub Pages Deployment Script
 * Handles deployment to GitHub Pages
 */

const fs = require('fs');
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
        // Check if we're in a git repository
        execSync('git status', { stdio: 'pipe' });
        log('Git repository found', 'SUCCESS');
    } catch (error) {
        log('Not in a Git repository. Please initialize Git first.', 'ERROR');
        process.exit(1);
    }
}

function checkRemoteOrigin() {
    log('Checking remote origin...');
    
    try {
        const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
        log(`Remote origin: ${remoteUrl}`, 'INFO');
        
        if (!remoteUrl.includes('github.com')) {
            log('Warning: Remote origin does not appear to be a GitHub repository', 'WARN');
        }
        
        return remoteUrl;
    } catch (error) {
        log('No remote origin found. Please add a GitHub remote.', 'ERROR');
        log('Example: git remote add origin https://github.com/username/repo.git', 'INFO');
        process.exit(1);
    }
}

function prepareGhPagesBranch() {
    log('Preparing gh-pages branch...');
    
    try {
        // Check if gh-pages branch exists
        const branches = execSync('git branch -a', { encoding: 'utf8' });
        
        if (branches.includes('gh-pages')) {
            log('gh-pages branch exists, switching to it...', 'INFO');
            execSync('git checkout gh-pages', { stdio: 'inherit' });
        } else {
            log('Creating gh-pages branch...', 'INFO');
            execSync('git checkout --orphan gh-pages', { stdio: 'inherit' });
            execSync('git rm -rf .', { stdio: 'inherit' });
        }
        
        log('gh-pages branch ready', 'SUCCESS');
    } catch (error) {
        log(`Failed to prepare gh-pages branch: ${error.message}`, 'ERROR');
        process.exit(1);
    }
}

function copyDeploymentFiles() {
    log('Copying deployment files...');
    
    const deployDir = 'gh-pages-deploy';
    
    if (!fs.existsSync(deployDir)) {
        log('Deployment directory not found. Please run "npm run deploy:prepare" first.', 'ERROR');
        process.exit(1);
    }
    
    try {
        // Copy all files from deployment directory to current directory
        const files = fs.readdirSync(deployDir);
        
        for (const file of files) {
            const srcPath = path.join(deployDir, file);
            const destPath = path.join('.', file);
            
            if (fs.statSync(srcPath).isDirectory()) {
                if (fs.existsSync(destPath)) {
                    fs.rmSync(destPath, { recursive: true, force: true });
                }
                fs.cpSync(srcPath, destPath, { recursive: true });
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        }
        
        log('Deployment files copied', 'SUCCESS');
    } catch (error) {
        log(`Failed to copy deployment files: ${error.message}`, 'ERROR');
        process.exit(1);
    }
}

function commitAndPush() {
    log('Committing and pushing changes...');
    
    try {
        // Add all files
        execSync('git add .', { stdio: 'inherit' });
        
        // Commit
        const commitMessage = `Deploy documentation site - ${new Date().toISOString().slice(0, 19)}`;
        execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
        
        // Push to gh-pages branch
        execSync('git push origin gh-pages', { stdio: 'inherit' });
        
        log('Changes committed and pushed to gh-pages branch', 'SUCCESS');
    } catch (error) {
        log(`Failed to commit and push: ${error.message}`, 'ERROR');
        process.exit(1);
    }
}

function switchBackToMain() {
    log('Switching back to main branch...');
    
    try {
        execSync('git checkout main', { stdio: 'inherit' });
        log('Switched back to main branch', 'SUCCESS');
    } catch (error) {
        log(`Failed to switch back to main branch: ${error.message}`, 'WARN');
        log('You may need to manually switch back to your main branch', 'INFO');
    }
}

function cleanup() {
    log('Cleaning up...');
    
    try {
        // Remove deployment directory
        if (fs.existsSync('gh-pages-deploy')) {
            fs.rmSync('gh-pages-deploy', { recursive: true, force: true });
            log('Removed deployment directory', 'INFO');
        }
    } catch (error) {
        log(`Cleanup warning: ${error.message}`, 'WARN');
    }
}

function main() {
    console.log(`${colors.green}🚀 BeamFlow Documentation Site - GitHub Pages Deployment${colors.reset}\n`);
    
    try {
        checkGitStatus();
        const remoteUrl = checkRemoteOrigin();
        prepareGhPagesBranch();
        copyDeploymentFiles();
        commitAndPush();
        switchBackToMain();
        cleanup();
        
        console.log(`\n${colors.green}🎉 Deployment completed successfully!${colors.reset}`);
        console.log(`${colors.yellow}Next steps:${colors.reset}`);
        console.log('1. Go to your GitHub repository settings');
        console.log('2. Navigate to Pages section');
        console.log('3. Set source to "Deploy from a branch"');
        console.log('4. Select "gh-pages" branch and "/ (root)" folder');
        console.log('5. Click Save');
        console.log('');
        console.log('Your site will be available at:');
        console.log(`${colors.cyan}https://[username].github.io/[repository-name]/${colors.reset}`);
        
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
    checkGitStatus,
    checkRemoteOrigin,
    prepareGhPagesBranch,
    copyDeploymentFiles,
    commitAndPush,
    switchBackToMain,
    cleanup
};
