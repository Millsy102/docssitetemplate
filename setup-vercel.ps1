# Vercel Setup Script
# This script checks and sets up Vercel CLI installation and authentication

Write-Host "Vercel Setup - BeamFlow Project" -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green
Write-Host ""

# Step 1: Check if Vercel CLI is installed
Write-Host "Step 1: Checking Vercel CLI installation..." -ForegroundColor Yellow

# Try to install Vercel CLI directly without checking version first
Write-Host "Installing Vercel CLI..." -ForegroundColor White
npm install -g vercel
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install Vercel CLI globally. Trying alternative..." -ForegroundColor Yellow
    npm install -g @vercel/cli
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install Vercel CLI" -ForegroundColor Red
        Write-Host "Please install manually: npm install -g vercel" -ForegroundColor Yellow
        exit 1
    }
}

# Now check if it's working
Write-Host "Testing Vercel CLI..." -ForegroundColor White
$vercelVersion = npx vercel --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "SUCCESS: Vercel CLI is installed and working" -ForegroundColor Green
    Write-Host "Version: $vercelVersion" -ForegroundColor White
} else {
    Write-Host "WARNING: Vercel CLI installed but version check failed" -ForegroundColor Yellow
    Write-Host "Continuing anyway..." -ForegroundColor White
}

Write-Host ""

# Step 2: Check if user is logged in to Vercel
Write-Host "Step 2: Checking Vercel authentication..." -ForegroundColor Yellow

# Try to check login status with timeout
Write-Host "Checking login status..." -ForegroundColor White
$vercelWhoami = npx vercel whoami 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Not logged in to Vercel. Starting login process..." -ForegroundColor Yellow
    Write-Host "This will open your browser for authentication." -ForegroundColor White
    Write-Host "Please complete the login process in your browser." -ForegroundColor White
    Write-Host "If the browser doesn't open, you can manually run: npx vercel login" -ForegroundColor Yellow
    
    # Start Vercel login
    npx vercel login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Vercel login failed" -ForegroundColor Red
        Write-Host "Please try running: npx vercel login manually" -ForegroundColor Yellow
        Write-Host "Continuing without login..." -ForegroundColor Yellow
    } else {
        Write-Host "SUCCESS: Vercel login completed" -ForegroundColor Green
    }
} else {
    Write-Host "SUCCESS: Already logged in to Vercel as: $vercelWhoami" -ForegroundColor Green
}

Write-Host ""

# Step 3: Check if project is linked to Vercel
Write-Host "Step 3: Checking Vercel project link..." -ForegroundColor Yellow

Write-Host "Attempting to link project to Vercel..." -ForegroundColor White
Write-Host "This will create a new Vercel project if one doesn't exist." -ForegroundColor White

# Link project to Vercel
npx vercel link --yes
if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: Failed to link project to Vercel" -ForegroundColor Yellow
    Write-Host "You can link manually later with: npx vercel link" -ForegroundColor Yellow
    Write-Host "Continuing anyway..." -ForegroundColor White
} else {
    Write-Host "SUCCESS: Project linked to Vercel" -ForegroundColor Green
}

Write-Host ""

# Step 4: Test Vercel deployment
Write-Host "Step 4: Testing Vercel deployment..." -ForegroundColor Yellow
Write-Host "This will create a test deployment to verify everything works." -ForegroundColor White
$testDeploy = Read-Host "Do you want to test deploy to Vercel? (y/n)"

if ($testDeploy -eq "y" -or $testDeploy -eq "Y") {
    Write-Host "Creating test deployment..." -ForegroundColor White
    
    # Create a simple test deployment
    npx vercel --prod --yes
    if ($LASTEXITCODE -eq 0) {
        Write-Host "SUCCESS: Test deployment completed!" -ForegroundColor Green
        Write-Host "Your Vercel setup is working correctly." -ForegroundColor Green
    } else {
        Write-Host "ERROR: Test deployment failed" -ForegroundColor Red
        Write-Host "Please check your Vercel configuration" -ForegroundColor Yellow
    }
} else {
    Write-Host "Test deployment skipped" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Vercel Setup Complete!" -ForegroundColor Green
Write-Host "======================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "1. Run your MASTER-DEPLOY.ps1 script" -ForegroundColor Cyan
Write-Host "2. When prompted for Vercel deployment, choose 'y'" -ForegroundColor Cyan
Write-Host "3. Your project will be deployed to Vercel automatically" -ForegroundColor Cyan
Write-Host ""
Write-Host "Vercel CLI commands:" -ForegroundColor White
Write-Host "  npx vercel --help          - Show all commands" -ForegroundColor Yellow
Write-Host "  npx vercel ls              - List projects" -ForegroundColor Yellow
Write-Host "  npx vercel whoami          - Check login status" -ForegroundColor Yellow
Write-Host "  npx vercel --prod          - Deploy to production" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to continue"
