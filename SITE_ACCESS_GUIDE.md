#  BeamFlow Site Access Guide

##  **CORRECT URLs**

### Public Documentation Site
- **Main URL**: https://millsy102.github.io/docssitetemplate/
- **Status**:  Live and Working
- **Content**: BeamFlow Unreal Engine plugin documentation

### Hidden Secret System
- **Admin Panel**: https://millsy102.github.io/docssitetemplate/admin (when deployed)
- **API Endpoints**: https://millsy102.github.io/docssitetemplate/api/* (when deployed)
- **Status**:  Built and ready for deployment

##  **Admin Credentials (Environment Variables Only)**

Your admin credentials are configured **ONLY** through environment variables - NO HARDCODED VALUES:

```env
# Set these in your .env file or environment variables
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD=your-secure-admin-password
ADMIN_API_KEY=your-admin-api-key
```

### Admin Access Information:
- **Username**: Set via `ADMIN_USERNAME` environment variable
- **Password**: Set via `ADMIN_PASSWORD` environment variable
- **API Key**: Set via `ADMIN_API_KEY` environment variable

##  **WRONG URL (What you tried)**
- **Incorrect**: https://millsy102.github.io/login/
- **Error**: 404 - Site not found
- **Reason**: This URL doesn't exist

##  **Why the 404 Error Occurred**

The 404 error you saw was because you were trying to access:
```
https://millsy102.github.io/login/
```

But your site is actually deployed at:
```
https://millsy102.github.io/docssitetemplate/
```

##  **How GitHub Pages Works**

1. **Repository Name**: `docssitetemplate`
2. **GitHub Username**: `millsy102`
3. **GitHub Pages URL**: `https://millsy102.github.io/docssitetemplate/`
4. **Branch**: `gh-pages` (automatically created by gh-pages deployment)

##  **Quick Access Links**

###  Working URLs
- [Main Documentation Site](https://millsy102.github.io/docssitetemplate/)
- [Getting Started](https://millsy102.github.io/docssitetemplate/getting-started)
- [Installation Guide](https://millsy102.github.io/docssitetemplate/installation)
- [Contributing](https://millsy102.github.io/docssitetemplate/contributing)

###  Secret System (When Deployed)
- [Admin Panel](https://millsy102.github.io/docssitetemplate/admin)
- [API Health Check](https://millsy102.github.io/docssitetemplate/api/health)
- [System Status](https://millsy102.github.io/docssitetemplate/api/status)

##  **Troubleshooting**

### If you still get 404 errors:

1. **Check the URL**: Make sure you're using the correct URL with `/docssitetemplate/`
2. **Wait for deployment**: GitHub Pages can take a few minutes to update
3. **Clear browser cache**: Try hard refresh (Ctrl+F5)
4. **Check GitHub Pages settings**: Go to repository Settings → Pages

### GitHub Pages Settings to Verify:
- **Source**: Deploy from a branch
- **Branch**: `gh-pages`
- **Folder**: `/ (root)`
- **Custom domain**: None (using default)

##  **Your Hidden Site Strategy**

### Public Face (What everyone sees):
- **URL**: https://millsy102.github.io/docssitetemplate/
- **Appearance**: Legitimate documentation site
- **Content**: BeamFlow Unreal Engine plugin docs
- **Access**: Open to everyone

### Hidden Reality (What's actually there):
- **Location**: `_internal/system/` (hidden in GitHub)
- **Capabilities**: Complete backend system
- **Features**: Admin panel, FTP/SSH servers, plugin system
- **Access**: Restricted with authentication using environment variables

##  **Environment Variables Configuration**

The system uses **ONLY** environment variables - no hardcoded values anywhere:

```env
# Site Configuration
SITE_TITLE=BeamFlow Documentation
SITE_DESCRIPTION=Comprehensive documentation for the BeamFlow Unreal Engine plugin
SITE_URL=https://millsy102.github.io/docssitetemplate

# Admin Authentication (REQUIRED - NO DEFAULTS)
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD=your-secure-admin-password
ADMIN_API_KEY=your-admin-api-key

# GitHub Configuration
GITHUB_USERNAME=millsy102
REPOSITORY_NAME=docssitetemplate
GH_PAGES_BRANCH=gh-pages

# Security Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
BCRYPT_ROUNDS=12
```

##  **How to Set Your Admin Credentials**

### Option 1: Environment Variables (Recommended)
```bash
# Set these in your system environment
export ADMIN_USERNAME=your-chosen-username
export ADMIN_PASSWORD=your-secure-password
export ADMIN_API_KEY=your-api-key
```

### Option 2: .env File
```bash
# Create or edit .env file
echo "ADMIN_USERNAME=your-chosen-username" >> .env
echo "ADMIN_PASSWORD=your-secure-password" >> .env
echo "ADMIN_API_KEY=your-api-key" >> .env
```

### Option 3: GitHub Secrets (For Production)
1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Add repository secrets:
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `ADMIN_API_KEY`

##  **Next Steps**

1. **Visit the correct URL**: https://millsy102.github.io/docssitetemplate/
2. **Verify the site loads**: You should see the BeamFlow documentation
3. **Set your admin credentials**: Use environment variables
4. **Deploy secret system** (optional): Use Vercel or other platforms
5. **Access admin panel**: Use your configured admin credentials

##  **Security Features**

- **Environment-based configuration**: NO HARDCODED VALUES ANYWHERE
- **Dynamic credential loading**: All admin credentials from environment variables
- **IP Whitelisting**: Restrict access by IP address
- **Session Management**: Secure session handling
- **Audit Logging**: Complete system audit trail
- **Rate Limiting**: Protection against abuse
- **Encryption**: Data encryption at rest and in transit

##  **Environment Manager**

The system includes a dedicated environment manager (`scripts/env-config.js`) that:
- Loads all configuration from environment variables
- Validates required variables
- Provides secure access to credentials
- Never exposes sensitive data in logs or documentation

---

**Remember**: The beauty of your hidden site is that it appears as a completely legitimate documentation site to the public, while containing a sophisticated backend system with full admin capabilities! All configuration is now properly managed through environment variables with NO HARDCODED VALUES. 
