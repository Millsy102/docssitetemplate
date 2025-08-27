# Build Scripts - Updated for GitHub Pages

## Overview

The build scripts have been updated to work with this GitHub Pages documentation site template. The previous scripts were designed for a server-based deployment system that doesn't exist in this template.

## Changes Made

### 1. Updated Build Scripts

- **`build-and-deploy.sh`** - Now builds the static documentation site and prepares it for GitHub Pages deployment
- **`build-and-deploy.ps1`** - PowerShell version with the same functionality

### 2. Updated Package.json Scripts

Removed server management scripts that referenced non-existent `_internal/system` directory:
- Removed: `servers:start`, `servers:stop`, `servers:restart`, `servers:status`
- Removed: `ftp:start`, `ftp:stop`, `ftp:restart`
- Removed: `ssh:start`, `ssh:stop`, `ssh:restart`
- Removed: `servers:test`

Added new deployment scripts:
- `deploy` - Build and prepare deployment package
- `deploy:prepare` - Prepare deployment package for GitHub Pages
- `deploy:github-pages` - Full deployment to GitHub Pages

### 3. New Deployment Scripts

- **`scripts/prepare-deployment.js`** - Prepares the built site for GitHub Pages deployment
- **`scripts/deploy-github-pages.js`** - Handles the actual deployment to GitHub Pages

### 4. GitHub Actions Workflow

- **`.github/workflows/deploy.yml`** - Automated deployment workflow for GitHub Pages

## Usage

### Manual Deployment

1. **Build the site:**
   ```bash
   npm run build
   ```

2. **Prepare deployment package:**
   ```bash
   npm run deploy:prepare
   ```

3. **Deploy to GitHub Pages:**
   ```bash
   npm run deploy:github-pages
   ```

### Using Build Scripts

**Bash (Linux/Mac):**
```bash
./build-and-deploy.sh
```

**PowerShell (Windows):**
```powershell
.\build-and-deploy.ps1
```

### Automated Deployment

The GitHub Actions workflow will automatically:
1. Build the site on push to main branch
2. Run linting and tests
3. Deploy to GitHub Pages

## Deployment Targets

The build scripts support different deployment targets:

- **`github-pages`** (default) - Prepare for GitHub Pages deployment
- **`local`** - Deploy to local directory for testing
- **`vercel`** - Prepare for Vercel deployment

## What the Scripts Do

1. **Clean previous builds** - Remove old dist directory
2. **Install dependencies** - Run `npm install`
3. **Run linting** - Execute ESLint (unless skipped)
4. **Run tests** - Execute Jest tests (unless skipped)
5. **Build site** - Run `npm run build`
6. **Verify build** - Check that dist/index.html exists
7. **Prepare deployment** - Copy files to deployment directory
8. **Create .nojekyll** - Add file to prevent Jekyll processing
9. **Create archive** - Package deployment files

## GitHub Pages Setup

After running the deployment scripts:

1. Go to your GitHub repository settings
2. Navigate to Pages section
3. Set source to "Deploy from a branch"
4. Select "gh-pages" branch and "/ (root)" folder
5. Click Save

Your site will be available at: `https://[username].github.io/[repository-name]/`

## Troubleshooting

### Build Script Issues

- **Missing dependencies**: Run `npm install` first
- **Build fails**: Check for linting or test errors
- **Deployment fails**: Ensure you have Git configured and GitHub remote set up

### GitHub Pages Issues

- **Site not updating**: Check GitHub Actions workflow status
- **404 errors**: Verify the base path in `vite.config.ts` matches your repository name
- **Styling issues**: Ensure `.nojekyll` file is present in the gh-pages branch

## File Structure

```
├── build-and-deploy.sh          # Bash build script
├── build-and-deploy.ps1         # PowerShell build script
├── scripts/
│   ├── prepare-deployment.js    # Deployment preparation
│   └── deploy-github-pages.js   # GitHub Pages deployment
├── .github/workflows/
│   └── deploy.yml               # GitHub Actions workflow
└── gh-pages-deploy/             # Generated deployment package
```

## Environment Variables

The build scripts use these environment variables:
- `NODE_ENV` - Set to "production" for builds
- `GH_TOKEN` - For GitHub Actions deployment

## Support

For issues or questions:
1. Check the GitHub Actions workflow logs
2. Review the build script output for errors
3. Ensure all prerequisites are installed (Node.js, npm, Git)
