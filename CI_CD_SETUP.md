# CI/CD Setup Documentation

This document describes the GitHub Actions workflows that have been set up for continuous integration and deployment of the BeamFlow documentation site.

## Overview

The project uses GitHub Actions for automated testing, building, and deployment. There are two main workflows:

1. **CI Workflow** (`ci.yml`) - Runs on every push and pull request
2. **Deploy Workflow** (`deploy.yml`) - Runs on pushes to the main branch

## CI Workflow (`ci.yml`)

The CI workflow performs comprehensive testing and quality checks on every code change.

### Triggers
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

### Jobs

#### 1. Lint and Format
- Runs ESLint to check code quality
- Verifies code formatting with Prettier
- Ensures consistent code style across the project

#### 2. Type Check
- Runs TypeScript compiler in `--noEmit` mode
- Catches type errors without generating output files
- Ensures type safety across the codebase

#### 3. Unit Tests
- Runs Jest unit tests
- Generates test coverage reports
- Ensures all tests pass before deployment

#### 4. Build Verification
- Builds the application using Vite
- Verifies that the build process completes successfully
- Ensures no build-time errors

#### 5. Security Checks
- Runs `npm audit` to check for known vulnerabilities
- Uses moderate audit level to avoid false positives
- Ensures dependencies are secure

#### 6. Accessibility Tests
- Runs accessibility tests using Jest with axe-core
- Ensures the site meets accessibility standards
- Checks for WCAG compliance issues

#### 7. Cache Management Tests
- Tests the custom caching system
- Verifies cache behavior and performance
- Ensures cache invalidation works correctly

#### 8. BeamCache Tests
- Tests the BeamCache functionality
- Verifies cache performance and reliability
- Ensures proper cache management

#### 9. Responsive Tests
- Tests responsive design behavior
- Verifies mobile, tablet, and desktop layouts
- Ensures cross-device compatibility

## Deploy Workflow (`deploy.yml`)

The deploy workflow automatically deploys the site to GitHub Pages when changes are pushed to the main branch.

### Triggers
- Push to `main` branch only

### Process
1. **Checkout** - Gets the latest code
2. **Setup Node.js** - Configures the Node.js environment
3. **Install Dependencies** - Installs npm packages
4. **Build** - Builds the production version
5. **Deploy** - Deploys to GitHub Pages

### Permissions
The workflow requires specific permissions:
- `contents: read` - Read repository contents
- `pages: write` - Deploy to GitHub Pages
- `id-token: write` - Use OIDC for authentication

## Environment Variables

The workflows use the following environment variables:
- `NODE_VERSION: '18'` - Specifies Node.js version

## Caching

Both workflows use npm caching to speed up builds:
- Dependencies are cached between runs
- Reduces build time significantly
- Uses GitHub's built-in cache action

## Branch Protection

To ensure code quality, consider setting up branch protection rules:

1. **Require status checks to pass before merging**
   - Enable the CI workflow as a required check
   - Prevent merging if any tests fail

2. **Require branches to be up to date**
   - Ensures PRs are based on the latest main branch
   - Prevents merge conflicts

3. **Require pull request reviews**
   - Enforce code review before merging
   - Maintain code quality standards

## Local Development

To run the same checks locally before pushing:

```bash
# Install dependencies
npm ci

# Run linting
npm run lint

# Check formatting
npx prettier --check .

# Type checking
npx tsc --noEmit

# Run tests
npm run test

# Build verification
npm run build

# Security audit
npm audit --audit-level=moderate

# Accessibility tests
npm run test:accessibility

# Cache management tests
npm run test:cache-management:unit

# BeamCache tests
npm run test:beamcache

# Responsive tests
npm run test:responsive
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check for TypeScript errors
   - Verify all dependencies are installed
   - Ensure Node.js version compatibility

2. **Test Failures**
   - Run tests locally to reproduce issues
   - Check for environment-specific problems
   - Verify test data and mocks

3. **Deployment Issues**
   - Check GitHub Pages settings
   - Verify repository permissions
   - Ensure build output is correct

### Debugging

To debug workflow issues:

1. Check the Actions tab in GitHub
2. Review workflow logs for specific errors
3. Test locally to reproduce issues
4. Check for environment differences

## Performance Optimization

The workflows are optimized for speed:

- **Parallel Execution** - Jobs run in parallel when possible
- **Caching** - npm dependencies are cached
- **Selective Testing** - Some tests only run on main branch
- **Efficient Setup** - Uses latest stable action versions

## Security Considerations

- Uses OIDC for secure authentication
- Minimal required permissions
- Regular security audits
- No secrets in workflow files

## Future Enhancements

Potential improvements to consider:

1. **Performance Monitoring** - Add Lighthouse CI for performance tracking
2. **Visual Regression Testing** - Add screenshot comparison tests
3. **Dependency Updates** - Automated dependency updates with Dependabot
4. **Staging Environment** - Deploy to staging before production
5. **Rollback Capability** - Quick rollback to previous versions

## Support

For issues with the CI/CD setup:

1. Check the GitHub Actions documentation
2. Review workflow logs for specific errors
3. Test locally to isolate issues
4. Consider updating action versions if needed

The workflows are designed to be robust and maintainable, providing comprehensive testing and reliable deployment for the BeamFlow documentation site.
