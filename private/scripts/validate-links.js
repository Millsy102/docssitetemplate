#!/usr/bin/env node

/**
 * Validate links in the GitHub Pages site
 * This script checks for broken internal and external links
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SITE_DIR = 'site';
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage'
];

// Check if site directory exists
function checkSiteExists() {
  if (!fs.existsSync(SITE_DIR)) {
    console.error(`❌ Site directory '${SITE_DIR}' not found. Run 'npm run docs:build' first.`);
    process.exit(1);
  }
}

// Run link validation using broken-link-checker
function validateLinks() {
  try {
    console.log('🔍 Validating links...');
    
    const command = `npx broken-link-checker --recursive --exclude-external --exclude ${EXCLUDE_PATTERNS.join(',')} ${SITE_DIR}`;
    
    execSync(command, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    console.log('✅ Link validation completed successfully!');
  } catch (error) {
    console.error('❌ Link validation failed:', error.message);
    
    // Don't exit with error code for broken links during development
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.log('⚠️  Continuing build process (development mode)');
    }
  }
}

// Check for common link issues
function checkCommonIssues() {
  console.log('🔍 Checking for common link issues...');
  
  const issues = [];
  
  // Check for absolute paths that should be relative
  const htmlFiles = findHtmlFiles(SITE_DIR);
  
  htmlFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for absolute paths that might be problematic
    const absolutePathMatches = content.match(/href="\/(?!\/)([^"]+)"/g);
    if (absolutePathMatches) {
      issues.push(`⚠️  Found absolute paths in ${file}: ${absolutePathMatches.join(', ')}`);
    }
    
    // Check for missing alt attributes on images
    const imgWithoutAlt = content.match(/<img(?!.*alt=)[^>]*>/g);
    if (imgWithoutAlt) {
      issues.push(`⚠️  Found images without alt attributes in ${file}`);
    }
  });
  
  if (issues.length > 0) {
    console.log('📋 Common issues found:');
    issues.forEach(issue => console.log(issue));
  } else {
    console.log('✅ No common issues found');
  }
}

// Find all HTML files recursively
function findHtmlFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    items.forEach(item => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (item.endsWith('.html')) {
        files.push(fullPath);
      }
    });
  }
  
  traverse(dir);
  return files;
}

// Generate link validation report
function generateReport() {
  const report = {
    timestamp: new Date().toISOString(),
    siteDirectory: SITE_DIR,
    totalHtmlFiles: findHtmlFiles(SITE_DIR).length,
    validationStatus: 'completed'
  };
  
  const reportFile = 'link-validation-report.json';
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(`📊 Link validation report saved: ${reportFile}`);
}

// Main execution
try {
  checkSiteExists();
  validateLinks();
  checkCommonIssues();
  generateReport();
  console.log('🎉 Link validation process completed!');
} catch (error) {
  console.error('❌ Link validation process failed:', error);
  process.exit(1);
}
