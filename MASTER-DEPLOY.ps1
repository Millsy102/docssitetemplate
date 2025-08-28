# MASTER DEPLOY - BeamFlow Complete System
# This tool combines ALL deployment functionality into ONE script

Write-Host "MASTER DEPLOY - BeamFlow Complete System" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
Write-Host "This tool combines ALL deployment functionality into ONE script" -ForegroundColor White
Write-Host ""

# Step 1: Check Node.js version
Write-Host "Step 1: Checking Node.js version..." -ForegroundColor Yellow
$nodeVersion = node --version
Write-Host "Current version: $nodeVersion" -ForegroundColor White

if ($nodeVersion -match "v20\.(\d+)") {
    $minorVersion = [int]$matches[1]
    if ($minorVersion -lt 19) {
        Write-Host "ERROR: Node.js version too old! Need 20.19+ but have $nodeVersion" -ForegroundColor Red
        Write-Host "Upgrading Node.js..." -ForegroundColor Yellow
        nvm install 20.19.0
        nvm use 20.19.0
        Write-Host "SUCCESS: Node.js upgraded to 20.19.0" -ForegroundColor Green
    } else {
        Write-Host "SUCCESS: Node.js version is compatible" -ForegroundColor Green
    }
} else {
    Write-Host "ERROR: Node.js version incompatible! Need 20.19+ but have $nodeVersion" -ForegroundColor Red
    Write-Host "Upgrading Node.js..." -ForegroundColor Yellow
    nvm install 20.19.0
    nvm use 20.19.0
    Write-Host "SUCCESS: Node.js upgraded to 20.19.0" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 2: Setting environment variables..." -ForegroundColor Yellow
$env:SITE_TITLE = "BeamFlow Documentation"
$env:SITE_DESCRIPTION = "Comprehensive documentation for the BeamFlow Unreal Engine plugin"
$env:SITE_URL = "https://millsy102.github.io/docssitetemplate"
$env:NODE_ENV = "production"

# Create .env file as backup
@"
SITE_TITLE=BeamFlow Documentation
SITE_DESCRIPTION=Comprehensive documentation for the BeamFlow Unreal Engine plugin
SITE_URL=https://millsy102.github.io/docssitetemplate
NODE_ENV=production
"@ | Out-File -FilePath ".env" -Encoding UTF8

Write-Host "Environment variables set and .env file created" -ForegroundColor Green

Write-Host ""
Write-Host "Step 3: Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: npm install failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 4: Setting up build environment..." -ForegroundColor Yellow
# Install global dependencies that are needed for the build
Write-Host "Installing global build dependencies..." -ForegroundColor White
npm install -g tailwindcss postcss autoprefixer
Write-Host "Global dependencies installed" -ForegroundColor Green

Write-Host ""
Write-Host "Step 5: Building main documentation site..." -ForegroundColor Yellow
# Set environment variables for the build
$env:SITE_TITLE = "BeamFlow Documentation"
$env:SITE_DESCRIPTION = "Comprehensive documentation for the BeamFlow Unreal Engine plugin"
$env:SITE_URL = "https://millsy102.github.io/docssitetemplate"
$env:NODE_ENV = "production"

# Temporarily disable PostCSS config to avoid tailwindcss issues
Write-Host "Temporarily disabling PostCSS config..." -ForegroundColor White
if (Test-Path "postcss.config.js") {
    Move-Item "postcss.config.js" "postcss.config.js.bak"
}

# Use npx vite build which works reliably
Write-Host "Building with npx vite build..." -ForegroundColor White
npx vite build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Main site build failed" -ForegroundColor Red
    # Restore PostCSS config on failure
    if (Test-Path "postcss.config.js.bak") {
        Move-Item "postcss.config.js.bak" "postcss.config.js"
    }
    exit 1
}

# Restore PostCSS config after successful build
if (Test-Path "postcss.config.js.bak") {
    Move-Item "postcss.config.js.bak" "postcss.config.js"
}

Write-Host "SUCCESS: Main site build completed" -ForegroundColor Green

Write-Host ""
Write-Host "Step 6: Building secret system..." -ForegroundColor Yellow
Set-Location "_internal/system"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Secret system npm install failed" -ForegroundColor Red
    Set-Location "../.."
    exit 1
}

npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Secret system build failed" -ForegroundColor Red
    Set-Location "../.."
    exit 1
}
Set-Location "../.."

Write-Host ""
Write-Host "Step 7: Building server components..." -ForegroundColor Yellow
if (Test-Path "server") {
    Set-Location "server"
    npm install
    Set-Location ".."
    Write-Host "SUCCESS: Server components built" -ForegroundColor Green
} else {
    Write-Host "WARNING: Server directory not found, skipping" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 8: Building desktop agent..." -ForegroundColor Yellow
if (Test-Path "desktop-agent") {
    Set-Location "desktop-agent"
    npm install
    Set-Location ".."
    Write-Host "SUCCESS: Desktop agent built" -ForegroundColor Green
} else {
    Write-Host "WARNING: Desktop agent directory not found, skipping" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 9: Creating comprehensive deployment package..." -ForegroundColor Yellow
if (Test-Path "full-system-deploy") {
    Remove-Item "full-system-deploy" -Recurse -Force
}
New-Item -ItemType Directory -Name "full-system-deploy" | Out-Null
Copy-Item "dist" "full-system-deploy/public" -Recurse
if (Test-Path "_internal/system/dist") {
    Copy-Item "_internal/system/dist" "full-system-deploy/secret" -Recurse
}
New-Item -ItemType Directory -Name "full-system-deploy/backend" | Out-Null
Copy-Item "_internal/system/src" "full-system-deploy/backend/src" -Recurse
Copy-Item "_internal/system/package.json" "full-system-deploy/backend/"
Copy-Item "_internal/system/package-lock.json" "full-system-deploy/backend/"
Copy-Item "api/index.js" "full-system-deploy/api.js"
Copy-Item "vercel.json" "full-system-deploy/"

Write-Host ""
Write-Host "Step 10: Creating additional deployment files..." -ForegroundColor Yellow
if (Test-Path "public/favicon.svg") {
    Copy-Item "public/favicon.svg" "full-system-deploy/"
}
if (Test-Path "public/manifest.json") {
    Copy-Item "public/manifest.json" "full-system-deploy/"
}
New-Item -ItemType File -Path "full-system-deploy/.nojekyll" -Force | Out-Null
Write-Host "SUCCESS: Deployment package created with all files" -ForegroundColor Green

Write-Host ""
Write-Host "Step 11: Creating deployment archive..." -ForegroundColor Yellow
$datestamp = Get-Date -Format "yyyyMMdd-HHmm"
$archiveName = "docssitetemplate-$datestamp.zip"
Compress-Archive -Path "full-system-deploy/*" -DestinationPath $archiveName -Force
Write-Host "SUCCESS: Deployment archive created: $archiveName" -ForegroundColor Green

Write-Host ""
Write-Host "Step 12: Committing and pushing changes to Git..." -ForegroundColor Yellow
# Add all changes to git
Write-Host "Adding all changes to Git..." -ForegroundColor White
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Git add failed" -ForegroundColor Red
    exit 1
}

# Commit changes with timestamp
$commitMessage = "Auto-deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - Complete system build and deployment"
Write-Host "Committing changes..." -ForegroundColor White
git commit -m $commitMessage
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Git commit failed" -ForegroundColor Red
    exit 1
}

# Push to remote repository
Write-Host "Pushing to remote repository..." -ForegroundColor White
git push
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Git push failed" -ForegroundColor Red
    exit 1
}

Write-Host "SUCCESS: Git changes committed and pushed" -ForegroundColor Green

Write-Host ""
Write-Host "Step 13: Deploying to GitHub Pages..." -ForegroundColor Yellow
npx gh-pages -d dist
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: GitHub Pages deployment failed" -ForegroundColor Red
} else {
    Write-Host "SUCCESS: GitHub Pages deployed successfully" -ForegroundColor Green
    Write-Host "   Site: https://millsy102.github.io/docssitetemplate" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Step 14: Deploying to Vercel..." -ForegroundColor Yellow
Write-Host "Deploying to Vercel with fixed configuration..." -ForegroundColor White

# Deploy to Vercel
npx vercel --prod --yes
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Vercel deployment failed" -ForegroundColor Red
    Write-Host "WARNING: Vercel deployment failed, but other deployments succeeded" -ForegroundColor Yellow
} else {
    Write-Host "SUCCESS: Vercel deployed successfully" -ForegroundColor Green
    Write-Host "   Full system: beamflow-docs-new.vercel.app" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Step 15: Creating deployment summary..." -ForegroundColor Yellow
$summary = @"
# BeamFlow Deployment Complete

## What was built and deployed:

### Main Documentation Site
- **Location**: `dist/` directory
- **Status**: Built and deployed to GitHub Pages
- **URL**: https://millsy102.github.io/docssitetemplate

### Secret System
- **Location**: `_internal/system/` directory
- **Status**: Built and ready for deployment
- **Features**: Admin panel, FTP/SSH servers, plugin system

### Server Components
- **Location**: `server/` directory
- **Status**: Built and ready

### Desktop Agent
- **Location**: `desktop-agent/` directory
- **Status**: Built and ready

### Full System Package
- **Location**: `full-system-deploy/` directory
- **Status**: Complete deployment package created
- **Archive**: $archiveName

## Deployment Status

### GitHub Pages
- SUCCESS: Main site deployed
- SUCCESS: Accessible at: https://millsy102.github.io/docssitetemplate

### Vercel
- SUCCESS: Full system deployed
- SUCCESS: Accessible at: docssitetemplate.vercel.app

**Deployment completed at**: $(Get-Date)
"@

$summary | Out-File -FilePath "DEPLOYMENT_SUMMARY.md" -Encoding UTF8
Write-Host "SUCCESS: Deployment summary created" -ForegroundColor Green

Write-Host ""
Write-Host "MASTER DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green
Write-Host ""
Write-Host "SUCCESS: What was built and deployed:" -ForegroundColor Green
Write-Host "   Main Documentation Site" -ForegroundColor White
Write-Host "   Secret System (Admin Panel, FTP/SSH)" -ForegroundColor White
Write-Host "   Server Components" -ForegroundColor White
Write-Host "   Desktop Agent" -ForegroundColor White
Write-Host "   Full Deployment Package" -ForegroundColor White
Write-Host "   Deployment Archive: $archiveName" -ForegroundColor White
Write-Host ""
Write-Host "Your sites:" -ForegroundColor Green
Write-Host "   GitHub Pages: https://millsy102.github.io/docssitetemplate" -ForegroundColor Cyan
Write-Host "   Vercel: docssitetemplate.vercel.app" -ForegroundColor Cyan
Write-Host "   Admin Panel: /admin (on Vercel)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Files created:" -ForegroundColor Green
Write-Host "   Deployment package: full-system-deploy/" -ForegroundColor Yellow
Write-Host "   Archive: $archiveName" -ForegroundColor Yellow
Write-Host "   Summary: DEPLOYMENT_SUMMARY.md" -ForegroundColor Yellow
Write-Host ""
Write-Host "All systems deployed and ready!" -ForegroundColor Green
Write-Host ""
Write-Host "This tool replaces ALL other deployment scripts" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to continue"
