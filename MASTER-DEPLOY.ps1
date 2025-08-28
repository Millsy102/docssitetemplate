# GITHUB PAGES DEPLOY - BeamFlow Documentation Site
# Simplified deployment script for GitHub Pages only

Write-Host "GITHUB PAGES DEPLOY - BeamFlow Documentation" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host "Deploying BeamFlow documentation to GitHub Pages" -ForegroundColor White
Write-Host ""

# Step 1: Check Node.js version
Write-Host "Step 1: Checking Node.js version..." -ForegroundColor Yellow
$nodeVersion = node --version
Write-Host "Current version: $nodeVersion" -ForegroundColor White

if ($nodeVersion -match "v20\.(\d+)") {
    $minorVersion = [int]$matches[1]
    if ($minorVersion -lt 19) {
        Write-Host "ERROR: Node.js version too old! Need 20.19+ but have $nodeVersion" -ForegroundColor Red
        exit 1
    } else {
        Write-Host "SUCCESS: Node.js version is compatible" -ForegroundColor Green
    }
} else {
    Write-Host "ERROR: Node.js version incompatible! Need 20.19+ but have $nodeVersion" -ForegroundColor Red
    exit 1
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

# Install required build dependencies
Write-Host "Installing build dependencies..." -ForegroundColor White
npm install tailwindcss postcss autoprefixer --save-dev
npm install gh-pages --save-dev

Write-Host "SUCCESS: All dependencies installed" -ForegroundColor Green

Write-Host ""
Write-Host "Step 4: Building documentation site..." -ForegroundColor Yellow
Write-Host "Building with npm run build (includes static files copy)..." -ForegroundColor White
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Build failed" -ForegroundColor Red
    exit 1
}

Write-Host "SUCCESS: Documentation site built successfully" -ForegroundColor Green

Write-Host ""
Write-Host "Step 5: Deploying to GitHub Pages..." -ForegroundColor Yellow
Write-Host "Deploying to GitHub Pages using gh-pages..." -ForegroundColor White

npx gh-pages -d dist
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: GitHub Pages deployment failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "SUCCESS: Deployment completed!" -ForegroundColor Green
Write-Host "Your site is now live at: https://millsy102.github.io/docssitetemplate" -ForegroundColor Cyan
Write-Host ""
Write-Host "Admin panel available at: https://millsy102.github.io/docssitetemplate/admin/" -ForegroundColor Cyan
Write-Host ""
Write-Host "Deployment Summary:" -ForegroundColor White
Write-Host "- Documentation site: Built and deployed" -ForegroundColor White
Write-Host "- Admin login page: Available at /admin/" -ForegroundColor White
Write-Host "- Full system: Available after login at /app/" -ForegroundColor White
Write-Host ""
Write-Host "Note: It may take a few minutes for changes to appear on GitHub Pages" -ForegroundColor Yellow
