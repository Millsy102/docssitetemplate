# BeamFlow Build and Deploy Script
# This script builds and deploys the BeamFlow application

param(
    [string]$Environment = "production",
    [switch]$SkipTests,
    [switch]$SkipLint,
    [switch]$Force,
    [string]$DeployTarget = "local"
)

Write-Host "🚀 BeamFlow Build and Deploy Script" -ForegroundColor Green
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host "Deploy Target: $DeployTarget" -ForegroundColor Yellow
Write-Host ""

# Set error action preference
$ErrorActionPreference = "Stop"

# Function to log messages
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Level) {
        "ERROR" { "Red" }
        "WARN" { "Yellow" }
        "SUCCESS" { "Green" }
        default { "White" }
    }
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

# Function to check if command exists
function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Check prerequisites
Write-Log "Checking prerequisites..." "INFO"

$prerequisites = @("node", "npm")
$missing = @()

foreach ($prereq in $prerequisites) {
    if (-not (Test-Command $prereq)) {
        $missing += $prereq
    }
}

if ($missing.Count -gt 0) {
    Write-Log "Missing prerequisites: $($missing -join ', ')" "ERROR"
    Write-Log "Please install the missing tools and try again." "ERROR"
    exit 1
}

Write-Log "All prerequisites found" "SUCCESS"

# Navigate to the system directory
Set-Location "_internal/system"
Write-Log "Changed to system directory" "INFO"

# Clean previous builds
Write-Log "Cleaning previous builds..." "INFO"
if (Test-Path "dist") {
    Remove-Item "dist" -Recurse -Force
    Write-Log "Removed previous dist directory" "SUCCESS"
}

if (Test-Path "node_modules") {
    Write-Log "Removing node_modules for clean install..." "WARN"
    Remove-Item "node_modules" -Recurse -Force
}

# Install dependencies
Write-Log "Installing dependencies..." "INFO"
try {
    npm install
    Write-Log "Dependencies installed successfully" "SUCCESS"
}
catch {
    Write-Log "Failed to install dependencies: $($_.Exception.Message)" "ERROR"
    exit 1
}

# Run linting (unless skipped)
if (-not $SkipLint) {
    Write-Log "Running linting..." "INFO"
    try {
        npm run lint
        Write-Log "Linting passed" "SUCCESS"
    }
    catch {
        Write-Log "Linting failed: $($_.Exception.Message)" "ERROR"
        if (-not $Force) {
            Write-Log "Use -Force to continue despite linting errors" "WARN"
            exit 1
        }
        Write-Log "Continuing despite linting errors (Force mode)" "WARN"
    }
}

# Run tests (unless skipped)
if (-not $SkipTests) {
    Write-Log "Running tests..." "INFO"
    try {
        npm test
        Write-Log "Tests passed" "SUCCESS"
    }
    catch {
        Write-Log "Tests failed: $($_.Exception.Message)" "ERROR"
        if (-not $Force) {
            Write-Log "Use -Force to continue despite test failures" "WARN"
            exit 1
        }
        Write-Log "Continuing despite test failures (Force mode)" "WARN"
    }
}

# Build frontend
Write-Log "Building frontend..." "INFO"
try {
    npm run frontend:build
    Write-Log "Frontend build completed" "SUCCESS"
}
catch {
    Write-Log "Frontend build failed: $($_.Exception.Message)" "ERROR"
    exit 1
}

# Build backend (if needed)
Write-Log "Building backend..." "INFO"
try {
    npm run build
    Write-Log "Backend build completed" "SUCCESS"
}
catch {
    Write-Log "Backend build failed: $($_.Exception.Message)" "ERROR"
    exit 1
}

# Create deployment package
Write-Log "Creating deployment package..." "INFO"
$deployDir = "deploy"
if (Test-Path $deployDir) {
    Remove-Item $deployDir -Recurse -Force
}
New-Item -ItemType Directory -Path $deployDir | Out-Null

# Copy necessary files
$filesToCopy = @(
    "dist",
    "src",
    "package.json",
    "package-lock.json",
    "vite.config.ts",
    "tsconfig.json",
    "tailwind.config.js",
    ".env.example"
)

foreach ($file in $filesToCopy) {
    if (Test-Path $file) {
        if (Test-Path $file -PathType Container) {
            Copy-Item $file -Destination $deployDir -Recurse
        } else {
            Copy-Item $file -Destination $deployDir
        }
        Write-Log "Copied $file" "INFO"
    }
}

# Create deployment scripts
$deployScripts = @{
    "start.ps1" = @"
# BeamFlow Production Start Script
Write-Host "Starting BeamFlow Server..." -ForegroundColor Green

# Set environment
`$env:NODE_ENV = "production"

# Install production dependencies
npm ci --only=production

# Start the server
node src/server.js
"@

    "start.bat" = @"
@echo off
echo Starting BeamFlow Server...
set NODE_ENV=production
npm ci --only=production
node src/server.js
"@

    "deploy.ps1" = @"
# BeamFlow Deployment Script
param([string]`$Target = "local")

Write-Host "Deploying BeamFlow to `$Target..." -ForegroundColor Green

# Copy files to target location
switch (`$Target) {
    "local" {
        `$targetPath = "C:\BeamFlow"
        if (-not (Test-Path `$targetPath)) {
            New-Item -ItemType Directory -Path `$targetPath | Out-Null
        }
        Copy-Item * -Destination `$targetPath -Recurse -Force
        Write-Host "Deployed to `$targetPath" -ForegroundColor Green
    }
    "server" {
        Write-Host "Server deployment not configured. Please update this script." -ForegroundColor Yellow
    }
    default {
        Write-Host "Unknown target: `$Target" -ForegroundColor Red
    }
}
"@
}

foreach ($script in $deployScripts.GetEnumerator()) {
    $deployScripts[$script.Key] | Out-File -FilePath "$deployDir\$($script.Key)" -Encoding UTF8
    Write-Log "Created $($script.Key)" "INFO"
}

# Create README for deployment
$deployReadme = @"
# BeamFlow Deployment Package

This package contains the built BeamFlow application ready for deployment.

## Quick Start

### Windows
```powershell
.\start.ps1
```

### Linux/Mac
```bash
npm ci --only=production
node src/server.js
```

## Configuration

1. Copy `.env.example` to `.env`
2. Update the environment variables as needed
3. Start the application

## Files Included

- `dist/` - Built frontend assets
- `src/` - Backend source code
- `package.json` - Dependencies
- `start.ps1` - Windows start script
- `start.bat` - Windows batch start script
- `deploy.ps1` - Deployment script

## Environment Variables

Required environment variables (see .env.example):
- NODE_ENV
- PORT
- DATABASE_URL
- REDIS_URL
- JWT_SECRET
- GITHUB_CLIENT_ID
- GITHUB_CLIENT_SECRET

## Support

For issues or questions, please refer to the main documentation.
"@

$deployReadme | Out-File -FilePath "$deployDir/README.md" -Encoding UTF8
Write-Log "Created deployment README" "INFO"

# Create deployment archive
Write-Log "Creating deployment archive..." "INFO"
$archiveName = "beamflow-deploy-$(Get-Date -Format 'yyyyMMdd-HHmmss').zip"
try {
    Compress-Archive -Path "$deployDir/*" -DestinationPath $archiveName -Force
    Write-Log "Created deployment archive: $archiveName" "SUCCESS"
}
catch {
    Write-Log "Failed to create archive: $($_.Exception.Message)" "ERROR"
}

# Deploy based on target
Write-Log "Deploying to $DeployTarget..." "INFO"
switch ($DeployTarget) {
    "local" {
        $localDeployPath = "C:\BeamFlow"
        if (-not (Test-Path $localDeployPath)) {
            New-Item -ItemType Directory -Path $localDeployPath | Out-Null
            Write-Log "Created local deployment directory: $localDeployPath" "INFO"
        }
        Copy-Item "$deployDir\*" -Destination $localDeployPath -Recurse -Force
        Write-Log "Deployed to local directory: $localDeployPath" "SUCCESS"
    }
    "vercel" {
        Write-Log "Vercel deployment requires manual setup" "WARN"
        Write-Log "Please run: vercel --prod" "INFO"
    }
    "github-pages" {
        Write-Log "GitHub Pages deployment requires manual setup" "WARN"
        Write-Log "Please push to gh-pages branch or configure GitHub Pages" "INFO"
    }
    default {
        Write-Log "Unknown deploy target: $DeployTarget" "WARN"
        Write-Log "Deployment package ready in: $deployDir" "INFO"
    }
}

# Return to original directory
Set-Location "../.."

Write-Log "Build and deploy completed successfully!" "SUCCESS"
Write-Log "Deployment package: $deployDir" "INFO"
if (Test-Path $archiveName) {
    Write-Log "Archive created: $archiveName" "INFO"
}

Write-Host ""
Write-Host "🎉 Build and deployment completed!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review the deployment package in: $deployDir" -ForegroundColor White
Write-Host "2. Configure environment variables" -ForegroundColor White
Write-Host "3. Start the application" -ForegroundColor White
