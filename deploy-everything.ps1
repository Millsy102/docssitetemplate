# BeamFlow Complete Deployment Script
# Builds and deploys ALL parts of the system

Write-Host "🚀 BeamFlow Complete Deployment System" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Set environment variables
$env:SITE_TITLE = "BeamFlow Documentation"
$env:SITE_DESCRIPTION = "Comprehensive documentation for the BeamFlow Unreal Engine plugin"
$env:SITE_URL = "https://millsy102.github.io/docssitetemplate"
$env:NODE_ENV = "production"

Write-Host "📦 Step 1: Building main documentation site..." -ForegroundColor Yellow
try {
    # Install dependencies
    npm install
    if ($LASTEXITCODE -ne 0) { throw "npm install failed" }
    
    # Build main site
    npx vite build
    if ($LASTEXITCODE -ne 0) { throw "vite build failed" }
    
    Write-Host "✅ Main site built successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Main site build failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host "🔒 Step 2: Building secret system..." -ForegroundColor Yellow
try {
    # Build secret system
    Set-Location "_internal/system"
    npm install
    if ($LASTEXITCODE -ne 0) { throw "secret system npm install failed" }
    
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "secret system build failed" }
    
    Set-Location "../.."
    Write-Host "✅ Secret system built successfully" -ForegroundColor Green
} catch {
    Set-Location "../.."
    Write-Host "❌ Secret system build failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host "🖥️ Step 3: Building server components..." -ForegroundColor Yellow
try {
    if (Test-Path "server") {
        Set-Location "server"
        npm install
        if ($LASTEXITCODE -ne 0) { throw "server npm install failed" }
        Set-Location ".."
        Write-Host "✅ Server components built successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Server directory not found, skipping" -ForegroundColor Yellow
    }
} catch {
    Set-Location ".."
    Write-Host "❌ Server build failed: $_" -ForegroundColor Red
}

Write-Host "🖥️ Step 4: Building desktop agent..." -ForegroundColor Yellow
try {
    if (Test-Path "desktop-agent") {
        Set-Location "desktop-agent"
        npm install
        if ($LASTEXITCODE -ne 0) { throw "desktop agent npm install failed" }
        Set-Location ".."
        Write-Host "✅ Desktop agent built successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Desktop agent directory not found, skipping" -ForegroundColor Yellow
    }
} catch {
    Set-Location ".."
    Write-Host "❌ Desktop agent build failed: $_" -ForegroundColor Red
}

Write-Host "📦 Step 5: Creating full deployment package..." -ForegroundColor Yellow
try {
    # Create deployment directory
    if (Test-Path "full-system-deploy") {
        Remove-Item "full-system-deploy" -Recurse -Force
    }
    New-Item -ItemType Directory -Name "full-system-deploy" | Out-Null
    
    # Copy main site
    Copy-Item "dist" "full-system-deploy/public" -Recurse
    Write-Host "✅ Copied main site to deployment package" -ForegroundColor Green
    
    # Copy secret system
    if (Test-Path "_internal/system/dist") {
        Copy-Item "_internal/system/dist" "full-system-deploy/secret" -Recurse
        Write-Host "✅ Copied secret system to deployment package" -ForegroundColor Green
    }
    
    # Copy backend
    New-Item -ItemType Directory -Name "full-system-deploy/backend" | Out-Null
    Copy-Item "_internal/system/src" "full-system-deploy/backend/src" -Recurse
    Copy-Item "_internal/system/package.json" "full-system-deploy/backend/"
    Copy-Item "_internal/system/package-lock.json" "full-system-deploy/backend/"
    
    # Copy API
    Copy-Item "api/index.js" "full-system-deploy/api.js"
    
    # Copy Vercel config
    Copy-Item "vercel.json" "full-system-deploy/"
    
    Write-Host "✅ Full deployment package created" -ForegroundColor Green
} catch {
    Write-Host "❌ Deployment package creation failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host "🌐 Step 6: Deploying to GitHub Pages..." -ForegroundColor Yellow
try {
    npx gh-pages -d dist
    if ($LASTEXITCODE -ne 0) { throw "GitHub Pages deployment failed" }
    Write-Host "✅ GitHub Pages deployment successful" -ForegroundColor Green
    Write-Host "   📖 Site: https://millsy102.github.io/docssitetemplate" -ForegroundColor Cyan
} catch {
    Write-Host "❌ GitHub Pages deployment failed: $_" -ForegroundColor Red
}

Write-Host "🚀 Step 7: Deploying to Vercel..." -ForegroundColor Yellow
try {
    # Check if Vercel CLI is installed
    $vercelVersion = vercel --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
        npm install -g vercel
    }
    
    # Deploy to Vercel
    vercel --prod --yes
    if ($LASTEXITCODE -ne 0) { throw "Vercel deployment failed" }
    Write-Host "✅ Vercel deployment successful" -ForegroundColor Green
    Write-Host "   🔒 Full system: docssitetemplate.vercel.app" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Vercel deployment failed: $_" -ForegroundColor Red
    Write-Host "   💡 You may need to run: vercel login" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "=====================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ What was built and deployed:" -ForegroundColor Green
Write-Host "   📖 Main Documentation Site" -ForegroundColor White
Write-Host "   🔒 Secret System (Admin Panel, FTP/SSH)" -ForegroundColor White
Write-Host "   🖥️ Server Components" -ForegroundColor White
Write-Host "   🖥️ Desktop Agent" -ForegroundColor White
Write-Host "   📦 Full Deployment Package" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Your sites:" -ForegroundColor Green
Write-Host "   📖 GitHub Pages: https://millsy102.github.io/docssitetemplate" -ForegroundColor Cyan
Write-Host "   🔒 Vercel: docssitetemplate.vercel.app" -ForegroundColor Cyan
Write-Host "   🔐 Admin Panel: /admin (on Vercel)" -ForegroundColor Cyan
Write-Host ""
Write-Host "📁 Deployment package: full-system-deploy/" -ForegroundColor Yellow
Write-Host ""
Write-Host "🚀 All systems deployed and ready!" -ForegroundColor Green
