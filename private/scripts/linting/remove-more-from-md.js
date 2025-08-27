#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * Remove "more" from markdown files
 * This script removes the word "more" from markdown files to clean up content
 */

function removeMoreFromMarkdown(content) {
  // Remove standalone "more" words (case insensitive)
  let cleaned = content.replace(/\bmore\b/gi, '');
  
  // Remove "more" followed by common punctuation
  cleaned = cleaned.replace(/\bmore\s*[.,!?;:]/gi, '');
  
  // Remove "more" at the beginning of lines
  cleaned = cleaned.replace(/^\s*more\s*/gim, '');
  
  // Remove "more" at the end of lines
  cleaned = cleaned.replace(/\s*more\s*$/gim, '');
  
  // Clean up extra whitespace that might be left
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
  cleaned = cleaned.replace(/^\s+|\s+$/gm, '');
  
  return cleaned;
}

function processMarkdownFiles() {
  console.log('🔍 Searching for markdown files...');
  
  // Find all markdown files in the project
  const markdownFiles = glob.sync('**/*.md', {
    ignore: [
      'node_modules/**',
      'dist/**',
      'site/**',
      'coverage/**',
      '.git/**'
    ]
  });
  
  if (markdownFiles.length === 0) {
    console.log('❌ No markdown files found');
    return;
  }
  
  console.log(`📁 Found ${markdownFiles.length} markdown files`);
  
  let processedCount = 0;
  let modifiedCount = 0;
  
  markdownFiles.forEach(filePath => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      const cleanedContent = removeMoreFromMarkdown(content);
      
      if (cleanedContent !== originalContent) {
        fs.writeFileSync(filePath, cleanedContent, 'utf8');
        console.log(`✅ Modified: ${filePath}`);
        modifiedCount++;
      } else {
        console.log(`⏭️  No changes needed: ${filePath}`);
      }
      
      processedCount++;
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  });
  
  console.log('\n📊 Summary:');
  console.log(`   Total files processed: ${processedCount}`);
  console.log(`   Files modified: ${modifiedCount}`);
  console.log(`   Files unchanged: ${processedCount - modifiedCount}`);
  
  if (modifiedCount > 0) {
    console.log('\n✨ Successfully removed "more" from markdown files!');
  } else {
    console.log('\nℹ️  No "more" instances found in markdown files');
  }
}

// Run the script
if (require.main === module) {
  processMarkdownFiles();
}

module.exports = { removeMoreFromMarkdown, processMarkdownFiles };
