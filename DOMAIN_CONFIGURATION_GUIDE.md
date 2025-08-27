# Domain Configuration Guide

## Overview

This guide explains the changes made to remove hardcoded domain references and make the site template reusable for any user.

## What Was Changed

### 1. Centralized Configuration System

**New File: `site-config.js`**
- Contains all site-specific configuration
- Centralizes domain, OAuth, and social media settings
- Provides helper functions for URL generation

### 2. Updated Files

#### `public/index.html`
- Added dynamic meta tag updates using JavaScript
- Replaced hardcoded URLs with configurable placeholders
- Added site configuration script inclusion

#### `public/login.js`
- Updated OAuth URLs to use configuration
- Added dynamic URL updates for GitHub OAuth setup

#### `mkdocs.yml`
- Updated site URL to use placeholder format
- Repository name now uses placeholder format

#### Documentation Files
- `DEPLOYMENT_TEST.md`
- `GITHUB_PAGES_SETUP.md`
- `GITHUB_SETUP_GUIDE.md`
- All hardcoded references replaced with placeholders

### 3. Setup Script

**New File: `setup-site.js`**
- Interactive script to configure the site
- Automatically updates configuration files
- Generates setup completion guide

## How to Use

### Option 1: Automated Setup (Recommended)

1. **Run the setup script**:
   ```bash
   node setup-site.js
   ```

2. **Follow the prompts**:
   - Enter your GitHub username
   - Enter your repository name
   - Enter your Twitter handle (optional)
   - Enter your site name
   - Enter your site description

3. **The script will automatically**:
   - Update `site-config.js` with your information
   - Update `mkdocs.yml` with correct URLs
   - Generate `SETUP_COMPLETE.md` with next steps

### Option 2: Manual Configuration

1. **Edit `site-config.js`**:
   ```javascript
   const siteConfig = {
     siteName: "Your Site Name",
     domain: {
       baseUrl: "https://yourusername.github.io/your-repo-name/",
       githubUsername: "yourusername",
       repositoryName: "your-repo-name"
     },
     oauth: {
       callbackUrl: "https://yourusername.github.io/your-repo-name/auth/callback"
     }
     // ... other settings
   };
   ```

2. **Update `mkdocs.yml`**:
   ```yaml
   site_url: https://yourusername.github.io/your-repo-name/
   repo_name: yourusername/your-repo-name
   ```

## Configuration Options

### Domain Configuration

```javascript
domain: {
  // For GitHub Pages
  baseUrl: "https://yourusername.github.io/your-repo-name/",
  
  // For custom domain
  // baseUrl: "https://yourdomain.com/",
  
  // For local development
  // baseUrl: "http://localhost:3000/",
  
  githubUsername: "yourusername",
  repositoryName: "your-repo-name",
  twitterHandle: "@yourusername"
}
```

### OAuth Configuration

```javascript
oauth: {
  callbackUrl: "https://yourusername.github.io/your-repo-name/auth/callback",
  appName: "Your Site Name"
}
```

### Social Media

```javascript
social: {
  twitter: {
    creator: "@yourusername",
    site: "@yourusername"
  },
  github: "https://github.com/yourusername"
}
```

## Dynamic Content Updates

The site now automatically updates content based on configuration:

### Meta Tags
- Page title
- Description
- Open Graph tags
- Twitter Card tags
- Canonical URL

### Page Content
- Header title
- Footer copyright
- OAuth setup instructions

### Structured Data
- JSON-LD schema markup
- Application information

## Files That Use Configuration

### Frontend Files
- `public/index.html` - Main page with dynamic meta tags
- `public/login.js` - OAuth configuration
- `site-config.js` - Configuration file (loaded by frontend)

### Documentation Files
- `mkdocs.yml` - MkDocs configuration
- `docs/*.md` - Documentation pages

### Scripts
- `setup-site.js` - Interactive setup script

## Benefits

### 1. Reusability
- Template can be used by anyone
- No need to manually edit multiple files
- Consistent configuration across all components

### 2. Maintainability
- Single source of truth for site configuration
- Easy to update domain information
- Centralized OAuth settings

### 3. User Experience
- Interactive setup process
- Clear instructions for configuration
- Automatic file updates

### 4. SEO Optimization
- Dynamic meta tag generation
- Proper canonical URLs
- Social media optimization

## Troubleshooting

### Common Issues

1. **Configuration not loading**:
   - Check that `site-config.js` is in the correct location
   - Verify the script is included in `index.html`

2. **OAuth URLs incorrect**:
   - Ensure `site-config.js` has correct domain information
   - Check that callback URL matches GitHub OAuth app settings

3. **Meta tags not updating**:
   - Verify JavaScript is enabled
   - Check browser console for errors
   - Ensure `updateSiteContent()` function is called

### Manual Overrides

If you need to override configuration for specific pages:

```javascript
// Override specific settings
window.siteConfig.domain.baseUrl = "https://custom-domain.com/";
updateSiteContent(); // Re-apply configuration
```

## Migration from Old System

If you're updating an existing site:

1. **Backup your current configuration**
2. **Run the setup script** to generate new configuration
3. **Review and update** any custom content
4. **Test OAuth functionality**
5. **Update GitHub OAuth app settings** if needed

## Best Practices

1. **Always use the setup script** for initial configuration
2. **Keep `site-config.js` in version control** but exclude sensitive data
3. **Test OAuth functionality** after configuration changes
4. **Update GitHub OAuth app settings** when changing domains
5. **Use environment variables** for sensitive configuration in production

## Support

For issues with domain configuration:

1. Check the browser console for JavaScript errors
2. Verify all configuration values are correct
3. Test OAuth URLs manually
4. Review the setup completion guide (`SETUP_COMPLETE.md`)

The new system makes the template much more user-friendly and maintainable while preserving all existing functionality.
