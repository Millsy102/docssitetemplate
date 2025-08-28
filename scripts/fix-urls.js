#!/usr/bin/env node

/**
 * URL Fix Script
 * Fixes all hardcoded URLs in the codebase to use dynamic configuration
 * Replaces [your-repo-name] and [your-username] references with proper placeholders
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Configuration for URL replacements
const URL_REPLACEMENTS = {
  // Hardcoded URLs to replace
  'https://[your-username].github.io/[your-repo-name]': 'https://[your-username].github.io/[your-repo-name]',
  'https://[your-username].github.io/[your-repo-name]/': 'https://[your-username].github.io/[your-repo-name]/',
  'https://[your-username].github.io/[your-repo-name]': 'https://[your-username].github.io/[your-repo-name]',
  'https://[your-username].github.io/[your-repo-name]/': 'https://[your-username].github.io/[your-repo-name]/',
  
  // GitHub repository URLs
  'https://github.com/[your-username]/[your-repo-name]': 'https://github.com/[your-username]/[your-repo-name]',
  'https://github.com/[your-username]/[your-repo-name].git': 'https://github.com/[your-username]/[your-repo-name].git',
  'https://github.com/[your-username]/[your-repo-name]/issues': 'https://github.com/[your-username]/[your-repo-name]/issues',
  'https://github.com/[your-username]/[your-repo-name]/discussions': 'https://github.com/[your-username]/[your-repo-name]/discussions',
  
  // User references
  '[your-username]': '[your-username]',
  '[old-username]': '[old-username]',
  '@yourusername': '@yourusername',
  '@[your-username]': '@yourusername',
  
  // Repository references
  '[your-repo-name]': '[your-repo-name]',
  '[your-username]/[your-repo-name]': '[your-username]/[your-repo-name]',
  
  // Base paths
  '/[your-repo-name]/': '/[your-repo-name]/',
  '[your-repo-name]/': '[your-repo-name]/',
  
  // Cache names
  '[your-repo-name]-v1.0.0': '[your-repo-name]-v1.0.0',
  
  // Project names
  '[your-repo-name]': '[your-repo-name]'
};

// Files to exclude from processing
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.vercel',
  '.snapshots',
  'backup',
  '*.zip',
  '*.log',
  '*.tmp',
  '*.bak',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml'
];

// File extensions to process
const INCLUDE_EXTENSIONS = [
  '.js', '.jsx', '.ts', '.tsx', '.html', '.md', '.json', '.yml', '.yaml', 
  '.css', '.scss', '.less', '.txt', '.xml', '.svg'
];

/**
 * Check if a file should be processed
 */
function shouldProcessFile(filePath) {
  const relativePath = path.relative(process.cwd(), filePath);
  
  // Check exclude patterns
  for (const pattern of EXCLUDE_PATTERNS) {
    if (relativePath.includes(pattern)) {
      return false;
    }
  }
  
  // Check include extensions
  const ext = path.extname(filePath);
  return INCLUDE_EXTENSIONS.includes(ext);
}

/**
 * Replace URLs in a file
 */
async function replaceUrlsInFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    let modifiedContent = content;
    let changes = 0;
    
    // Apply all replacements
    for (const [oldUrl, newUrl] of Object.entries(URL_REPLACEMENTS)) {
      const regex = new RegExp(oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = content.match(regex);
      if (matches) {
        modifiedContent = modifiedContent.replace(regex, newUrl);
        changes += matches.length;
      }
    }
    
    // Write back if changes were made
    if (changes > 0) {
      await fs.writeFile(filePath, modifiedContent, 'utf8');
      console.log(` Fixed ${changes} URLs in ${filePath}`);
      return changes;
    }
    
    return 0;
  } catch (error) {
    console.error(` Error processing ${filePath}:`, error.message);
    return 0;
  }
}

/**
 * Recursively process all files in a directory
 */
async function processDirectory(dirPath) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    let totalChanges = 0;
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        totalChanges += await processDirectory(fullPath);
      } else if (entry.isFile() && shouldProcessFile(fullPath)) {
        totalChanges += await replaceUrlsInFile(fullPath);
      }
    }
    
    return totalChanges;
  } catch (error) {
    console.error(` Error processing directory ${dirPath}:`, error.message);
    return 0;
  }
}

/**
 * Update environment configuration with proper placeholders
 */
async function updateEnvironmentConfig() {
  const envConfigPath = path.join(process.cwd(), 'scripts', 'env-config.js');
  
  try {
    let content = await fs.readFile(envConfigPath, 'utf8');
    
    // Update hardcoded fallback values
    const updates = {
      "'https://[your-username].github.io/[your-repo-name]'": "'https://[your-username].github.io/[your-repo-name]'",
      "'[your-username]'": "'[your-username]'",
      "'[your-repo-name]'": "'[your-repo-name]'",
      "'@[your-username]'": "'@yourusername'",
      "'your-super-secret-jwt-key-change-this-in-production'": "'your-super-secret-jwt-key-change-this-in-production'",
      "'your-secure-admin-password'": "'your-secure-admin-password'",
      "'your-admin-api-key'": "'your-admin-api-key'"
    };
    
    let changes = 0;
    for (const [oldValue, newValue] of Object.entries(updates)) {
      const regex = new RegExp(oldValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, newValue);
        changes += matches.length;
      }
    }
    
    if (changes > 0) {
      await fs.writeFile(envConfigPath, content, 'utf8');
      console.log(` Updated environment config with ${changes} changes`);
    }
    
    return changes;
  } catch (error) {
    console.error(` Error updating environment config:`, error.message);
    return 0;
  }
}

/**
 * Update package.json with proper placeholders
 */
async function updatePackageJson() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  try {
    const content = await fs.readFile(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(content);
    
    let changes = 0;
    
    // Update repository URLs
    if (packageJson.repository && packageJson.repository.url) {
      packageJson.repository.url = packageJson.repository.url.replace(
        'https://github.com/[your-username]/[your-repo-name].git',
        'https://github.com/[your-username]/[your-repo-name].git'
      );
      changes++;
    }
    
    // Update bugs URL
    if (packageJson.bugs && packageJson.bugs.url) {
      packageJson.bugs.url = packageJson.bugs.url.replace(
        'https://github.com/[your-username]/[your-repo-name]/issues',
        'https://github.com/[your-username]/[your-repo-name]/issues'
      );
      changes++;
    }
    
    // Update homepage
    if (packageJson.homepage) {
      packageJson.homepage = packageJson.homepage.replace(
        'https://[your-username].github.io/[your-repo-name]/',
        'https://[your-username].github.io/[your-repo-name]/'
      );
      changes++;
    }
    
    // Update name (keep as template name)
    if (packageJson.name === '[your-repo-name]') {
      packageJson.name = '[your-repo-name]';
      changes++;
    }
    
    if (changes > 0) {
      await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
      console.log(` Updated package.json with ${changes} changes`);
    }
    
    return changes;
  } catch (error) {
    console.error(` Error updating package.json:`, error.message);
    return 0;
  }
}

/**
 * Update Vite configuration
 */
async function updateViteConfig() {
  const viteConfigPath = path.join(process.cwd(), 'vite.config.js');
  
  try {
    let content = await fs.readFile(viteConfigPath, 'utf8');
    
    // Update base path
    const basePathRegex = /base:\s*process\.env\.NODE_ENV\s*===\s*'production'\s*\?\s*'\/[your-repo-name]\/'\s*:\s*'\/'/;
    if (basePathRegex.test(content)) {
      content = content.replace(
        basePathRegex,
        "base: process.env.NODE_ENV === 'production' ? '/[your-repo-name]/' : '/'"
      );
      console.log(` Updated Vite base path configuration`);
    }
    
    await fs.writeFile(viteConfigPath, content, 'utf8');
    return 1;
  } catch (error) {
    console.error(` Error updating Vite config:`, error.message);
    return 0;
  }
}

/**
 * Main function
 */
async function main() {
  console.log(' Starting URL fix process...\n');
  
  const startTime = Date.now();
  let totalChanges = 0;
  
  try {
    // Process all files in the current directory
    console.log(' Processing files...');
    totalChanges += await processDirectory(process.cwd());
    
    // Update specific configuration files
    console.log('\n  Updating configuration files...');
    totalChanges += await updateEnvironmentConfig();
    totalChanges += await updatePackageJson();
    totalChanges += await updateViteConfig();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(`\n URL fix process completed!`);
    console.log(` Total changes made: ${totalChanges}`);
    console.log(`  Duration: ${duration}s`);
    console.log(`\n Next steps:`);
    console.log(`   1. Review the changes made`);
    console.log(`   2. Update your environment variables with your actual values`);
    console.log(`   3. Test the site to ensure everything works correctly`);
    console.log(`   4. Update any remaining hardcoded references manually if needed`);
    
  } catch (error) {
    console.error(`\n Error during URL fix process:`, error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  URL_REPLACEMENTS,
  replaceUrlsInFile,
  processDirectory,
  updateEnvironmentConfig,
  updatePackageJson,
  updateViteConfig
};
