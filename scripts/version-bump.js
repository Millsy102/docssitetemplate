#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Version Bumper for BeamFlow Documentation Site
 *
 * This script handles version bumping, git tagging, and changelog generation
 * in a single workflow.
 */

class VersionBumper {
  constructor() {
    this.packageJsonPath = path.join(process.cwd(), 'package.json');
    this.changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
  }

  /**
   * Get current version from package.json
   */
  getCurrentVersion() {
    try {
      const packageJson = JSON.parse(
        fs.readFileSync(this.packageJsonPath, 'utf8')
      );
      return packageJson.version;
    } catch (error) {
      console.error('Error reading package.json:', error.message);
      return '1.0.0';
    }
  }

  /**
   * Parse version string into components
   */
  parseVersion(version) {
    const [major, minor, patch] = version.split('.').map(Number);
    return { major, minor, patch };
  }

  /**
   * Bump version based on type
   */
  bumpVersion(currentVersion, bumpType) {
    const { major, minor, patch } = this.parseVersion(currentVersion);

    switch (bumpType) {
      case 'major':
        return `${major + 1}.0.0`;
      case 'minor':
        return `${major}.${minor + 1}.0`;
      case 'patch':
        return `${major}.${minor}.${patch + 1}`;
      default:
        throw new Error(
          `Invalid bump type: ${bumpType}. Use 'major', 'minor', or 'patch'`
        );
    }
  }

  /**
   * Update package.json version
   */
  updatePackageJson(newVersion) {
    try {
      const packageJson = JSON.parse(
        fs.readFileSync(this.packageJsonPath, 'utf8')
      );
      packageJson.version = newVersion;
      fs.writeFileSync(
        this.packageJsonPath,
        JSON.stringify(packageJson, null, 2) + '\n'
      );
      console.log(`✅ Updated package.json version to ${newVersion}`);
    } catch (error) {
      console.error('Error updating package.json:', error.message);
      throw error;
    }
  }

  /**
   * Check if working directory is clean
   */
  isWorkingDirectoryClean() {
    try {
      const status = execSync('git status --porcelain', {
        encoding: 'utf8',
      }).trim();
      return status === '';
    } catch (error) {
      console.error('Error checking git status:', error.message);
      return false;
    }
  }

  /**
   * Create git tag
   */
  createGitTag(version, message = null) {
    try {
      const tagMessage = message || `Release version ${version}`;
      execSync(`git tag -a v${version} -m "${tagMessage}"`, {
        stdio: 'inherit',
      });
      console.log(`✅ Created git tag v${version}`);
    } catch (error) {
      console.error('Error creating git tag:', error.message);
      throw error;
    }
  }

  /**
   * Push git tag to remote
   */
  pushGitTag(version) {
    try {
      execSync(`git push origin v${version}`, { stdio: 'inherit' });
      console.log(`✅ Pushed git tag v${version} to remote`);
    } catch (error) {
      console.error('Error pushing git tag:', error.message);
      throw error;
    }
  }

  /**
   * Generate changelog for the new version
   */
  generateChangelog(version) {
    try {
      console.log('🔄 Generating changelog...');
      const ChangelogGenerator = require('./generate-changelog');
      const generator = new ChangelogGenerator();
      generator.generate({ version });
    } catch (error) {
      console.error('Error generating changelog:', error.message);
      throw error;
    }
  }

  /**
   * Commit version changes
   */
  commitVersionChanges(version) {
    try {
      execSync('git add package.json CHANGELOG.md', { stdio: 'inherit' });
      execSync(`git commit -m "chore: bump version to ${version}"`, {
        stdio: 'inherit',
      });
      console.log(`✅ Committed version changes for ${version}`);
    } catch (error) {
      console.error('Error committing version changes:', error.message);
      throw error;
    }
  }

  /**
   * Push changes to remote
   */
  pushChanges() {
    try {
      execSync('git push origin main', { stdio: 'inherit' });
      console.log('✅ Pushed changes to remote');
    } catch (error) {
      console.error('Error pushing changes:', error.message);
      throw error;
    }
  }

  /**
   * Main version bump workflow
   */
  bump(options = {}) {
    const {
      type = 'patch',
      message = null,
      skipChangelog = false,
      skipTag = false,
      skipPush = false,
      dryRun = false,
    } = options;

    console.log('🚀 Starting version bump workflow...');

    try {
      // Check if working directory is clean
      if (!this.isWorkingDirectoryClean()) {
        console.error(
          '❌ Working directory is not clean. Please commit or stash your changes first.'
        );
        process.exit(1);
      }

      const currentVersion = this.getCurrentVersion();
      const newVersion = this.bumpVersion(currentVersion, type);

      console.log(`📦 Current version: ${currentVersion}`);
      console.log(`📦 New version: ${newVersion}`);

      if (dryRun) {
        console.log('🔍 Dry run mode - no changes will be made');
        return { currentVersion, newVersion };
      }

      // Update package.json
      this.updatePackageJson(newVersion);

      // Generate changelog
      if (!skipChangelog) {
        this.generateChangelog(newVersion);
      }

      // Commit changes
      this.commitVersionChanges(newVersion);

      // Create git tag
      if (!skipTag) {
        this.createGitTag(newVersion, message);
      }

      // Push changes
      if (!skipPush) {
        this.pushChanges();
        if (!skipTag) {
          this.pushGitTag(newVersion);
        }
      }

      console.log(
        `🎉 Successfully bumped version from ${currentVersion} to ${newVersion}`
      );
      return { currentVersion, newVersion };
    } catch (error) {
      console.error('❌ Version bump failed:', error.message);
      process.exit(1);
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
Version Bumper for BeamFlow Documentation Site

Usage: node scripts/version-bump.js [type] [options]

Types:
  patch    Increment patch version (1.0.0 -> 1.0.1) [default]
  minor    Increment minor version (1.0.0 -> 1.1.0)
  major    Increment major version (1.0.0 -> 2.0.0)

Options:
  --message, -m <message>    Custom tag message
  --skip-changelog           Skip changelog generation
  --skip-tag                 Skip git tag creation
  --skip-push                Skip pushing to remote
  --dry-run                  Show what would be done without making changes
  --help, -h                 Show this help message

Examples:
  node scripts/version-bump.js patch
  node scripts/version-bump.js minor --message "Add new features"
  node scripts/version-bump.js major --dry-run
`);
    process.exit(0);
  }

  const type = args[0];
  const options = {
    type,
    message:
      args
        .find(arg => arg.startsWith('--message=') || arg.startsWith('-m='))
        ?.split('=')[1] || null,
    skipChangelog: args.includes('--skip-changelog'),
    skipTag: args.includes('--skip-tag'),
    skipPush: args.includes('--skip-push'),
    dryRun: args.includes('--dry-run'),
  };

  const bumper = new VersionBumper();
  bumper.bump(options);
}

module.exports = VersionBumper;
