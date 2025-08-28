#!/usr/bin/env node

/**
 * URL Fix Script - Actual Replacement
 * Replaces placeholder values with actual repository values
 */

const fs = require('fs').promises;
const path = require('path');

// Actual repository configuration
const REPO_CONFIG = {
  username: 'Millsy102',
  repoName: 'docssitetemplate',
  siteUrl: 'https://millsy102.github.io/docssitetemplate'
};

// URL replacements
const URL_REPLACEMENTS = {
  // Replace placeholders with actual values
  'Millsy102': REPO_CONFIG.username,
  'docssitetemplate': REPO_CONFIG.repoName,
  'https://Millsy102.github.io/docssitetemplate': REPO_CONFIG.siteUrl,
  'https://Millsy102.github.io/docssitetemplate/': REPO_CONFIG.siteUrl + '/',
  'https://github.com/Millsy102/docssitetemplate': `https://github.com/${REPO_CONFIG.username}/${REPO_CONFIG.repoName}`,
  'https://github.com/Millsy102/docssitetemplate.git': `https://github.com/${REPO_CONFIG.username}/${REPO_CONFIG.repoName}.git`,
  'https://github.com/Millsy102/docssitetemplate/issues': `https://github.com/${REPO_CONFIG.username}/${REPO_CONFIG.repoName}/issues`,
  'https://github.com/Millsy102/docssitetemplate/discussions': `https://github.com/${REPO_CONFIG.username}/${REPO_CONFIG.repoName}/discussions`,
  '/docssitetemplate/': `/${REPO_CONFIG.repoName}/`,
  'docssitetemplate/': `${REPO_CONFIG.repoName}/`,
  'docssitetemplate-v1.0.0': `${REPO_CONFIG.repoName}-v1.0.0`
};

// Files to exclude
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.git',
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
      if (regex.test(modifiedContent)) {
        modifiedContent = modifiedContent.replace(regex, newUrl);
        changes++;
      }
    }
    
    if (changes > 0) {
      await fs.writeFile(filePath, modifiedContent, 'utf8');
      console.log(`  Updated ${filePath} (${changes} replacements)`);
      return changes;
    }
    
    return 0;
  } catch (error) {
    console.error(`  Error processing ${filePath}:`, error.message);
    return 0;
  }
}

/**
 * Process directory recursively
 */
async function processDirectory(dirPath) {
  let totalChanges = 0;
  
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        totalChanges += await processDirectory(fullPath);
      } else if (shouldProcessFile(fullPath)) {
        totalChanges += await replaceUrlsInFile(fullPath);
      }
    }
  } catch (error) {
    console.error(`  Error reading directory ${dirPath}:`, error.message);
  }
  
  return totalChanges;
}

/**
 * Main function
 */
async function main() {
  console.log('Starting URL replacement process...\n');
  console.log(`Repository: ${REPO_CONFIG.username}/${REPO_CONFIG.repoName}`);
  console.log(`Site URL: ${REPO_CONFIG.siteUrl}\n`);
  
  const startTime = Date.now();
  const totalChanges = await processDirectory(process.cwd());
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log(`\nURL replacement completed!`);
  console.log(`Total changes made: ${totalChanges}`);
  console.log(`Duration: ${duration}s`);
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { REPO_CONFIG, URL_REPLACEMENTS };
