#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Automated Changelog Generator for BeamFlow Documentation Site
 *
 * This script generates a changelog based on conventional commits and
 * can be run manually or as part of the build process.
 */

class ChangelogGenerator {
  constructor() {
    this.changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
    this.packageJsonPath = path.join(process.cwd(), 'package.json');
    this.tempChangelogPath = path.join(process.cwd(), 'CHANGELOG.temp.md');
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
   * Get git commit history since last tag
   */
  getCommitHistory(sinceTag = null) {
    try {
      const since = sinceTag ? `--since=${sinceTag}` : '';
      const commits = execSync(
        `git log --pretty=format:"%H|%s|%b|%an|%ad" --date=short ${since}`,
        { encoding: 'utf8' }
      )
        .trim()
        .split('\n');

      return commits.map(commit => {
        const [hash, subject, body, author, date] = commit.split('|');
        return { hash, subject, body, author, date };
      });
    } catch (error) {
      console.error('Error getting git history:', error.message);
      return [];
    }
  }

  /**
   * Parse conventional commit message
   */
  parseCommit(commit) {
    const conventionalCommitRegex = /^(\w+)(?:\(([\w\-]+)\))?:\s*(.+)$/;
    const match = commit.subject.match(conventionalCommitRegex);

    if (!match) {
      return {
        type: 'chore',
        scope: null,
        subject: commit.subject,
        breaking: false,
        hash: commit.hash,
        author: commit.author,
        date: commit.date,
      };
    }

    const [, type, scope, subject] = match;
    const breaking =
      commit.subject.includes('BREAKING CHANGE') ||
      commit.body?.includes('BREAKING CHANGE') ||
      type === 'breaking';

    return {
      type,
      scope,
      subject,
      breaking,
      hash: commit.hash,
      author: commit.author,
      date: commit.date,
    };
  }

  /**
   * Group commits by type
   */
  groupCommits(commits) {
    const groups = {
      feat: [],
      fix: [],
      docs: [],
      style: [],
      refactor: [],
      perf: [],
      test: [],
      build: [],
      ci: [],
      chore: [],
      security: [],
      breaking: [],
    };

    commits.forEach(commit => {
      const parsed = this.parseCommit(commit);
      if (parsed.breaking) {
        groups.breaking.push(parsed);
      } else if (groups[parsed.type]) {
        groups[parsed.type].push(parsed);
      } else {
        groups.chore.push(parsed);
      }
    });

    return groups;
  }

  /**
   * Generate changelog content
   */
  generateChangelogContent(version, commitGroups) {
    const date = new Date().toISOString().split('T')[0];
    let content = `## [${version}] - ${date}\n\n`;

    const typeLabels = {
      feat: '### Added',
      fix: '### Fixed',
      docs: '### Documentation',
      style: '### Style',
      refactor: '### Refactored',
      perf: '### Performance',
      test: '### Testing',
      build: '### Build',
      ci: '### CI/CD',
      chore: '### Chores',
      security: '### Security',
      breaking: '### Breaking Changes',
    };

    Object.entries(commitGroups).forEach(([type, commits]) => {
      if (commits.length > 0) {
        content += `${typeLabels[type] || '### ' + type.charAt(0).toUpperCase() + type.slice(1)}\n`;
        commits.forEach(commit => {
          const scope = commit.scope ? `**${commit.scope}:** ` : '';
          content += `- ${scope}${commit.subject} ([${commit.hash.substring(0, 7)}](https://github.com/Millsy102/docssitetemplate/commit/${commit.hash}))\n`;
        });
        content += '\n';
      }
    });

    return content;
  }

  /**
   * Update existing changelog
   */
  updateChangelog(newContent) {
    try {
      let existingContent = '';
      if (fs.existsSync(this.changelogPath)) {
        existingContent = fs.readFileSync(this.changelogPath, 'utf8');
      } else {
        existingContent = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Deprecated

### Removed

### Fixed

### Security

---
`;
      }

      // Insert new content after the header and before existing content
      const lines = existingContent.split('\n');
      const headerEndIndex = lines.findIndex(line => line.startsWith('## ['));

      if (headerEndIndex === -1) {
        // No existing versions, append to end
        const updatedContent = existingContent.replace(
          '## [Unreleased]',
          newContent + '## [Unreleased]'
        );
        fs.writeFileSync(this.changelogPath, updatedContent);
      } else {
        // Insert after header, before first version
        lines.splice(headerEndIndex, 0, newContent);
        fs.writeFileSync(this.changelogPath, lines.join('\n'));
      }

      console.log(' Changelog updated successfully!');
    } catch (error) {
      console.error('Error updating changelog:', error.message);
      throw error;
    }
  }

  /**
   * Generate changelog using conventional-changelog-cli
   */
  generateWithConventionalChangelog() {
    try {
      console.log(' Generating changelog with conventional-changelog-cli...');

      // Create a backup of the current changelog
      if (fs.existsSync(this.changelogPath)) {
        fs.copyFileSync(this.changelogPath, this.changelogPath + '.backup');
      }

      // Generate changelog to temp file
      execSync(
        'npx conventional-changelog -p conventionalcommits -i CHANGELOG.md -s',
        {
          stdio: 'inherit',
        }
      );

      // Read the generated content
      const generatedContent = fs.readFileSync(this.changelogPath, 'utf8');

      // Restore the template structure
      const templateContent = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Deprecated

### Removed

### Fixed

### Security

---

${generatedContent}`;

      // Write the combined content
      fs.writeFileSync(this.changelogPath, templateContent);

      // Clean up backup
      if (fs.existsSync(this.changelogPath + '.backup')) {
        fs.unlinkSync(this.changelogPath + '.backup');
      }

      console.log(' Conventional changelog generated successfully!');
    } catch (error) {
      console.error('Error generating conventional changelog:', error.message);
      throw error;
    }
  }

  /**
   * Main generation method
   */
  generate(options = {}) {
    const { useConventional = true, sinceTag = null, version = null } = options;

    console.log(' Starting changelog generation...');

    try {
      if (useConventional) {
        this.generateWithConventionalChangelog();
      } else {
        const currentVersion = version || this.getCurrentVersion();
        const commits = this.getCommitHistory(sinceTag);
        const commitGroups = this.groupCommits(commits);
        const newContent = this.generateChangelogContent(
          currentVersion,
          commitGroups
        );
        this.updateChangelog(newContent);
      }

      console.log(' Changelog generation completed!');
    } catch (error) {
      console.error(' Changelog generation failed:', error.message);
      process.exit(1);
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    useConventional: !args.includes('--custom'),
    sinceTag:
      args.find(arg => arg.startsWith('--since='))?.split('=')[1] || null,
    version:
      args.find(arg => arg.startsWith('--version='))?.split('=')[1] || null,
  };

  const generator = new ChangelogGenerator();
  generator.generate(options);
}

module.exports = ChangelogGenerator;
