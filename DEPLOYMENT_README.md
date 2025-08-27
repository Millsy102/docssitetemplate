# Deployment Guide

## Overview

This repository contains a BeamFlow Unreal Engine plugin documentation site that is automatically deployed to GitHub Pages.

## Project Structure

```
├── src/                    # Main documentation site (React/Vite)
│   ├── components/         # React components
│   ├── pages/             # Page components
│   └── ...
├── _internal/system/       # PRIVATE - Admin dashboard system (NOT deployed)
├── .github/workflows/      # GitHub Actions workflows
│   └── deploy.yml         # Main deployment workflow
└── package.json           # Main site dependencies
```

## Deployment Workflow

### What Gets Deployed

The **main documentation site** (React/Vite app in the root directory) is deployed to GitHub Pages. This includes:
- Installation guide
- Getting started guide
- Contributing guidelines
- Plugin documentation

### What Does NOT Get Deployed

The `_internal/system/` directory contains a **private admin dashboard system** that is:
- NOT deployed to GitHub Pages
- Excluded from the repository via `.gitignore`
- Used for internal development and administration
- Contains sensitive configuration and admin tools

## GitHub Actions Workflow

The deployment is handled by `.github/workflows/deploy.yml` which:

1. **Checks out** the repository
2. **Sets up** Node.js 18
3. **Installs** dependencies with `npm ci`
4. **Builds** the documentation site with `npm run build`
5. **Deploys** to GitHub Pages using the `dist/` directory

## Build Process

The main site uses:
- **Vite** for building
- **React 18** for the UI
- **TypeScript** for type safety
- **Tailwind CSS** for styling

Build output goes to the `dist/` directory.

## Troubleshooting

### Common Issues

1. **Build fails**: Check that all dependencies are installed
2. **Deployment fails**: Verify the workflow has proper permissions
3. **Site not updating**: Ensure changes are pushed to the `main` branch

### Workflow Logs

Check the **Actions** tab in GitHub to see:
- Build status
- Error messages
- Deployment logs

## Security Notes

- The `_internal/system/` directory is private and should never be committed
- Environment variables and secrets are handled via GitHub Secrets
- The public site only contains documentation, no sensitive data

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Customization

To modify the deployment:

1. Edit `.github/workflows/deploy.yml` for workflow changes
2. Update `vite.config.ts` for build configuration
3. Modify `package.json` scripts for build process changes

---

**Remember**: Only the main documentation site is deployed. The `_internal/system/` directory is for private use only.
