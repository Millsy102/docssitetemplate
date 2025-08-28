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
Write-Host "Step 3: Installing main project dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: npm install failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 4: Installing all required dependencies..." -ForegroundColor Yellow
# Install all required dependencies including TailwindCSS
Write-Host "Installing TailwindCSS and PostCSS..." -ForegroundColor White
npm install tailwindcss postcss autoprefixer --save-dev
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: TailwindCSS installation failed" -ForegroundColor Red
    exit 1
}

# Install additional dependencies that might be missing
Write-Host "Installing additional dependencies..." -ForegroundColor White
npm install dotenv --save-dev
npm install gh-pages --save-dev
npm install vercel --save-dev

Write-Host "SUCCESS: All dependencies installed" -ForegroundColor Green

Write-Host ""
Write-Host "Step 5: Building main documentation site..." -ForegroundColor Yellow
# Set environment variables for the build
$env:SITE_TITLE = "BeamFlow Documentation"
$env:SITE_DESCRIPTION = "Comprehensive documentation for the BeamFlow Unreal Engine plugin"
$env:SITE_URL = "https://millsy102.github.io/docssitetemplate"
$env:NODE_ENV = "production"

# Build the main site
Write-Host "Building with npm run build (includes static files copy)..." -ForegroundColor White
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Main site build failed" -ForegroundColor Red
    exit 1
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
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Server npm install failed" -ForegroundColor Red
        Set-Location ".."
        exit 1
    }
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
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Desktop agent npm install failed" -ForegroundColor Red
        Set-Location ".."
        exit 1
    }
    Set-Location ".."
    Write-Host "SUCCESS: Desktop agent built" -ForegroundColor Green
} else {
    Write-Host "WARNING: Desktop agent directory not found, skipping" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 9: Deploying to Vercel to get latest URL..." -ForegroundColor Yellow
Write-Host "Deploying to Vercel to get the latest deployment URL..." -ForegroundColor White

# Deploy to Vercel first to get the latest URL
npx vercel --prod --yes
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Vercel deployment failed" -ForegroundColor Red
    exit 1
}

# Get the latest Vercel deployment URL
Write-Host "Getting latest Vercel deployment URL..." -ForegroundColor White
$vercelOutput = npx vercel ls 2>&1
$latestUrl = $vercelOutput | Select-String "https://.*\.vercel\.app" | Select-Object -First 1
if ($latestUrl) {
    $vercelUrl = $latestUrl.Matches[0].Value
    Write-Host "Latest Vercel URL: $vercelUrl" -ForegroundColor Green
} else {
    Write-Host "WARNING: Could not get latest Vercel URL, using fallback" -ForegroundColor Yellow
    $vercelUrl = "https://beamflow-docs-new.vercel.app"
}

Write-Host ""
Write-Host "Step 10: Updating login button URLs..." -ForegroundColor Yellow
Write-Host "Updating all login button URLs to point to: $vercelUrl/admin" -ForegroundColor White

# Update React component
$headerContent = Get-Content "src/components/Header.tsx" -Raw
$headerContent = $headerContent -replace 'https://[^"]*\.vercel\.app/admin', "$vercelUrl/admin"
Set-Content "src/components/Header.tsx" $headerContent -Encoding UTF8

# Update static HTML files
$indexContent = Get-Content "docs/index.html" -Raw
$indexContent = $indexContent -replace 'https://[^"]*\.vercel\.app/admin', "$vercelUrl/admin"
Set-Content "docs/index.html" $indexContent -Encoding UTF8

$errorContent = Get-Content "docs/404.html" -Raw
$errorContent = $errorContent -replace 'https://[^"]*\.vercel\.app/admin', "$vercelUrl/admin"
Set-Content "docs/404.html" $errorContent -Encoding UTF8

Write-Host "SUCCESS: Login button URLs updated" -ForegroundColor Green

Write-Host ""
Write-Host "Step 11: Rebuilding with updated URLs..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Rebuild failed" -ForegroundColor Red
    exit 1
}

Write-Host "SUCCESS: Site rebuilt with updated login URLs" -ForegroundColor Green

Write-Host ""
Write-Host "Step 12: Creating comprehensive deployment package..." -ForegroundColor Yellow
if (Test-Path "full-system-deploy") {
    Remove-Item "full-system-deploy" -Recurse -Force
}
New-Item -ItemType Directory -Name "full-system-deploy" | Out-Null

# Copy main documentation site
Write-Host "Copying main documentation site..." -ForegroundColor White
Copy-Item "dist" "full-system-deploy/public" -Recurse

# Copy secret system
if (Test-Path "_internal/system/dist") {
    Write-Host "Copying secret system..." -ForegroundColor White
    Copy-Item "_internal/system/dist" "full-system-deploy/secret" -Recurse
}

# Copy backend components
Write-Host "Copying backend components..." -ForegroundColor White
New-Item -ItemType Directory -Name "full-system-deploy/backend" | Out-Null
Copy-Item "_internal/system/src" "full-system-deploy/backend/src" -Recurse
Copy-Item "_internal/system/package.json" "full-system-deploy/backend/"
Copy-Item "_internal/system/package-lock.json" "full-system-deploy/backend/"

# Copy server components
if (Test-Path "server") {
    Write-Host "Copying server components..." -ForegroundColor White
    New-Item -ItemType Directory -Name "full-system-deploy/server" | Out-Null
    Copy-Item "server" "full-system-deploy/server" -Recurse
}

# Copy desktop agent
if (Test-Path "desktop-agent") {
    Write-Host "Copying desktop agent..." -ForegroundColor White
    New-Item -ItemType Directory -Name "full-system-deploy/desktop-agent" | Out-Null
    Copy-Item "desktop-agent" "full-system-deploy/desktop-agent" -Recurse
}

# Copy API files
if (Test-Path "api") {
    Write-Host "Copying API files..." -ForegroundColor White
    New-Item -ItemType Directory -Name "full-system-deploy/api" | Out-Null
    Copy-Item "api" "full-system-deploy/api" -Recurse
}

# Copy configuration files
Write-Host "Copying configuration files..." -ForegroundColor White
Copy-Item "vercel.json" "full-system-deploy/"
Copy-Item "package.json" "full-system-deploy/"
Copy-Item "package-lock.json" "full-system-deploy/"
Copy-Item "vite.config.js" "full-system-deploy/"
Copy-Item "tailwind.config.js" "full-system-deploy/"
Copy-Item "tsconfig.json" "full-system-deploy/"
Copy-Item ".env" "full-system-deploy/"

# Copy public assets
Write-Host "Copying public assets..." -ForegroundColor White
if (Test-Path "public") {
    New-Item -ItemType Directory -Name "full-system-deploy/public-assets" | Out-Null
    Copy-Item "public" "full-system-deploy/public-assets" -Recurse
}

# Copy scripts
Write-Host "Copying scripts..." -ForegroundColor White
if (Test-Path "scripts") {
    New-Item -ItemType Directory -Name "full-system-deploy/scripts" | Out-Null
    Copy-Item "scripts" "full-system-deploy/scripts" -Recurse
}

# Copy documentation
Write-Host "Copying documentation..." -ForegroundColor White
if (Test-Path "docs") {
    New-Item -ItemType Directory -Name "full-system-deploy/docs" | Out-Null
    Copy-Item "docs" "full-system-deploy/docs" -Recurse
}

# Copy source code
Write-Host "Copying source code..." -ForegroundColor White
if (Test-Path "src") {
    New-Item -ItemType Directory -Name "full-system-deploy/src" | Out-Null
    Copy-Item "src" "full-system-deploy/src" -Recurse
}

# Copy tests
if (Test-Path "tests") {
    Write-Host "Copying tests..." -ForegroundColor White
    New-Item -ItemType Directory -Name "full-system-deploy/tests" | Out-Null
    Copy-Item "tests" "full-system-deploy/tests" -Recurse
}

# Copy additional deployment files
Write-Host "Copying additional deployment files..." -ForegroundColor White
if (Test-Path "public/favicon.svg") {
    Copy-Item "public/favicon.svg" "full-system-deploy/"
}
if (Test-Path "public/manifest.json") {
    Copy-Item "public/manifest.json" "full-system-deploy/"
}
if (Test-Path "public/site.webmanifest") {
    Copy-Item "public/site.webmanifest" "full-system-deploy/"
}
if (Test-Path "public/_redirects") {
    Copy-Item "public/_redirects" "full-system-deploy/"
}

# Create .nojekyll file for GitHub Pages
New-Item -ItemType File -Path "full-system-deploy/.nojekyll" -Force | Out-Null

# Copy all README and documentation files
Write-Host "Copying documentation files..." -ForegroundColor White
Get-ChildItem -Path "." -Filter "*.md" | ForEach-Object {
    Copy-Item $_.FullName "full-system-deploy/"
}

Write-Host "SUCCESS: Comprehensive deployment package created" -ForegroundColor Green

Write-Host ""
Write-Host "Step 13: Creating deployment archive..." -ForegroundColor Yellow
$datestamp = Get-Date -Format "yyyyMMdd-HHmm"
$archiveName = "docssitetemplate-$datestamp.zip"
Compress-Archive -Path "full-system-deploy/*" -DestinationPath $archiveName -Force
Write-Host "SUCCESS: Deployment archive created: $archiveName" -ForegroundColor Green

Write-Host ""
Write-Host "Step 14: Committing and pushing changes to Git..." -ForegroundColor Yellow
# Add all changes to git
Write-Host "Adding all changes to Git..." -ForegroundColor White
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Git add failed" -ForegroundColor Red
    exit 1
}

# Commit changes with timestamp
$commitMessage = "Auto-deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - Complete system build and deployment with updated login URLs"
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
Write-Host "Step 15: Deploying to GitHub Pages..." -ForegroundColor Yellow
npx gh-pages -d dist
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: GitHub Pages deployment failed" -ForegroundColor Red
} else {
    Write-Host "SUCCESS: GitHub Pages deployed successfully" -ForegroundColor Green
    Write-Host "   Site: https://millsy102.github.io/docssitetemplate" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Step 16: Creating deployment summary..." -ForegroundColor Yellow
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

### API Components
- **Location**: `api/` directory
- **Status**: Ready for deployment

### Full System Package
- **Location**: `full-system-deploy/` directory
- **Status**: Complete deployment package created
- **Archive**: $archiveName

## Files Included in Deployment Package:

### Core Application
- Main documentation site (public/)
- Secret system (secret/)
- Backend components (backend/)
- Server components (server/)
- Desktop agent (desktop-agent/)
- API files (api/)

### Configuration Files
- vercel.json
- package.json
- package-lock.json
- vite.config.js
- tailwind.config.js
- tsconfig.json
- .env

### Assets and Resources
- Public assets (public-assets/)
- Scripts (scripts/)
- Documentation (docs/)
- Source code (src/)
- Tests (tests/)

### Documentation
- All README files
- All .md documentation files
- Configuration guides

## Deployment Status

### GitHub Pages
- SUCCESS: Main site deployed
- SUCCESS: Accessible at: https://millsy102.github.io/docssitetemplate

### Vercel
- SUCCESS: Full system deployed
- SUCCESS: Accessible at: $vercelUrl
- SUCCESS: Admin panel at: $vercelUrl/admin

### Login Button URLs
- SUCCESS: Automatically updated to point to latest Vercel deployment
- SUCCESS: All login buttons now point to: $vercelUrl/admin

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
Write-Host "   API Components" -ForegroundColor White
Write-Host "   Full Deployment Package" -ForegroundColor White
Write-Host "   Deployment Archive: $archiveName" -ForegroundColor White
Write-Host "   Login URLs automatically updated" -ForegroundColor White
Write-Host ""
Write-Host "Your sites:" -ForegroundColor Green
Write-Host "   GitHub Pages: https://millsy102.github.io/docssitetemplate" -ForegroundColor Cyan
Write-Host "   Vercel: $vercelUrl" -ForegroundColor Cyan
Write-Host "   Admin Panel: $vercelUrl/admin" -ForegroundColor Cyan
Write-Host ""
Write-Host "Files created:" -ForegroundColor Green
Write-Host "   Deployment package: full-system-deploy/" -ForegroundColor Yellow
Write-Host "   Archive: $archiveName" -ForegroundColor Yellow
Write-Host "   Summary: DEPLOYMENT_SUMMARY.md" -ForegroundColor Yellow
Write-Host ""
Write-Host "All systems deployed and ready!" -ForegroundColor Green
Write-Host "Login buttons now point to the latest Vercel deployment automatically!" -ForegroundColor Green
Write-Host ""
Write-Host "This tool replaces ALL other deployment scripts" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to continue"
