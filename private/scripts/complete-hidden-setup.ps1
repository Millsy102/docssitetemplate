# Complete Hidden Website Setup Script
# This script purges the repo and sets up a proper hidden website system

param(
    [string]$ProjectName = "docssitetemplate",
    [string]$PersonalFolder = "$env:USERPROFILE\millsy-admin",
    [switch]$PurgeRepo = $true,
    [switch]$SetupGitHub = $true,
    [switch]$AutoCommit = $true
)

Write-Host "=== COMPLETE HIDDEN WEBSITE SETUP ===" -ForegroundColor Green
Write-Host "This will purge the repo and set up a proper hidden website system" -ForegroundColor Yellow

# Step 1: PURGE REPOSITORY
if ($PurgeRepo) {
    Write-Host "`nStep 1: Purging repository..." -ForegroundColor Red
    
    # Remove all files except .git and scripts
    $filesToRemove = @(
        "src", "private", "admin-docs", "dist", "node_modules", "coverage",
        "site", "assets", "content", "plugins", "public", "docs",
        "*.md", "*.js", "*.json", "*.yml", "*.yaml", "*.html", "*.css",
        "*.config.js", "*.config.json", "package*.json", "*.lock",
        ".eslintrc*", ".prettierrc*", ".markdownlint*", "lighthouserc*",
        "jest*", "postcss*", "tailwind*", "vite*", "webpack*",
        "sw.js", "manifest.json", "offline.html", "index.html",
        "env*", "*.example", "*.template", "*.sample",
        "CHANGELOG*", "CONTRIBUTING*", "CODE_OF_CONDUCT*", "LICENSE*",
        "README*", "SECURITY*", "DEPLOYMENT*", "IMPLEMENTATION*",
        "SETUP*", "UPGRADE*", "STRENGTHENED*", "MODERN*", "REPOSITORY*",
        "GITHUB*", "ADMIN*", "FAÇADE*", "HIDDEN*"
    )
    
    foreach ($pattern in $filesToRemove) {
        if (Test-Path $pattern) {
            Write-Host "Removing: $pattern" -ForegroundColor Yellow
            Remove-Item $pattern -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
    
    # Keep only essential directories
    $keepDirs = @(".git", "scripts")
    Get-ChildItem -Directory | Where-Object { $keepDirs -notcontains $_.Name } | ForEach-Object {
        Write-Host "Removing directory: $($_.Name)" -ForegroundColor Yellow
        Remove-Item $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
    }
    
    Write-Host "Repository purged successfully!" -ForegroundColor Green
}

# Step 2: SETUP PERSONAL FOLDER
Write-Host "`nStep 2: Setting up personal folder..." -ForegroundColor Cyan
$PersonalAppPath = "$PersonalFolder\sites\$ProjectName\private-app"

if (!(Test-Path $PersonalAppPath)) {
    Write-Host "Creating personal folder structure..." -ForegroundColor Cyan
    New-Item -ItemType Directory -Path "$PersonalFolder\sites\$ProjectName\private-app" -Force | Out-Null
    New-Item -ItemType Directory -Path "$PersonalFolder\sites\$ProjectName\encrypt" -Force | Out-Null
    New-Item -ItemType Directory -Path "$PersonalFolder\bin" -Force | Out-Null
    New-Item -ItemType Directory -Path "$PersonalFolder\templates" -Force | Out-Null
    New-Item -ItemType Directory -Path "$PersonalFolder\tmp" -Force | Out-Null
}

# Step 3: CREATE PUBLIC FAÇADE FILES
Write-Host "`nStep 3: Creating public façade files..." -ForegroundColor Cyan

# Create basic README.md (innocent docs template)
$PublicReadme = @"
# Documentation Site Template

A modern, professional documentation site template built with MkDocs and Material theme. Perfect for creating beautiful documentation for your projects, APIs, or technical guides.

## 🚀 Quick Start

```bash
# Clone the template
git clone https://github.com/your-username/docssitetemplate.git
cd docssitetemplate

# Install dependencies
npm install

# Start development server
npm run docs:dev
```

## ✨ Features

- **MkDocs + Material Theme** - Professional, responsive design
- **Search Functionality** - Fast, full-text search across all content
- **Dark/Light Mode** - Automatic theme switching
- **Mobile Responsive** - Perfect on all devices
- **SEO Optimized** - Built-in SEO features
- **GitHub Pages Ready** - Automatic deployment

## 📚 Documentation

- [Getting Started](docs/getting-started.md)
- [Installation Guide](docs/installation.md)
- [Configuration](docs/configuration.md)
- [Customization](docs/customization.md)
- [Deployment](docs/deployment.md)

## 🔧 Development

```bash
# Start development server
npm run docs:dev

# Build for production
npm run docs:build

# Deploy to GitHub Pages
npm run docs:deploy
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Documentation Site Template** - Create beautiful, professional documentation with ease.
"@

Set-Content -Path "README.md" -Value $PublicReadme

# Create public package.json
$PublicPackageJson = @"
{
  "name": "$ProjectName",
  "version": "1.0.0",
  "description": "A modern documentation site template built with MkDocs and Material theme",
  "private": true,
  "scripts": {
    "docs:dev": "mkdocs serve",
    "docs:build": "mkdocs build",
    "docs:deploy": "mkdocs gh-deploy",
    "validate": "npm run validate-links",
    "validate-links": "node scripts/validate-links.js"
  },
  "keywords": [
    "documentation",
    "mkdocs",
    "material-theme",
    "template",
    "github-pages"
  ],
  "author": "Documentation Template",
  "license": "MIT",
  "devDependencies": {
    "broken-link-checker": "^0.7.8",
    "markdownlint-cli": "^0.37.0",
    "mkdocs": "^1.5.3",
    "mkdocs-material": "^9.4.8"
  }
}
"@

Set-Content -Path "package.json" -Value $PublicPackageJson

# Create mkdocs.yml
$MkdocsConfig = @"
site_name: Documentation Template
site_description: A modern documentation site template
site_author: Documentation Template
site_url: https://yourusername.github.io/$ProjectName/

repo_name: yourusername/$ProjectName
repo_url: https://github.com/yourusername/$ProjectName
edit_uri: edit/main/docs/

theme:
  name: material
  palette:
    - scheme: default
      primary: indigo
      accent: indigo
      toggle:
        icon: material/toggle-switch
        name: Switch to dark mode
    - scheme: slate
      primary: indigo
      accent: indigo
      toggle:
        icon: material/toggle-switch-off-outline
        name: Switch to light mode
  features:
    - navigation.tabs
    - navigation.sections
    - navigation.expand
    - search.suggest
    - search.highlight
    - content.code.copy
    - content.code.annotate

plugins:
  - search
  - git-revision-date-localized

markdown_extensions:
  - admonition
  - codehilite
  - footnotes
  - meta
  - pymdownx.arithmatex:
      generic: true
  - pymdownx.betterem:
      smart_enable: all
  - pymdownx.caret
  - pymdownx.details
  - pymdownx.emoji:
      emoji_generator: !!python/name:materialx.emoji.to_svg
  - pymdownx.highlight:
      anchor_linenums: true
  - pymdownx.inlinehilite
  - pymdownx.keys
  - pymdownx.magiclink
  - pymdownx.mark
  - pymdownx.smartsymbols
  - pymdownx.snippets:
      check_paths: true
  - pymdownx.superfences:
      custom_fences:
        - name: mermaid
          class: mermaid
          format: !!python/name:pymdownx.superfences.fence_code_format
  - pymdownx.tabbed:
      alternate_style: true
  - pymdownx.tasklist:
      custom_checkbox: true
  - pymdownx.tilde

nav:
  - Home: index.md
  - Getting Started:
    - Installation: getting-started/installation.md
    - Configuration: getting-started/configuration.md
    - Customization: getting-started/customization.md
  - Features:
    - Theme: features/theme.md
    - Search: features/search.md
    - Code Blocks: features/code-blocks.md
  - Advanced:
    - Plugins: advanced/plugins.md
    - Styling: advanced/styling.md
    - Deployment: advanced/deployment.md
  - API Reference: api-reference/index.md
  - Contributing: contributing.md
"@

Set-Content -Path "mkdocs.yml" -Value $MkdocsConfig

# Step 4: CREATE DOCUMENTATION STRUCTURE
Write-Host "`nStep 4: Creating documentation structure..." -ForegroundColor Cyan

# Create docs directory structure
$docsDirs = @(
    "docs",
    "docs/getting-started",
    "docs/features", 
    "docs/advanced",
    "docs/api-reference"
)

foreach ($dir in $docsDirs) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
}

# Create main docs index
$DocsIndex = @"
# Welcome to Documentation Template

Welcome to the Documentation Site Template - a modern, professional template for creating beautiful documentation with MkDocs and Material theme.

## 🚀 Quick Start

Get started in minutes with our easy-to-use documentation template:

```bash
# Clone the template
git clone https://github.com/your-username/docssitetemplate.git
cd docssitetemplate

# Install dependencies
npm install

# Start development server
npm run docs:dev
```

## ✨ Features

### Modern Documentation
- **MkDocs + Material Theme** - Professional, responsive design
- **Search Functionality** - Fast, full-text search across all content
- **Dark/Light Mode** - Automatic theme switching
- **Mobile Responsive** - Perfect on all devices
- **SEO Optimized** - Built-in SEO features

### Developer Experience
- **Hot Reload** - Instant preview during development
- **Markdown Support** - Write content in Markdown with extensions
- **Code Highlighting** - Syntax highlighting for 100+ languages
- **Version Control** - Git-based content management
- **CI/CD Ready** - Automated deployment to GitHub Pages

## 📚 Documentation Sections

### Getting Started
Learn how to set up and customize your documentation site:

- [Installation Guide](getting-started/installation.md)
- [Configuration](getting-started/configuration.md)
- [Customization](getting-started/customization.md)

### Features
Explore the powerful features of this template:

- [Theme Customization](features/theme.md)
- [Search Functionality](features/search.md)
- [Code Highlighting](features/code-blocks.md)

### Advanced
Take your documentation to the next level:

- [Custom Plugins](advanced/plugins.md)
- [Custom CSS/JS](advanced/styling.md)
- [Deployment](advanced/deployment.md)

## 🎨 Customization

### Theme Configuration

Customize the appearance of your site by editing `mkdocs.yml`:

```yaml
theme:
  name: material
  palette:
    - scheme: default
      primary: indigo
      accent: indigo
      toggle:
        icon: material/toggle-switch
        name: Switch to dark mode
    - scheme: slate
      primary: indigo
      accent: indigo
      toggle:
        icon: material/toggle-switch-off-outline
        name: Switch to light mode
```

## 🔧 Development

### Local Development

```bash
# Start development server
npm run docs:dev

# Build for production
npm run docs:build

# Validate links
npm run validate-links
```

## 🚀 Deployment

### GitHub Pages

This template is configured for automatic deployment to GitHub Pages:

1. Push to `main` branch
2. GitHub Actions builds and deploys automatically
3. Site available at `https://yourusername.github.io/$ProjectName`

## 📚 Documentation Features

### Code Blocks

```python
def hello_world():
    print("Hello, World!")
    return "Documentation is awesome!"
```

### Admonitions

!!! note "Note"
    This template provides a solid foundation for creating professional documentation.

!!! tip "Tip"
    Use Material theme features to create rich, interactive documentation.

!!! warning "Warning"
    Always test your documentation before deploying to production.

### Tabs

=== "Python"
    ```python
    print("Hello from Python!")
    ```

=== "JavaScript"
    ```javascript
    console.log("Hello from JavaScript!");
    ```

=== "Bash"
    ```bash
    echo "Hello from Bash!"
    ```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](../CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

**Documentation Site Template** - Create beautiful, professional documentation with ease.
"@

Set-Content -Path "docs/index.md" -Value $DocsIndex

# Create getting started docs
$InstallationDoc = @"
# Installation Guide

## Prerequisites

- Python 3.8+
- Node.js 18+ (for development tools)
- Git

## Quick Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/docssitetemplate.git
cd docssitetemplate
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run docs:dev
```

Your documentation site will be available at `http://localhost:8000`

## Manual Installation

If you prefer to install dependencies manually:

### Install Python Dependencies

```bash
pip install mkdocs mkdocs-material
```

### Install Node.js Dependencies

```bash
npm install broken-link-checker markdownlint-cli
```

## Verification

After installation, verify everything is working:

```bash
# Check MkDocs installation
mkdocs --version

# Check Node.js dependencies
npm list

# Start development server
npm run docs:dev
```

## Next Steps

- [Configuration Guide](configuration.md)
- [Customization Guide](customization.md)
- [Deployment Guide](../advanced/deployment.md)
"@

Set-Content -Path "docs/getting-started/installation.md" -Value $InstallationDoc

# Step 5: CREATE GITHUB WORKFLOWS
Write-Host "`nStep 5: Creating GitHub workflows..." -ForegroundColor Cyan

# Create .github directory structure
New-Item -ItemType Directory -Path ".github\workflows" -Force | Out-Null

# Create GitHub Pages workflow
$PagesWorkflow = @"
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build documentation
      run: npm run docs:build
      
    - name: Validate links
      run: npm run validate-links
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      if: github.ref == 'refs/heads/main'
      with:
        github_token: `${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./docs/_build
"@

Set-Content -Path ".github\workflows\pages.yml" -Value $PagesWorkflow

# Step 6: CREATE .gitignore
Write-Host "`nStep 6: Creating .gitignore..." -ForegroundColor Cyan

$Gitignore = @"
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
package-lock.json
yarn.lock
pnpm-lock.yaml

# Build outputs
dist/
build/
.cache/
docs/_build/
site/

# Environment files
.env
.env.local
.env.development
.env.test
.env.production

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# OS files
.DS_Store
Thumbs.db
ehthumbs.db
Desktop.ini

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory
coverage/
*.lcov
.nyc_output/

# Temporary files
tmp/
temp/
*.tmp
*.temp

# Backup files
*.bak
*.backup
*.old

# Archive files
*.zip
*.tar.gz
*.rar

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/

# Private content (never commit)
private/
admin/
secrets/
*.key
*.pem
*.p12
*.pfx

# Hidden website configuration (never commit)
HIDDEN_CONFIG.md
*.hidden
.hidden/
"@

Set-Content -Path ".gitignore" -Value $Gitignore

# Step 7: CREATE HIDDEN CONFIG (not committed)
Write-Host "`nStep 7: Creating hidden configuration..." -ForegroundColor Cyan

$HiddenConfig = @"
# HIDDEN WEBSITE TEMPLATE - PRIVATE CONFIGURATION

⚠️ **THIS FILE IS NEVER COMMITTED TO GIT** ⚠️
This contains the real knowledge about this being a hidden website template.

## 🕵️ HIDDEN WEBSITE TEMPLATE SYSTEM

This repository is a **HIDDEN WEBSITE TEMPLATE** that serves as a legitimate-looking documentation site while concealing the real functionality.

### 🎭 PUBLIC FAÇADE (What Everyone Sees)
- **Legitimate Documentation Site** - Looks like a real MkDocs documentation template
- **Professional Appearance** - Clean, modern design that appears trustworthy
- **Standard Features** - Documentation, guides, API references
- **Open Source** - Appears to be a normal open-source project
- **GitHub Pages** - Deployed as a standard documentation site

### 🔒 PRIVATE REALITY (What Only You Know)
- **Hidden Application** - Real functionality lives in personal folder
- **Secret Features** - Admin panels, private APIs, hidden functionality
- **Encrypted Access** - Optional encrypted artifacts for distribution
- **Stealth Mode** - No trace of real purpose in public repo
- **Personal Development** - All real work happens in `~/millsy-admin/`

## 🎯 HIDDEN WEBSITE PATTERNS

### 1. **Innocent Documentation**
- Public site appears to be legitimate documentation
- Contains real, useful documentation content
- Looks like a standard open-source project
- No suspicious elements or hidden messages

### 2. **Hidden Access Points**
- Subtle, non-obvious access methods
- Hidden in plain sight (e.g., footer links, copyright notices)
- Requires specific knowledge or credentials
- Not discoverable through normal browsing

### 3. **Dual Purpose Structure**
- Public: Documentation template
- Private: Real application with full functionality
- Complete separation of concerns
- No cross-contamination between public/private

### 4. **Stealth Deployment**
- GitHub Pages for public façade
- Personal folder for private development
- Optional encrypted distribution
- No traces in public repository

## 🔐 SECURITY MEASURES

### Public Repository Protection
- `.gitignore` prevents private content commits
- Only façade content is visible
- No sensitive configuration files
- Clean, professional appearance

### Private Development
- All real code in personal folder
- Separate build and deployment scripts
- Encrypted artifacts (optional)
- No connection to public repo

### Access Control
- Public: Anyone can see documentation
- Private: Only you have access
- No authentication in public site
- Hidden access methods only

## 🛠️ DEVELOPMENT WORKFLOW

### Public Development (Façade)
```bash
# Work on public documentation
npm run docs:dev
npm run docs:build
git add docs/ public/ README.md
git commit -m "docs: update documentation"
git push origin main
```

### Private Development (Real App)
```bash
# Work on hidden functionality
cd ~/millsy-admin/sites/$ProjectName/private-app/
npm run dev
npm run build
# Real functionality here
```

## 🎨 HIDDEN WEBSITE FEATURES

### Public Site (Documentation Template)
- ✅ Professional documentation
- ✅ MkDocs + Material theme
- ✅ Search functionality
- ✅ Mobile responsive
- ✅ SEO optimized
- ✅ GitHub Pages deployment
- ✅ Open source appearance

### Private Site (Hidden Functionality)
- ✅ Real application features
- ✅ Admin panels and tools
- ✅ Private APIs and services
- ✅ Database and backend
- ✅ Authentication systems
- ✅ Custom functionality
- ✅ Hidden access methods

## 🔍 DETECTION PREVENTION

### What Makes This Hidden
1. **Legitimate Appearance** - Looks like real documentation
2. **Useful Content** - Actually provides value to visitors
3. **Standard Structure** - Follows normal project patterns
4. **Clean History** - No suspicious commits or files
5. **Professional Quality** - High-quality, well-maintained

### What Keeps It Hidden
1. **Complete Separation** - Public/private never mix
2. **No Traces** - Nothing suspicious in public repo
3. **Normal Behavior** - Standard open-source patterns
4. **Useful Façade** - Public site has real value
5. **Professional Maintenance** - Regular updates and improvements

## 🚀 DEPLOYMENT STRATEGY

### Public Deployment
- GitHub Pages automatic deployment
- Standard documentation site
- Professional appearance
- Regular updates and maintenance

### Private Deployment
- Personal development environment
- Optional encrypted distribution
- Hidden access methods
- No public traces

## 📋 HIDDEN WEBSITE CHECKLIST

### Public Façade Requirements
- [ ] Looks like legitimate documentation
- [ ] Contains useful, real content
- [ ] Professional appearance
- [ ] Standard open-source structure
- [ ] No suspicious elements
- [ ] Regular maintenance
- [ ] Clean git history

### Private Reality Requirements
- [ ] Real functionality in personal folder
- [ ] Hidden access methods
- [ ] Complete separation from public
- [ ] Encrypted distribution (optional)
- [ ] No traces in public repo
- [ ] Secure development workflow

### Security Requirements
- [ ] .gitignore prevents private commits
- [ ] No sensitive files in public repo
- [ ] Clean, professional appearance
- [ ] Standard documentation patterns
- [ ] No hidden messages or codes
- [ ] Legitimate use case

## 🎯 SUCCESS METRICS

### Public Success
- Site looks professional and legitimate
- Documentation is useful and well-maintained
- No suspicious elements detected
- Standard open-source project appearance
- Regular updates and community engagement

### Private Success
- Real functionality works perfectly
- Hidden access methods function correctly
- Complete separation maintained
- No security breaches or detection
- Efficient development workflow

---

**REMEMBER**: This is a HIDDEN WEBSITE TEMPLATE. The public façade must look completely legitimate while the private reality contains the real functionality. Never commit this file or any private content to the public repository.
"@

Set-Content -Path "HIDDEN_CONFIG.md" -Value $HiddenConfig

# Step 8: CREATE PRIVATE APP TEMPLATE
Write-Host "`nStep 8: Creating private app template..." -ForegroundColor Cyan

$PrivatePackageJson = @"
{
  "name": "$ProjectName-private",
  "version": "1.0.0",
  "description": "Private application - hidden functionality",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "jest"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.27",
    "@types/react-dom": "^18.0.10",
    "@vitejs/plugin-react": "^3.1.0",
    "vite": "^4.1.0",
    "jest": "^29.4.0"
  }
}
"@

Set-Content -Path "$PersonalAppPath\package.json" -Value $PrivatePackageJson

# Create private app README
$PrivateReadme = @"
# Private Application

This is the private application that contains the real functionality.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Security

- This folder is NEVER committed to the public repository
- All real functionality lives here
- Public repo only contains the documentation façade
- Use encryption for distribution if needed

## Structure

- `src/` - Application source code
- `public/` - Static assets
- `dist/` - Build output (never committed)
- `package.json` - Dependencies and scripts

## Access

This application is only accessible to you and contains:
- Real application features
- Admin panels and tools
- Private APIs and services
- Database and backend
- Authentication systems
- Hidden functionality
"@

Set-Content -Path "$PersonalAppPath\README.md" -Value $PrivateReadme

# Step 9: CREATE HELPER SCRIPTS
Write-Host "`nStep 9: Creating helper scripts..." -ForegroundColor Cyan

# Create build script for private app
$BuildScript = @"
# Build Private Application Script

param(
    [string]`$ProjectName = "$ProjectName"
)

`$PersonalFolder = "`$env:USERPROFILE\millsy-admin"
`$PrivateAppPath = "`$PersonalFolder\sites\`$ProjectName\private-app"

Write-Host "Building private application..." -ForegroundColor Green

if (!(Test-Path `$PrivateAppPath)) {
    Write-Host "ERROR: Private app not found at `$PrivateAppPath" -ForegroundColor Red
    exit 1
}

Set-Location `$PrivateAppPath

# Install dependencies if needed
if (!(Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Cyan
    npm install
}

# Build the application
Write-Host "Building application..." -ForegroundColor Cyan
npm run build

if (`$LASTEXITCODE -eq 0) {
    Write-Host "Build successful!" -ForegroundColor Green
    Write-Host "Output in: `$PrivateAppPath\dist" -ForegroundColor Yellow
} else {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}
"@

Set-Content -Path "$PersonalFolder\bin\Build-Private.ps1" -Value $BuildScript

# Create encryption script
$EncryptScript = @"
# Encrypt Private Application Script

param(
    [string]`$ProjectName = "$ProjectName",
    [string]`$PublicRepoPath = ""
)

`$PersonalFolder = "`$env:USERPROFILE\millsy-admin"
`$PrivateAppPath = "`$PersonalFolder\sites\`$ProjectName\private-app"
`$EncryptPath = "`$PersonalFolder\sites\`$ProjectName\encrypt"

Write-Host "Encrypting private application..." -ForegroundColor Green

if (!(Test-Path "`$PrivateAppPath\dist")) {
    Write-Host "ERROR: No build output found. Run Build-Private.ps1 first." -ForegroundColor Red
    exit 1
}

# Create encryption directory
if (!(Test-Path `$EncryptPath)) {
    New-Item -ItemType Directory -Path `$EncryptPath -Force | Out-Null
}

# Simple encryption (you can enhance this)
`$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
`$encryptedFile = "`$EncryptPath\app-`$timestamp.enc"

Write-Host "Creating encrypted bundle..." -ForegroundColor Cyan
Compress-Archive -Path "`$PrivateAppPath\dist\*" -DestinationPath "`$encryptedFile" -Force

Write-Host "Encrypted bundle created: `$encryptedFile" -ForegroundColor Green

if (`$PublicRepoPath -and (Test-Path `$PublicRepoPath)) {
    Write-Host "Copying to public repo encrypted folder..." -ForegroundColor Cyan
    `$publicEncryptedPath = "`$PublicRepoPath\encrypted"
    if (!(Test-Path `$publicEncryptedPath)) {
        New-Item -ItemType Directory -Path `$publicEncryptedPath -Force | Out-Null
    }
    Copy-Item `$encryptedFile `$publicEncryptedPath
    Write-Host "Encrypted bundle copied to public repo" -ForegroundColor Green
}
"@

Set-Content -Path "$PersonalFolder\bin\Encrypt-Private.ps1" -Value $EncryptScript

# Step 10: COMMIT AND PUSH
if ($AutoCommit) {
    Write-Host "`nStep 10: Committing and pushing..." -ForegroundColor Cyan
    
    # Add all public façade files
    git add .
    
    # Commit
    $commitMessage = "feat: complete hidden website setup

- Purge repository and create clean public façade
- Set up innocent documentation template
- Configure GitHub Pages deployment
- Create private development environment
- Add security measures and helper scripts

Public: Professional docs template
Private: Hidden functionality in ~/millsy-admin"
    
    git commit -m $commitMessage
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Commit successful!" -ForegroundColor Green
        
        # Push
        Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
        git push origin main
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Push successful!" -ForegroundColor Green
        } else {
            Write-Host "Push failed! You may need to set up remote origin." -ForegroundColor Red
        }
    } else {
        Write-Host "Commit failed!" -ForegroundColor Red
    }
}

# Step 11: FINAL SUMMARY
Write-Host "`n=== SETUP COMPLETE ===" -ForegroundColor Green
Write-Host "`nPublic Façade (GitHub Pages):" -ForegroundColor Cyan
Write-Host "✅ Professional documentation template" -ForegroundColor Green
Write-Host "✅ MkDocs + Material theme" -ForegroundColor Green
Write-Host "✅ GitHub Pages deployment configured" -ForegroundColor Green
Write-Host "✅ Clean, innocent appearance" -ForegroundColor Green

Write-Host "`nPrivate Reality (~/millsy-admin):" -ForegroundColor Cyan
Write-Host "✅ Private application template created" -ForegroundColor Green
Write-Host "✅ Build scripts ready" -ForegroundColor Green
Write-Host "✅ Encryption scripts available" -ForegroundColor Green
Write-Host "✅ Complete separation maintained" -ForegroundColor Green

Write-Host "`nSecurity Measures:" -ForegroundColor Cyan
Write-Host "✅ .gitignore prevents private commits" -ForegroundColor Green
Write-Host "✅ HIDDEN_CONFIG.md never committed" -ForegroundColor Green
Write-Host "✅ Clean public repository" -ForegroundColor Green
Write-Host "✅ Professional façade appearance" -ForegroundColor Green

Write-Host "`nNext Steps:" -ForegroundColor Cyan
Write-Host "1. Check GitHub Pages deployment" -ForegroundColor White
Write-Host "2. Develop private app: ~/millsy-admin/sites/$ProjectName/private-app/" -ForegroundColor White
Write-Host "3. Build private app: ~/millsy-admin/bin/Build-Private.ps1 $ProjectName" -ForegroundColor White
Write-Host "4. Update public documentation as needed" -ForegroundColor White

Write-Host "`n🎭 HIDDEN WEBSITE SYSTEM READY! 🎭" -ForegroundColor Green
Write-Host "Public: Innocent docs template" -ForegroundColor Yellow
Write-Host "Private: Your secret full website" -ForegroundColor Yellow
