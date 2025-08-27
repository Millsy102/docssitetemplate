# Build Private Application Script

param(
    [string]$ProjectName = "docssitetemplate"
)

$PersonalFolder = "$env:USERPROFILE\millsy-admin"
$PrivateAppPath = "$PersonalFolder\sites\$ProjectName\private-app"

Write-Host "Building private application..." -ForegroundColor Green

if (!(Test-Path $PrivateAppPath)) {
    Write-Host "ERROR: Private app not found at $PrivateAppPath" -ForegroundColor Red
    exit 1
}

Set-Location $PrivateAppPath

# Install dependencies if needed
if (!(Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Cyan
    npm install
}

# Build the application
Write-Host "Building application..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build successful!" -ForegroundColor Green
    Write-Host "Output in: $PrivateAppPath\dist" -ForegroundColor Yellow
} else {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}
