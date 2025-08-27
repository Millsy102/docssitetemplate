# Encrypt Private Application Script

param(
    [string]$ProjectName = "docssitetemplate",
    [string]$PublicRepoPath = ""
)

$PersonalFolder = "$env:USERPROFILE\millsy-admin"
$PrivateAppPath = "$PersonalFolder\sites\$ProjectName\private-app"
$EncryptPath = "$PersonalFolder\sites\$ProjectName\encrypt"

Write-Host "Encrypting private application..." -ForegroundColor Green

if (!(Test-Path "$PrivateAppPath\dist")) {
    Write-Host "ERROR: No build output found. Run Build-Private.ps1 first." -ForegroundColor Red
    exit 1
}

# Create encryption directory
if (!(Test-Path $EncryptPath)) {
    New-Item -ItemType Directory -Path $EncryptPath -Force | Out-Null
}

# Simple encryption (you can enhance this)
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$encryptedFile = "$EncryptPath\app-$timestamp.enc"

Write-Host "Creating encrypted bundle..." -ForegroundColor Cyan
Compress-Archive -Path "$PrivateAppPath\dist\*" -DestinationPath "$encryptedFile" -Force

Write-Host "Encrypted bundle created: $encryptedFile" -ForegroundColor Green

if ($PublicRepoPath -and (Test-Path $PublicRepoPath)) {
    Write-Host "Copying to public repo encrypted folder..." -ForegroundColor Cyan
    $publicEncryptedPath = "$PublicRepoPath\encrypted"
    if (!(Test-Path $publicEncryptedPath)) {
        New-Item -ItemType Directory -Path $publicEncryptedPath -Force | Out-Null
    }
    Copy-Item $encryptedFile $publicEncryptedPath
    Write-Host "Encrypted bundle copied to public repo" -ForegroundColor Green
}
