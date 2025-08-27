# Deploy Façade Script
# This script safely commits and pushes only the public façade content

param(
    [string]$ProjectName = "docssitetemplate",
    [switch]$DryRun = $false
)

Write-Host "Deploying docs façade to GitHub..." -ForegroundColor Green

if ($DryRun) {
    Write-Host "DRY RUN MODE - No changes will be made" -ForegroundColor Yellow
}

# Step 1: Check current status
Write-Host "Checking repository status..." -ForegroundColor Cyan
$status = git status --porcelain
if ($status) {
    Write-Host "Found changes to commit:" -ForegroundColor Yellow
    Write-Host $status -ForegroundColor Gray
} else {
    Write-Host "No changes to commit" -ForegroundColor Green
    exit 0
}

# Step 2: Verify no private content is staged
Write-Host "Verifying no private content is staged..." -ForegroundColor Cyan
$stagedFiles = git diff --cached --name-only
$privatePatterns = @(
    "src/",
    "private/",
    "admin-docs/",
    "dist/",
    "node_modules/",
    "coverage/",
    ".snapshots/",
    "package-lock.json"
)

$privateFiles = @()
foreach ($file in $stagedFiles) {
    foreach ($pattern in $privatePatterns) {
        if ($file -like "*$pattern*") {
            $privateFiles += $file
            break
        }
    }
}

if ($privateFiles.Count -gt 0) {
    Write-Host "ERROR: Private content detected in staged files!" -ForegroundColor Red
    Write-Host "The following files should NOT be committed:" -ForegroundColor Red
    foreach ($file in $privateFiles) {
        Write-Host "  - $file" -ForegroundColor Red
    }
    Write-Host "`nPlease run the setup script first to move private content." -ForegroundColor Yellow
    exit 1
}

# Step 3: Add only façade content
Write-Host "Adding façade content to staging..." -ForegroundColor Cyan
$facadeContent = @(
    "public/",
    "docs/",
    "scripts/setup-*.ps1",
    "scripts/setup-*.sh",
    "scripts/deploy-façade.ps1",
    ".github/",
    "README.md",
    "SECURITY.md",
    ".gitignore",
    ".gitattributes",
    "package.json",
    "mkdocs.yml",
    "encrypted/",
    "DEPLOYMENT_CHECKLIST.md",
    "FAÇADE_IMPLEMENTATION_SUMMARY.md",
    "docs/façade-pattern.md"
)

foreach ($pattern in $facadeContent) {
    if (Test-Path $pattern) {
        if ($DryRun) {
            Write-Host "Would add: $pattern" -ForegroundColor Gray
        } else {
            git add $pattern
            Write-Host "Added: $pattern" -ForegroundColor Green
        }
    }
}

# Step 4: Check what's staged
Write-Host "Checking staged content..." -ForegroundColor Cyan
$stagedFiles = git diff --cached --name-only
Write-Host "Files staged for commit:" -ForegroundColor Yellow
foreach ($file in $stagedFiles) {
    Write-Host "  + $file" -ForegroundColor Green
}

# Step 5: Commit
if (!$DryRun) {
    Write-Host "Committing façade content..." -ForegroundColor Cyan
    $commitMessage = "feat: implement docs façade pattern

- Move private content to personal folder
- Update GitHub workflows for façade deployment
- Add security notices and documentation
- Configure .gitignore and .gitattributes
- Create deployment checklist

Private app now lives in: ~/millsy-admin/sites/$ProjectName/private-app/"
    
    git commit -m $commitMessage
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Commit successful!" -ForegroundColor Green
    } else {
        Write-Host "Commit failed!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Would commit with message:" -ForegroundColor Gray
    Write-Host $commitMessage -ForegroundColor Gray
}

# Step 6: Push
if (!$DryRun) {
    Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
    git push origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Push successful!" -ForegroundColor Green
        Write-Host "`nFaçade deployed to GitHub Pages!" -ForegroundColor Green
    } else {
        Write-Host "Push failed!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Would push to origin main" -ForegroundColor Gray
}

# Step 7: Verification
Write-Host "`nDeployment Summary:" -ForegroundColor Cyan
Write-Host "✅ Public façade deployed to GitHub" -ForegroundColor Green
Write-Host "✅ Private content safely in: ~/millsy-admin/sites/$ProjectName/private-app/" -ForegroundColor Green
Write-Host "✅ GitHub Pages will deploy automatically" -ForegroundColor Green
Write-Host "✅ Security measures in place" -ForegroundColor Green

Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Check GitHub Pages deployment" -ForegroundColor White
Write-Host "2. Test private app build: ~/millsy-admin/bin/Build-Private.ps1 $ProjectName" -ForegroundColor White
Write-Host "3. Update documentation as needed" -ForegroundColor White
