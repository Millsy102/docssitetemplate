# Docs Façade Pattern Implementation

This document explains the **docs façade + private site** pattern implemented in this repository.

## Overview

The docs façade pattern separates public documentation from private application code, ensuring that:

- **Public Repository**: Contains only generic documentation and template code
- **Private Development**: All real features and sensitive code live in a personal folder
- **Security**: No private code is ever committed to the public repository
- **Flexibility**: Choose between encrypted artifacts or direct VPS deployment

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PUBLIC REPO (GitHub Pages)               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Docs Façade   │  │  Encrypted      │  │  GitHub      │ │
│  │   (Template)    │  │  Blobs (opt)    │  │  Workflows   │ │
│  │                 │  │                 │  │              │ │
│  │ • Basic Docs    │  │ • manifest.enc  │  │ • CI/CD      │ │
│  │ • Demo Features │  │ • key.enc       │  │ • Pages      │ │
│  │ • Limited API   │  │ • chunks/*.enc  │  │ • Quality    │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                 PRIVATE FOLDER (~/millsy-admin)             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  Private App    │  │  Admin Tools    │  │  Build       │ │
│  │  (Real Site)    │  │  & Scripts      │  │  Scripts     │ │
│  │                 │  │                 │  │              │ │
│  │ • Full Features │  │ • build.sh      │  │ • encrypt.js │ │
│  │ • Admin Panel   │  │ • deploy.sh     │  │ • sync.sh    │ │
│  │ • Real API      │  │ • tools/        │  │ • dist/      │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Details

### 1. Public Repository Structure

```
docssitetemplate/              # public repo (visible to everyone)
├─ public/                     # façade: generic docs template only
│  ├─ index.html
│  ├─ css/
│  └─ js/
├─ docs/                       # public documentation
├─ encrypted/                  # encrypted blobs of private app (optional)
│  ├─ manifest.enc
│  ├─ key.enc
│  └─ chunks/*.js.enc
├─ .github/workflows/          # Pages deploy + CI quality
├─ .gitignore                  # ignores private/admin/local folders
└─ README.md                   # explains façade + setup
```

### 2. Private Development Folder

```
%USERPROFILE%/millsy-admin/    # Windows
~/millsy-admin/                # macOS/Linux

  sites/
    docssitetemplate/
      private-app/             # ← your full real site lives here
        src/
        public/
        package.json
        tsconfig.json
        ...
        dist/                  # build output (never committed)

      encrypt/                 # encryption helpers
        encrypt.js

  bin/                         # admin scripts (non-essential)
  templates/                   # scaffolding templates
  tmp/                         # scratch builds
```

## Security Model

### Public Access (GitHub Pages)
- **Generic documentation template** - showcases basic features
- **Demo content only** - no real functionality
- **Limited API endpoints** - public examples only
- **Marketing content** - project overview and setup guides

### Private Access (Personal Folder)
- **Full application code** - complete feature set
- **Admin tools and scripts** - development utilities
- **Real database and API** - production functionality
- **Sensitive configuration** - environment variables, secrets

## Development Workflow

### Option A: Personal Folder (Recommended)

```bash
# 1. Build the real site locally (personal folder)
~/millsy-admin/bin/Build-Private.ps1 docssitetemplate

# 2. (Optional) Encrypt & sync ciphertext to public repo
~/millsy-admin/bin/Encrypt-Private.ps1 docssitetemplate /path/to/public-repo

# 3. Commit + push from public repo (façade only)
cd /path/to/public-repo
git add encrypted public .github README.md .gitignore
git commit -m "chore: update encrypted bundle + façade"
git push origin main
```

### Option B: Private Repo + VPS
- **Public repo**: This façade (GitHub Pages)
- **Private repo**: `github.com/you/private-real-app`
- **VPS**: `app.yourdomain.tld` behind Cloudflare Access

## Setup Instructions

### 1. Initial Setup

Run the setup script to create your personal development folder:

```powershell
# Windows
powershell -ExecutionPolicy Bypass -File "scripts/setup-personal-folder.ps1" -ProjectName "docssitetemplate"

# macOS/Linux
bash scripts/setup-personal-folder.sh docssitetemplate
```

### 2. Move Private Code

Move your private application code to the personal folder:

```bash
# Move your real app code to the private folder
mv src/ ~/millsy-admin/sites/docssitetemplate/private-app/
mv package.json ~/millsy-admin/sites/docssitetemplate/private-app/
# ... move other private files
```

### 3. Update Public Façade

Keep only the documentation and template code in the public repository:

```bash
# Keep only façade content in public repo
git add public/ docs/ .github/ README.md .gitignore
git commit -m "feat: implement docs façade pattern"
```

## File Protection

### .gitignore Rules

The `.gitignore` file has been updated with comprehensive rules to prevent private content from being committed:

```gitignore
# NEVER commit private or admin content
_admin/
local/
private/
dist/
node_modules/
.env
*.log

# Private application code (lives in personal folder ~/millsy-admin)
private-app/
private-src/
private-dist/

# Admin tools and scripts (personal folder only)
admin-scripts/
admin-tools/
personal-tools/

# Sensitive configuration
secrets/
*.secret
*.key
*.pem
*.p12
*.pfx
```

### Allowed in Public Repo

```gitignore
# Public documentation
!docs/
!public/
!site/

# Configuration examples
!.env.example
!package.json.example

# GitHub workflows
!.github/

# README and documentation
!README.md
!CONTRIBUTING.md
!LICENSE

# Encrypted blobs (if using encrypted-on-GH pattern)
!encrypted/
!encrypted/*.enc
```

## Helper Scripts

### Build Script (`~/millsy-admin/bin/Build-Private.ps1`)

```powershell
# Build Private App Script
param([string]$Project = "docssitetemplate")
$Base = "$HOME\millsy-admin\sites\$Project"
$App  = "$Base\private-app"
Set-Location $App
if (Test-Path package.json) {
  npm ci
  npm run build
} else {
  Write-Error "No package.json — place your private app here."; exit 1
}
Write-Host "Build complete → $App\dist"
```

### Encrypt Script (`~/millsy-admin/bin/Encrypt-Private.ps1`)

```powershell
# Encrypt Private App Script
param(
  [string]$Project = "docssitetemplate",
  [string]$PublicRepoPath = "$HOME\code\docssitetemplate"
)
$Base = "$HOME\millsy-admin\sites\$Project"
$EncScript = "$Base\encrypt\encrypt.js"
if (-not $env:BUNDLE_PASSPHRASE) { $env:BUNDLE_PASSPHRASE = "test-pass" }
node $EncScript
New-Item -ItemType Directory -Force -Path "$PublicRepoPath\encrypted" | Out-Null
Copy-Item "$Base\encrypted\*" "$PublicRepoPath\encrypted" -Recurse -Force
Write-Host "Encrypted artifacts synced → $PublicRepoPath\encrypted"
```

## Best Practices

### 1. Never Commit Private Code
- All private code lives in `~/millsy-admin/`
- Public repo contains only façade and documentation
- Use `.gitignore` rules to prevent accidental commits

### 2. Use Helper Scripts
- Build with `Build-Private.ps1`
- Encrypt with `Encrypt-Private.ps1`
- Keep scripts in personal folder, not in public repo

### 3. Document the Pattern
- README clearly explains the separation
- Include setup instructions for new developers
- Document both options (personal folder vs private repo)

### 4. Regular Maintenance
- Keep public façade updated with latest documentation
- Regularly build and test private app
- Update encrypted artifacts when needed

## Troubleshooting

### Common Issues

1. **Private code accidentally committed**
   - Check `.gitignore` rules
   - Remove from git history: `git filter-branch`
   - Move to personal folder

2. **Build script not found**
   - Run setup script again
   - Check path: `~/millsy-admin/bin/`

3. **Encryption fails**
   - Check `BUNDLE_PASSPHRASE` environment variable
   - Verify `encrypt.js` exists in personal folder

### Getting Help

- Check the private README: `~/millsy-admin/sites/docssitetemplate/README-private.md`
- Review helper scripts in `~/millsy-admin/bin/`
- Consult this documentation

## Conclusion

The docs façade pattern provides a secure, maintainable way to separate public documentation from private application code. By following this pattern, you can:

- Keep sensitive code private while sharing documentation
- Maintain a clean public repository
- Choose between encrypted artifacts or direct deployment
- Scale your development workflow securely

Remember: **This folder is NOT in version control!**
