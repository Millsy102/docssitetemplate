# Quick Deploy Script for BeamFlow
# This is a simplified version for rapid deployments

param(
    [switch]$SkipTests,
    [switch]$SkipLint,
    [string]$Target = "local"
)

Write-Host "⚡ Quick Deploy - BeamFlow" -ForegroundColor Green
Write-Host "Target: $Target" -ForegroundColor Yellow
Write-Host ""

# Navigate to system directory
Set-Location "_internal/system"

# Quick build process
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
npm install

if (-not $SkipLint) {
    Write-Host "🔍 Running linting..." -ForegroundColor Blue
    npm run lint
}

if (-not $SkipTests) {
    Write-Host "🧪 Running tests..." -ForegroundColor Blue
    npm test
}

Write-Host "🏗️ Building frontend..." -ForegroundColor Blue
npm run frontend:build

Write-Host "🔧 Building backend..." -ForegroundColor Blue
npm run build

# Create quick deployment
$deployDir = "quick-deploy"
if (Test-Path $deployDir) {
    Remove-Item $deployDir -Recurse -Force
}
New-Item -ItemType Directory -Path $deployDir | Out-Null

# Copy essential files
Copy-Item "dist" -Destination $deployDir -Recurse
Copy-Item "src" -Destination $deployDir -Recurse
Copy-Item "package.json" -Destination $deployDir
Copy-Item "package-lock.json" -Destination $deployDir

# Create quick start script
@"
# Quick Start BeamFlow
Write-Host "Starting BeamFlow..." -ForegroundColor Green
`$env:NODE_ENV = "production"
npm ci --only=production
node src/server.js
"@ | Out-File -FilePath "$deployDir/quick-start.ps1" -Encoding UTF8

# Deploy based on target
switch ($Target) {
    "local" {
        $localPath = "C:\BeamFlow-Quick"
        if (-not (Test-Path $localPath)) {
            New-Item -ItemType Directory -Path $localPath | Out-Null
        }
        Copy-Item "$deployDir\*" -Destination $localPath -Recurse -Force
        Write-Host "✅ Deployed to: $localPath" -ForegroundColor Green
    }
    "vercel" {
        Write-Host "🚀 Ready for Vercel deployment" -ForegroundColor Green
        Write-Host "Run: vercel --prod" -ForegroundColor Yellow
    }
    default {
        Write-Host "📁 Deployment package ready in: $deployDir" -ForegroundColor Green
    }
}

# Return to root
Set-Location "../.."

Write-Host ""
Write-Host "🎉 Quick deploy completed!" -ForegroundColor Green
