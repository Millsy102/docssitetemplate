# BeamFlow Documentation Site Build and Deploy Script
# This script builds the static documentation site for GitHub Pages

param(
    [string]$Environment = "production",
    [switch]$SkipTests,
    [switch]$SkipLint,
    [switch]$Force,
    [string]$DeployTarget = "github-pages"
)

Write-Host "🚀 BeamFlow Documentation Site Build Script" -ForegroundColor Green
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

# Clean previous builds
Write-Log "Cleaning previous builds..." "INFO"
if (Test-Path "dist") {
    Remove-Item "dist" -Recurse -Force
    Write-Log "Removed previous dist directory" "SUCCESS"
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

# Build the full application (frontend + backend)
Write-Log "Building full application (frontend + backend)..." "INFO"
try {
    npm run build:full
    Write-Log "Full application build completed" "SUCCESS"
}
catch {
    Write-Log "Full application build failed: $($_.Exception.Message)" "ERROR"
    exit 1
}

# Verify build output
if (-not (Test-Path "dist")) {
    Write-Log "Build output directory 'dist' not found" "ERROR"
    exit 1
}

if (-not (Test-Path "dist/index.html")) {
    Write-Log "Build output missing index.html" "ERROR"
    exit 1
}

Write-Log "Build verification passed" "SUCCESS"

# Create deployment package for full application
Write-Log "Preparing full application deployment..." "INFO"
$deployDir = "full-app-deploy"
if (Test-Path $deployDir) {
    Remove-Item $deployDir -Recurse -Force
}
New-Item -ItemType Directory -Path $deployDir | Out-Null

# Copy frontend built files
Copy-Item "dist\*" -Destination $deployDir -Recurse -Force
Write-Log "Copied frontend files to deployment directory" "INFO"

# Copy backend files
if (Test-Path "_internal/system/dist") {
    Copy-Item "_internal/system/dist\*" -Destination $deployDir -Recurse -Force
    Write-Log "Copied backend files to deployment directory" "INFO"
}

# Copy backend source and configuration
New-Item -ItemType Directory -Path "$deployDir/backend" | Out-Null
Copy-Item "_internal/system/src" -Destination "$deployDir/backend/" -Recurse -Force
Copy-Item "_internal/system/package.json" -Destination "$deployDir/backend/"
Copy-Item "_internal/system/package-lock.json" -Destination "$deployDir/backend/"
Write-Log "Copied backend source and configuration" "INFO"

# Copy additional files for GitHub Pages
if (Test-Path "public/favicon.svg") {
    Copy-Item "public/favicon.svg" -Destination $deployDir
    Write-Log "Copied favicon" "INFO"
}

if (Test-Path "public/manifest.json") {
    Copy-Item "public/manifest.json" -Destination $deployDir
    Write-Log "Copied manifest" "INFO"
}

# Create .nojekyll file for GitHub Pages
New-Item -ItemType File -Path "$deployDir/.nojekyll" -Force | Out-Null
Write-Log "Created .nojekyll file" "INFO"

# Create deployment README
$deployReadme = @"
# BeamFlow Documentation Site

This is the built documentation site for BeamFlow.

## Deployment

This directory contains the static files ready for GitHub Pages deployment.

### Manual Deployment

1. Push the contents of this directory to the `gh-pages` branch
2. Configure GitHub Pages in your repository settings
3. Set the source to the `gh-pages` branch

### Automated Deployment

Use GitHub Actions to automatically deploy on push to main branch.

## Files

- `index.html` - Main documentation page
- `assets/` - CSS, JS, and other assets
- `.nojekyll` - Prevents GitHub Pages from processing with Jekyll

## Support

For issues or questions, please refer to the main repository.
"@

$deployReadme | Out-File -FilePath "$deployDir/README.md" -Encoding UTF8
Write-Log "Created deployment README" "INFO"

# Create deployment archive
Write-Log "Creating deployment archive..." "INFO"
$archiveName = "beamflow-docs-$(Get-Date -Format 'yyyyMMdd-HHmmss').zip"
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
    "github-pages" {
        Write-Log "GitHub Pages deployment package ready" "INFO"
        Write-Log "To deploy:" "INFO"
        Write-Log "1. Push contents of $deployDir to gh-pages branch" "INFO"
        Write-Log "2. Configure GitHub Pages in repository settings" "INFO"
        Write-Log "3. Set source to gh-pages branch" "INFO"
    }
    "local" {
        $localDeployPath = "./local-deploy"
        if (-not (Test-Path $localDeployPath)) {
            New-Item -ItemType Directory -Path $localDeployPath | Out-Null
            Write-Log "Created local deployment directory: $localDeployPath" "INFO"
        }
        Copy-Item "$deployDir\*" -Destination $localDeployPath -Recurse -Force
        Write-Log "Deployed to local directory: $localDeployPath" "SUCCESS"
        Write-Log "To preview: npm run preview" "INFO"
    }
    "vercel" {
        Write-Log "Vercel deployment requires manual setup" "WARN"
        Write-Log "Please run: vercel --prod" "INFO"
    }
    default {
        Write-Log "Unknown deploy target: $DeployTarget" "WARN"
        Write-Log "Deployment package ready in: $deployDir" "INFO"
    }
}

Write-Log "Build and deploy completed successfully!" "SUCCESS"
Write-Log "Deployment package: $deployDir" "INFO"
if (Test-Path $archiveName) {
    Write-Log "Archive created: $archiveName" "INFO"
}

Write-Host ""
Write-Host "🎉 Build and deployment completed!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review the deployment package in: $deployDir" -ForegroundColor White
Write-Host "2. For GitHub Pages: Push contents to gh-pages branch" -ForegroundColor White
Write-Host "3. Configure GitHub Pages in repository settings" -ForegroundColor White
