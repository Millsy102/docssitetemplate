# Repository Setup Script for Docs Façade Pattern
# This script prepares the repository for secure public deployment

param(
    [string]$ProjectName = "docssitetemplate",
    [string]$PersonalFolder = "$env:USERPROFILE\millsy-admin"
)

Write-Host "Setting up repository for docs façade pattern..." -ForegroundColor Green
Write-Host "This will move private content and prepare a clean public façade" -ForegroundColor Yellow

# Step 1: Ensure personal folder exists
$PersonalAppPath = "$PersonalFolder\sites\$ProjectName\private-app"
if (!(Test-Path $PersonalAppPath)) {
    Write-Host "Creating personal folder structure..." -ForegroundColor Cyan
    & "$PSScriptRoot\setup-personal-folder.ps1" -ProjectName $ProjectName
}

# Step 2: Move private content to personal folder
Write-Host "Moving private content to personal folder..." -ForegroundColor Cyan

$PrivateContent = @(
    "src",
    "private",
    "admin-docs",
    "dist",
    "node_modules",
    "coverage",
    ".snapshots"
)

foreach ($item in $PrivateContent) {
    if (Test-Path $item) {
        $targetPath = "$PersonalAppPath\$item"
        if (Test-Path $targetPath) {
            Write-Host "Removing existing $item from personal folder..." -ForegroundColor Yellow
            Remove-Item $targetPath -Recurse -Force
        }
        Write-Host "Moving $item to personal folder..." -ForegroundColor Green
        Move-Item $item $PersonalAppPath
    }
}

# Step 3: Move sensitive configuration files
$SensitiveFiles = @(
    "package.json",
    "package-lock.json",
    "vite.config.js",
    "webpack.config.js",
    "tailwind.config.js",
    "postcss.config.js",
    "jest.config.js",
    "jest.setup.js",
    ".eslintrc.js",
    ".prettierrc",
    ".markdownlint.json",
    "lighthouserc.js",
    ".lighthouserc.js",
    "env.example"
)

foreach ($file in $SensitiveFiles) {
    if (Test-Path $file) {
        Write-Host "Moving $file to personal folder..." -ForegroundColor Green
        Copy-Item $file "$PersonalAppPath\$file"
    }
}

# Step 4: Create public façade package.json
Write-Host "Creating public façade package.json..." -ForegroundColor Cyan
$PublicPackageJson = @"
{
  "name": "$ProjectName-façade",
  "version": "1.0.0",
  "description": "Public documentation façade - private app lives in ~/millsy-admin",
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
    "façade",
    "template"
  ],
  "author": "Private Development",
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

# Step 5: Update GitHub workflows for façade only
Write-Host "Updating GitHub workflows for façade deployment..." -ForegroundColor Cyan

$FacadeWorkflow = @"
name: Deploy Façade to GitHub Pages

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

Set-Content -Path ".github\workflows\pages.yml" -Value $FacadeWorkflow

# Step 6: Create security notice
Write-Host "Creating security notice..." -ForegroundColor Cyan
$SecurityNotice = @"
# SECURITY NOTICE

This repository contains ONLY the public documentation façade.

## Private Content Location
All private application code, sensitive configuration, and real features live in:
`$PersonalFolder\sites\$ProjectName\private-app\`

## What's Public (This Repository)
- Documentation templates
- Public guides and examples
- GitHub Pages configuration
- Basic setup instructions

## What's Private (Personal Folder)
- Full application source code
- Database configurations
- API implementations
- Admin tools and scripts
- Sensitive environment variables
- Build artifacts and dependencies

## Development Workflow
1. Develop in personal folder: `$PersonalFolder\sites\$ProjectName\private-app\`
2. Build with: `$PersonalFolder\bin\Build-Private.ps1 $ProjectName`
3. Update public façade documentation as needed
4. Commit only façade content to this repository

**NEVER commit private content to this repository!**
"@

Set-Content -Path "SECURITY.md" -Value $SecurityNotice

# Step 7: Create .gitattributes for additional protection
Write-Host "Creating .gitattributes for additional protection..." -ForegroundColor Cyan
$GitAttributes = @"
# Ensure consistent line endings
* text=auto

# Protect sensitive files
*.env* filter=git-crypt diff=git-crypt
*.key filter=git-crypt diff=git-crypt
*.pem filter=git-crypt diff=git-crypt
*.p12 filter=git-crypt diff=git-crypt
*.pfx filter=git-crypt diff=git-crypt

# Binary files
*.png binary
*.jpg binary
*.jpeg binary
*.gif binary
*.ico binary
*.pdf binary
*.zip binary
*.tar.gz binary
*.rar binary

# Documentation
*.md text diff=markdown
*.txt text
*.html text
*.css text
*.js text
*.json text
*.yml text
*.yaml text
"@

Set-Content -Path ".gitattributes" -Value $GitAttributes

# Step 8: Create deployment checklist
Write-Host "Creating deployment checklist..." -ForegroundColor Cyan
$DeploymentChecklist = @"
# Deployment Checklist

## Pre-Deployment Checks
- [ ] All private content moved to personal folder
- [ ] Only façade content remains in repository
- [ ] .gitignore properly configured
- [ ] GitHub workflows updated for façade only
- [ ] Security notice added
- [ ] Documentation updated

## Files to Commit (Public Façade Only)
- [ ] public/
- [ ] docs/
- [ ] scripts/setup-*.ps1
- [ ] scripts/setup-*.sh
- [ ] .github/
- [ ] README.md
- [ ] SECURITY.md
- [ ] .gitignore
- [ ] .gitattributes
- [ ] package.json (façade version)
- [ ] mkdocs.yml
- [ ] encrypted/ (if using encrypted pattern)

## Files NOT to Commit (Private)
- [ ] src/ (moved to personal folder)
- [ ] private/ (moved to personal folder)
- [ ] admin-docs/ (moved to personal folder)
- [ ] dist/ (moved to personal folder)
- [ ] node_modules/ (moved to personal folder)
- [ ] coverage/ (moved to personal folder)
- [ ] .snapshots/ (moved to personal folder)

## Post-Deployment
- [ ] Test GitHub Pages deployment
- [ ] Verify private content is not accessible
- [ ] Test build scripts in personal folder
- [ ] Update documentation links
"@

Set-Content -Path "DEPLOYMENT_CHECKLIST.md" -Value $DeploymentChecklist

Write-Host "`nRepository setup complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Review the changes and deployment checklist" -ForegroundColor White
Write-Host "2. Test the build in personal folder: $PersonalFolder\bin\Build-Private.ps1 $ProjectName" -ForegroundColor White
Write-Host "3. Commit and push the clean façade repository" -ForegroundColor White
Write-Host "`nPrivate content is now safely in: $PersonalAppPath" -ForegroundColor Yellow
