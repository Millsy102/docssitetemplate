# Automated Changelog Generation Guide

This guide explains how to use the automated changelog generation system for the BeamFlow Documentation Site.

## Overview

The changelog automation system consists of several components:

1. **Conventional Commits**: Standardized commit message format
2. **Changelog Generator**: Script to generate changelogs from git history
3. **Version Bumper**: Script to bump versions and create releases
4. **Commit Linting**: Pre-commit hooks to enforce commit message format

## Installation

The system is already installed with the following dependencies:

```json
{
  "conventional-changelog-cli": "^4.1.0",
  "conventional-changelog-conventionalcommits": "^7.0.2",
  "@commitlint/cli": "^18.4.3",
  "@commitlint/config-conventional": "^18.4.3"
}
```

## Conventional Commits Format

All commits should follow the conventional commits format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Commit Types

- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system or external dependencies
- `ci`: CI/CD changes
- `chore`: Other changes that don't modify src or test files
- `revert`: Reverts a previous commit
- `security`: Security fixes
- `breaking`: Breaking changes

### Examples

```bash
# Feature commit
git commit -m "feat: add dark mode support"

# Bug fix with scope
git commit -m "fix(auth): resolve login validation issue"

# Breaking change
git commit -m "feat!: remove deprecated API endpoints

BREAKING CHANGE: The old API endpoints have been removed in favor of the new REST API."

# Documentation update
git commit -m "docs: update installation instructions"
```

## Available Scripts

### Changelog Generation

```bash
# Generate changelog using conventional-changelog-cli
npm run changelog

# Generate changelog using custom parser
npm run changelog:custom

# Generate changelog for specific version
node scripts/generate-changelog.js --version=1.2.0

# Generate changelog since specific tag
node scripts/generate-changelog.js --since=v1.0.0
```

### Version Bumping

```bash
# Bump patch version (1.0.0 -> 1.0.1)
npm run version:patch

# Bump minor version (1.0.0 -> 1.1.0)
npm run version:minor

# Bump major version (1.0.0 -> 2.0.0)
npm run version:major

# Dry run to see what would be changed
npm run version:dry-run

# Custom version bump with message
node scripts/version-bump.js minor --message="Add new features"
```

## Workflow

### Daily Development

1. Make your changes
2. Commit using conventional commit format
3. Push to repository

### Release Process

1. **Prepare for release**:
   ```bash
   # Ensure all changes are committed
   git status
   
   # Generate changelog preview
   npm run changelog
   ```

2. **Bump version and create release**:
   ```bash
   # For patch release (bug fixes)
   npm run version:patch
   
   # For minor release (new features)
   npm run version:minor
   
   # For major release (breaking changes)
   npm run version:major
   ```

3. **The version bump script will**:
   - Update `package.json` version
   - Generate changelog
   - Commit changes
   - Create git tag
   - Push to remote

### Manual Changelog Generation

If you need to generate a changelog manually:

```bash
# Generate for current version
node scripts/generate-changelog.js

# Generate for specific version
node scripts/generate-changelog.js --version=1.2.0

# Generate since specific date
node scripts/generate-changelog.js --since=2024-01-01

# Use custom parser instead of conventional-changelog-cli
node scripts/generate-changelog.js --custom
```

## Configuration

### Commitlint Configuration

The commit message format is enforced by `commitlint.config.js`:

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor', 'perf', 
      'test', 'build', 'ci', 'chore', 'revert', 'security', 'breaking'
    ]],
    'type-case': [2, 'always', 'lower'],
    'type-empty': [2, 'never'],
    'subject-case': [2, 'always', 'lower'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 72]
  }
};
```

### Changelog Format

The changelog follows the [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- New features

### Changed
- Changes in existing functionality

### Deprecated
- Soon-to-be removed features

### Removed
- Removed features

### Fixed
- Bug fixes

### Security
- Security fixes

---

## [1.1.0] - 2024-01-15

### Added
- Dark mode support
- New API endpoints

### Fixed
- Login validation issue
```

## GitHub Integration

### Pre-commit Hooks

The system uses Husky to enforce commit message format:

```bash
# Install husky (already done)
npm run prepare

# This will set up pre-commit hooks automatically
```

### GitHub Actions Workflow

A GitHub Actions workflow is configured to automatically generate changelogs when tags are pushed:

```yaml
name: Generate Changelog
on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:

jobs:
  generate-changelog:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run changelog
      - run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add CHANGELOG.md
          git commit -m "chore: update changelog for release"
          git push
```

## Troubleshooting

### Common Issues

1. **Commit message rejected**:
   - Ensure your commit follows the conventional format
   - Check the commitlint configuration

2. **Changelog not generating**:
   - Verify you have conventional commits in your history
   - Check if the script has proper permissions

3. **Version bump fails**:
   - Ensure working directory is clean
   - Check if you have proper git permissions

### Debug Commands

```bash
# Check commit message format
npx commitlint --edit .git/COMMIT_EDITMSG

# Test changelog generation
node scripts/generate-changelog.js --custom

# Check git status
git status

# View recent commits
git log --oneline -10
```

## Best Practices

1. **Always use conventional commits**: This ensures proper changelog generation
2. **Write descriptive commit messages**: Include context and reasoning
3. **Use scopes when appropriate**: Helps categorize changes
4. **Mark breaking changes**: Use `!` or `BREAKING CHANGE` footer
5. **Review changelog before release**: Ensure accuracy and completeness
6. **Keep commits atomic**: One logical change per commit

## Examples

### Feature Development

```bash
# Add new feature
git add .
git commit -m "feat(ui): add responsive navigation menu"

# Fix bug in feature
git add .
git commit -m "fix(ui): resolve navigation menu mobile layout"

# Add tests
git add .
git commit -m "test(ui): add navigation menu component tests"
```

### Documentation Updates

```bash
# Update README
git add .
git commit -m "docs: update installation instructions"

# Add API documentation
git add .
git commit -m "docs(api): add endpoint documentation"
```

### Release Process

```bash
# Check current status
git status
npm run changelog

# Create minor release
npm run version:minor

# Verify release
git log --oneline -5
git tag -l
```

This automated changelog system ensures consistent, professional release documentation while minimizing manual work.
