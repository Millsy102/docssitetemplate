# Simple Deploy Script - BeamFlow
# This script will build and deploy everything step by step

Write-Host "=== BeamFlow Simple Deploy ===" -ForegroundColor Green
Write-Host "Starting deployment process..." -ForegroundColor White

try {
    # Step 1: Set environment variables
    Write-Host "Step 1: Setting environment variables..." -ForegroundColor Yellow
    $env:SITE_TITLE = "BeamFlow Documentation"
    $env:SITE_DESCRIPTION = "Comprehensive documentation for the BeamFlow Unreal Engine plugin"
    $env:SITE_URL = "https://millsy102.github.io/docssitetemplate"
    $env:NODE_ENV = "production"
    Write-Host "Environment variables set successfully" -ForegroundColor Green

    # Step 2: Install dependencies
    Write-Host "Step 2: Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "npm install failed"
    }
    Write-Host "Dependencies installed successfully" -ForegroundColor Green

    # Step 3: Install Vite locally
    Write-Host "Step 3: Installing Vite..." -ForegroundColor Yellow
    npm install vite --save-dev
    if ($LASTEXITCODE -ne 0) {
        throw "Vite install failed"
    }
    Write-Host "Vite installed successfully" -ForegroundColor Green

    # Step 4: Build main site
    Write-Host "Step 4: Building main documentation site..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Main site build failed"
    }
    Write-Host "Main site built successfully" -ForegroundColor Green

    # Step 5: Build secret system
    Write-Host "Step 5: Building secret system..." -ForegroundColor Yellow
    Push-Location "_internal/system"
    npm install
    if ($LASTEXITCODE -ne 0) {
        Pop-Location
        throw "Secret system npm install failed"
    }
    
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Pop-Location
        throw "Secret system build failed"
    }
    Pop-Location
    Write-Host "Secret system built successfully" -ForegroundColor Green

    # Step 6: Deploy to GitHub Pages
    Write-Host "Step 6: Deploying to GitHub Pages..." -ForegroundColor Yellow
    npx gh-pages -d dist
    if ($LASTEXITCODE -ne 0) {
        Write-Host "WARNING: GitHub Pages deployment failed" -ForegroundColor Red
    } else {
        Write-Host "GitHub Pages deployed successfully" -ForegroundColor Green
    }

    # Step 7: Deploy to Vercel
    Write-Host "Step 7: Deploying to Vercel..." -ForegroundColor Yellow
    vercel --prod --yes
    if ($LASTEXITCODE -ne 0) {
        Write-Host "WARNING: Vercel deployment failed" -ForegroundColor Red
        Write-Host "You may need to run: vercel login" -ForegroundColor Yellow
    } else {
        Write-Host "Vercel deployed successfully" -ForegroundColor Green
    }

    Write-Host ""
    Write-Host "=== DEPLOYMENT COMPLETE ===" -ForegroundColor Green
    Write-Host "Main site: https://millsy102.github.io/docssitetemplate" -ForegroundColor Cyan
    Write-Host "Vercel: docssitetemplate.vercel.app" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "All systems built and deployed!" -ForegroundColor Green

} catch {
    Write-Host ""
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Deployment failed. Please check the error above." -ForegroundColor Red
} finally {
    Write-Host ""
    Write-Host "Press any key to continue..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
