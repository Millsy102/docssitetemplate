#!/usr/bin/env node

/**
 * Copy Static Files Script
 * Copies static HTML files from docs directory to dist directory
 * This ensures that static pages like login are available in the built site
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
            log(`Copied: ${entry.name}`);
        }
    }
}

function copyStaticFiles() {
    log('Copying static files from docs to dist...');
    
    const docsDir = 'docs';
    const distDir = 'dist';
    
    // Check if docs directory exists
    if (!fs.existsSync(docsDir)) {
        log('Docs directory not found', 'ERROR');
        process.exit(1);
    }
    
    // Check if dist directory exists
    if (!fs.existsSync(distDir)) {
        log('Dist directory not found. Please run "npm run build" first.', 'ERROR');
        process.exit(1);
    }
    
    try {
        // Copy all files from docs to dist
        copyDirectory(docsDir, distDir);
        log('Static files copied successfully', 'SUCCESS');
        
        // Convert markdown files to HTML
        log('Converting markdown files to HTML...');
        const { convertMarkdownFiles } = require('./convert-markdown-to-html');
        convertMarkdownFiles();
        
        // List what was copied
        log('Files copied:');
        const listFiles = (dir, prefix = '') => {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                const relativePath = path.relative(docsDir, fullPath);
                if (entry.isDirectory()) {
                    log(`  ${prefix} ${relativePath}/`);
                    listFiles(fullPath, prefix + '  ');
                } else {
                    log(`  ${prefix} ${relativePath}`);
                }
            }
        };
        listFiles(docsDir);
        
    } catch (error) {
        log(`Failed to copy static files: ${error.message}`, 'ERROR');
        process.exit(1);
    }
}

function main() {
    console.log(`${colors.green}Copying Static Files${colors.reset}\n`);
    
    try {
        copyStaticFiles();
        console.log(`\n${colors.green}Static files copy completed!${colors.reset}`);
    } catch (error) {
        log(`Static files copy failed: ${error.message}`, 'ERROR');
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = {
    copyStaticFiles,
    copyDirectory
};
