#!/usr/bin/env node

/**
 * Clean Generated Assets Script
 *
 * This script removes all generated assets and temporary files from the project.
 * It's designed to clean up build outputs, test coverage reports, logs, and other
 * generated content to free up disk space and ensure clean builds.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Logging utility
function log(message, level = 'INFO', color = colors.reset) {
  const timestamp = new Date().toISOString();
  const levelColor =
    level === 'ERROR'
      ? colors.red
      : level === 'WARN'
        ? colors.yellow
        : level === 'SUCCESS'
          ? colors.green
          : colors.blue;

  console.log(
    `${color}${timestamp} [${levelColor}${level}${color}] ${message}${colors.reset}`
  );
}

// Check if directory exists and is not empty
function directoryExists(dirPath) {
  try {
    return fs.existsSync(dirPath) && fs.readdirSync(dirPath).length > 0;
  } catch (error) {
    return false;
  }
}

// Safely remove directory
function removeDirectory(dirPath, description) {
  if (!fs.existsSync(dirPath)) {
    log(
      `Skipping ${description}: directory does not exist`,
      'INFO',
      colors.cyan
    );
    return false;
  }

  try {
    // Use rimraf if available, otherwise use native fs.rmSync
    try {
      execSync(`npx rimraf "${dirPath}"`, { stdio: 'pipe' });
      log(`Cleaned ${description}: ${dirPath}`, 'SUCCESS', colors.green);
      return true;
    } catch (rimrafError) {
      // Fallback to native fs.rmSync
      fs.rmSync(dirPath, { recursive: true, force: true });
      log(`Cleaned ${description}: ${dirPath}`, 'SUCCESS', colors.green);
      return true;
    }
  } catch (error) {
    log(
      `Failed to clean ${description}: ${error.message}`,
      'ERROR',
      colors.red
    );
    return false;
  }
}

// Clean specific file types
function cleanFiles(pattern, description) {
  try {
    const files = execSync(`find . -name "${pattern}" -type f`, {
      encoding: 'utf8',
    })
      .trim()
      .split('\n');
    let cleanedCount = 0;

    for (const file of files) {
      if (file && fs.existsSync(file)) {
        try {
          fs.unlinkSync(file);
          cleanedCount++;
        } catch (error) {
          log(
            `Failed to remove file ${file}: ${error.message}`,
            'WARN',
            colors.yellow
          );
        }
      }
    }

    if (cleanedCount > 0) {
      log(`Cleaned ${cleanedCount} ${description}`, 'SUCCESS', colors.green);
    } else {
      log(`No ${description} found to clean`, 'INFO', colors.cyan);
    }

    return cleanedCount;
  } catch (error) {
    // find command might fail on Windows or if no files found
    log(`No ${description} found to clean`, 'INFO', colors.cyan);
    return 0;
  }
}

// Main cleanup function
function cleanAssets(options = {}) {
  const {
    dryRun = false,
    verbose = false,
    includeNodeModules = false,
    includeGit = false,
  } = options;

  log('🚀 Starting asset cleanup...', 'INFO', colors.bright);

  if (dryRun) {
    log(
      'DRY RUN MODE: No files will be actually deleted',
      'WARN',
      colors.yellow
    );
  }

  const startTime = Date.now();
  let totalCleaned = 0;
  let totalSize = 0;

  // Define directories to clean
  const directoriesToClean = [
    { path: 'dist', description: 'Build output directory' },
    { path: 'build', description: 'Build directory' },
    { path: 'coverage', description: 'Test coverage reports' },
    { path: 'logs', description: 'Log files' },
    { path: 'gh-pages-deploy', description: 'GitHub Pages deployment' },
    { path: 'full-system-deploy', description: 'Full system deployment' },
    { path: 'backup', description: 'Backup files' },
    { path: '.vercel', description: 'Vercel deployment cache' },
    { path: '.next', description: 'Next.js build cache' },
    { path: '.nuxt', description: 'Nuxt.js build cache' },
    { path: '.cache', description: 'Cache directory' },
    { path: 'tmp', description: 'Temporary files' },
    { path: 'temp', description: 'Temporary files' },
  ];

  // Add conditional directories
  if (includeNodeModules) {
    directoriesToClean.push({
      path: 'node_modules',
      description: 'Node modules',
    });
  }

  // Clean directories
  for (const dir of directoriesToClean) {
    if (directoryExists(dir.path)) {
      if (!dryRun) {
        const cleaned = removeDirectory(dir.path, dir.description);
        if (cleaned) totalCleaned++;
      } else {
        log(`Would clean ${dir.description}: ${dir.path}`, 'INFO', colors.cyan);
        totalCleaned++;
      }
    } else if (verbose) {
      log(
        `Skipping ${dir.description}: directory does not exist`,
        'INFO',
        colors.cyan
      );
    }
  }

  // Clean specific file patterns
  const filePatterns = [
    { pattern: '*.log', description: 'log files' },
    { pattern: '*.tmp', description: 'temporary files' },
    { pattern: '*.temp', description: 'temporary files' },
    { pattern: '.DS_Store', description: 'macOS system files' },
    { pattern: 'Thumbs.db', description: 'Windows thumbnail files' },
    { pattern: '*.swp', description: 'Vim swap files' },
    { pattern: '*.swo', description: 'Vim swap files' },
    { pattern: '*~', description: 'backup files' },
    { pattern: '*.orig', description: 'merge conflict files' },
    { pattern: '*.rej', description: 'rejected patch files' },
  ];

  for (const filePattern of filePatterns) {
    if (!dryRun) {
      const count = cleanFiles(filePattern.pattern, filePattern.description);
      totalCleaned += count;
    } else {
      log(`Would clean ${filePattern.description}`, 'INFO', colors.cyan);
    }
  }

  // Clean Docker artifacts (if Docker is available)
  try {
    if (!dryRun) {
      execSync('docker system prune -f', { stdio: 'pipe' });
      log('Cleaned Docker system cache', 'SUCCESS', colors.green);
      totalCleaned++;
    } else {
      log('Would clean Docker system cache', 'INFO', colors.cyan);
      totalCleaned++;
    }
  } catch (error) {
    if (verbose) {
      log(
        'Docker not available or no Docker artifacts to clean',
        'INFO',
        colors.cyan
      );
    }
  }

  // Clean npm cache (optional)
  if (options.includeNpmCache) {
    try {
      if (!dryRun) {
        execSync('npm cache clean --force', { stdio: 'pipe' });
        log('Cleaned npm cache', 'SUCCESS', colors.green);
        totalCleaned++;
      } else {
        log('Would clean npm cache', 'INFO', colors.cyan);
        totalCleaned++;
      }
    } catch (error) {
      log(`Failed to clean npm cache: ${error.message}`, 'WARN', colors.yellow);
    }
  }

  // Calculate disk space freed (approximate)
  if (!dryRun) {
    try {
      const beforeSize = execSync('du -sb .', { encoding: 'utf8' }).split(
        '\t'
      )[0];
      // This is a rough estimate since we can't easily measure before/after
      log(
        `Estimated cleanup completed for ${totalCleaned} items`,
        'SUCCESS',
        colors.green
      );
    } catch (error) {
      // du command might not be available on Windows
      log(
        `Cleanup completed for ${totalCleaned} items`,
        'SUCCESS',
        colors.green
      );
    }
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  log(
    `✨ Cleanup completed in ${duration}s`,
    'SUCCESS',
    colors.bright + colors.green
  );

  if (dryRun) {
    log(`Would have cleaned ${totalCleaned} items`, 'INFO', colors.cyan);
  } else {
    log(`Cleaned ${totalCleaned} items`, 'SUCCESS', colors.green);
  }

  return {
    cleaned: totalCleaned,
    duration: duration,
    success: true,
  };
}

// CLI interface
function main() {
  const args = process.argv.slice(2);

  const options = {
    dryRun: args.includes('--dry-run') || args.includes('-d'),
    verbose: args.includes('--verbose') || args.includes('-v'),
    includeNodeModules:
      args.includes('--include-node-modules') || args.includes('-n'),
    includeNpmCache:
      args.includes('--include-npm-cache') || args.includes('-c'),
    includeGit: args.includes('--include-git') || args.includes('-g'),
  };

  // Show help
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
${colors.bright}Asset Cleanup Script${colors.reset}

Usage: node scripts/clean-assets.js [options]

Options:
  -d, --dry-run              Show what would be cleaned without actually deleting
  -v, --verbose              Show detailed output
  -n, --include-node-modules Clean node_modules directory (use with caution!)
  -c, --include-npm-cache    Clean npm cache
  -g, --include-git          Clean git artifacts (use with extreme caution!)
  -h, --help                 Show this help message

Examples:
  node scripts/clean-assets.js                    # Clean all generated assets
  node scripts/clean-assets.js --dry-run          # Preview what would be cleaned
  node scripts/clean-assets.js --verbose          # Show detailed output
  node scripts/clean-assets.js --include-npm-cache # Also clean npm cache

${colors.yellow}Warning:${colors.reset} This script will permanently delete files. Use --dry-run first to see what will be cleaned.
`);
    return;
  }

  // Safety check for dangerous options
  if (options.includeNodeModules && !options.dryRun) {
    log(
      '⚠️  WARNING: You are about to delete node_modules!',
      'WARN',
      colors.yellow
    );
    log('This will require running npm install again.', 'WARN', colors.yellow);

    // In a real implementation, you might want to add a confirmation prompt here
    // For now, we'll just log the warning
  }

  if (options.includeGit && !options.dryRun) {
    log(
      '⚠️  WARNING: You are about to clean git artifacts!',
      'WARN',
      colors.yellow
    );
    log('This could affect your git repository.', 'WARN', colors.yellow);
  }

  // Run cleanup
  try {
    const result = cleanAssets(options);

    if (result.success) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    log(`Cleanup failed: ${error.message}`, 'ERROR', colors.red);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { cleanAssets, removeDirectory, cleanFiles };
