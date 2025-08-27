# Setup Personal Development Folder for Docs Façade Pattern
# This script creates the ~/millsy-admin structure for private app development

param(
    [string]$ProjectName = "beam-site",
    [string]$BasePath = "$env:USERPROFILE\millsy-admin"
)

Write-Host "Setting up personal development folder for docs façade pattern..." -ForegroundColor Green

# Create base directory structure
$SitesPath = "$BasePath\sites\$ProjectName"
$PrivateAppPath = "$SitesPath\private-app"
$EncryptPath = "$SitesPath\encrypt"
$BinPath = "$BasePath\bin"
$TemplatesPath = "$BasePath\templates"
$TmpPath = "$BasePath\tmp"

# Create directories
$Directories = @(
    $BasePath,
    "$BasePath\sites",
    $SitesPath,
    $PrivateAppPath,
    $EncryptPath,
    $BinPath,
    $TemplatesPath,
    $TmpPath
)

foreach ($dir in $Directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "Created: $dir" -ForegroundColor Yellow
    } else {
        Write-Host "Exists: $dir" -ForegroundColor Gray
    }
}

# Create build script
$BuildScript = @"
# Build Private App Script
param([string]`$Project = "$ProjectName")
`$Base = "`$HOME\millsy-admin\sites\`$Project"
`$App  = "`$Base\private-app"
Set-Location `$App
if (Test-Path package.json) {
  npm ci
  npm run build
} else {
  Write-Error "No package.json — place your private app here."; exit 1
}
Write-Host "Build complete → `$App\dist"
"@

$BuildScriptPath = "$BinPath\Build-Private.ps1"
Set-Content -Path $BuildScriptPath -Value $BuildScript
Write-Host "Created build script: $BuildScriptPath" -ForegroundColor Yellow

# Create encrypt script
$EncryptScript = @"
# Encrypt Private App Script
param(
  [string]`$Project = "$ProjectName",
  [string]`$PublicRepoPath = "`$HOME\code\docssitetemplate"
)
`$Base = "`$HOME\millsy-admin\sites\`$Project"
`$EncScript = "`$Base\encrypt\encrypt.js"
if (-not `$env:BUNDLE_PASSPHRASE) { `$env:BUNDLE_PASSPHRASE = "test-pass" }
node `$EncScript
New-Item -ItemType Directory -Force -Path "`$PublicRepoPath\encrypted" | Out-Null
Copy-Item "`$Base\encrypted\*" "`$PublicRepoPath\encrypted" -Recurse -Force
Write-Host "Encrypted artifacts synced → `$PublicRepoPath\encrypted"
"@

$EncryptScriptPath = "$BinPath\Encrypt-Private.ps1"
Set-Content -Path $EncryptScriptPath -Value $EncryptScript
Write-Host "Created encrypt script: $EncryptScriptPath" -ForegroundColor Yellow

# Create basic encrypt.js template
$EncryptJsTemplate = @"
// Encryption helper for private app
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PASSPHRASE = process.env.BUNDLE_PASSPHRASE || 'test-pass';
const PRIVATE_APP_PATH = path.join(__dirname, '..', 'private-app', 'dist');
const ENCRYPTED_PATH = path.join(__dirname, 'encrypted');

// Ensure encrypted directory exists
if (!fs.existsSync(ENCRYPTED_PATH)) {
  fs.mkdirSync(ENCRYPTED_PATH, { recursive: true });
}

function encryptFile(inputPath, outputPath) {
  const content = fs.readFileSync(inputPath);
  const cipher = crypto.createCipher('aes-256-cbc', PASSPHRASE);
  let encrypted = cipher.update(content, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  fs.writeFileSync(outputPath, encrypted);
}

function encryptDirectory() {
  if (!fs.existsSync(PRIVATE_APP_PATH)) {
    console.error('Private app dist directory not found:', PRIVATE_APP_PATH);
    return;
  }

  const files = fs.readdirSync(PRIVATE_APP_PATH, { recursive: true });
  
  files.forEach(file => {
    if (fs.statSync(path.join(PRIVATE_APP_PATH, file)).isFile()) {
      const inputPath = path.join(PRIVATE_APP_PATH, file);
      const outputPath = path.join(ENCRYPTED_PATH, file + '.enc');
      
      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      encryptFile(inputPath, outputPath);
      console.log('Encrypted:', file);
    }
  });

  // Create manifest
  const manifest = {
    timestamp: new Date().toISOString(),
    files: files.filter(f => fs.statSync(path.join(PRIVATE_APP_PATH, f)).isFile()),
    version: '1.0.0'
  };
  
  const manifestPath = path.join(ENCRYPTED_PATH, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('Created manifest:', manifestPath);
}

encryptDirectory();
"@

$EncryptJsPath = "$EncryptPath\encrypt.js"
Set-Content -Path $EncryptJsPath -Value $EncryptJsTemplate
Write-Host "Created encrypt.js template: $EncryptJsPath" -ForegroundColor Yellow

# Create README for private folder
$PrivateReadme = @"
# Private App Development Folder

This folder contains the real application code that is NOT committed to the public repository.

## Structure

- \`private-app/\` - Your full real site (source of truth)
- \`encrypt/\` - Encryption utilities for optional encrypted-on-GH pattern
- \`dist/\` - Build output (never committed)

## Usage

1. Place your private application code in \`private-app/\`
2. Build with: \`~/millsy-admin/bin/Build-Private.ps1 $ProjectName\`
3. (Optional) Encrypt with: \`~/millsy-admin/bin/Encrypt-Private.ps1 $ProjectName\`

## Security

- This folder is NOT in version control
- Contains sensitive configuration and real application code
- Only you have access to this content
- Public repo sees only the façade + optional encrypted blobs
"@

$PrivateReadmePath = "$SitesPath\README-private.md"
Set-Content -Path $PrivateReadmePath -Value $PrivateReadme
Write-Host "Created private README: $PrivateReadmePath" -ForegroundColor Yellow

# Create basic package.json template for private app
$PackageJsonTemplate = @"
{
  "name": "$ProjectName-private",
  "version": "1.0.0",
  "description": "Private application code (not in public repo)",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "jest"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.4.0"
  }
}
"@

$PackageJsonPath = "$PrivateAppPath\package.json"
if (!(Test-Path $PackageJsonPath)) {
    Set-Content -Path $PackageJsonPath -Value $PackageJsonTemplate
    Write-Host "Created package.json template: $PackageJsonPath" -ForegroundColor Yellow
}

Write-Host "`nPersonal development folder setup complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Move your private app code to: $PrivateAppPath" -ForegroundColor White
Write-Host "2. Build with: $BinPath\Build-Private.ps1" -ForegroundColor White
Write-Host "3. (Optional) Encrypt with: $BinPath\Encrypt-Private.ps1" -ForegroundColor White
Write-Host "`nRemember: This folder is NOT in version control!" -ForegroundColor Red
