# Fix Deployment Script for BeamFlow Documentation Site
# This script handles all git operations and deployment issues

Write-Host "🚀 BeamFlow Deployment Fix Script" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Function to run git commands without pager
function Invoke-GitCommand {
    param(
        [string]$Command,
        [string]$Description
    )
    
    Write-Host "`n📋 $Description" -ForegroundColor Yellow
    Write-Host "Running: git $Command" -ForegroundColor Gray
    
    # Set git to not use pager
    $env:GIT_PAGER = ""
    
    try {
        $result = git $Command.Split(' ') 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Success: $Description" -ForegroundColor Green
            return $result
        } else {
            Write-Host "❌ Error: $Description" -ForegroundColor Red
            Write-Host $result -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ Exception: $Description" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        return $false
    }
}

# Function to check if we're on the right branch
function Test-CorrectBranch {
    Write-Host "`n🔍 Checking current branch..." -ForegroundColor Yellow
    
    $currentBranch = git branch --show-current
    Write-Host "Current branch: $currentBranch" -ForegroundColor Cyan
    
    if ($currentBranch -eq "main") {
        Write-Host "✅ Already on main branch" -ForegroundColor Green
        return $true
    } else {
        Write-Host "⚠️  Not on main branch. Current: $currentBranch" -ForegroundColor Yellow
        return $false
    }
}

# Function to switch to main branch
function Switch-ToMainBranch {
    Write-Host "`n🔄 Switching to main branch..." -ForegroundColor Yellow
    
    # Stash any changes if needed
    $status = git status --porcelain
    if ($status) {
        Write-Host "📦 Stashing changes..." -ForegroundColor Yellow
        Invoke-GitCommand "stash push -m 'Auto-stash before switching to main'" "Stash changes"
    }
    
    # Switch to main
    $result = Invoke-GitCommand "checkout main" "Switch to main branch"
    if ($result -eq $false) {
        Write-Host "❌ Failed to switch to main branch" -ForegroundColor Red
        return $false
    }
    
    # Pull latest changes
    Invoke-GitCommand "pull origin main" "Pull latest changes"
    
    return $true
}

# Function to merge hidden-site-integration branch
function Merge-HiddenSiteBranch {
    Write-Host "`n🔀 Merging hidden-site-integration branch..." -ForegroundColor Yellow
    
    # Check if branch exists
    $branches = git branch -a
    if ($branches -match "hidden-site-integration") {
        Write-Host "📋 Found hidden-site-integration branch" -ForegroundColor Green
        
        # Merge the branch
        $result = Invoke-GitCommand "merge hidden-site-integration" "Merge hidden-site-integration"
        if ($result -eq $false) {
            Write-Host "❌ Merge failed. Attempting to resolve conflicts..." -ForegroundColor Red
            
            # Check for conflicts
            $conflicts = git diff --name-only --diff-filter=U
            if ($conflicts) {
                Write-Host "⚠️  Conflicts detected in:" -ForegroundColor Yellow
                $conflicts | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
                
                # Abort merge and try different approach
                Invoke-GitCommand "merge --abort" "Abort merge"
                Write-Host "🔄 Aborting merge and will use alternative approach" -ForegroundColor Yellow
                return $false
            }
        }
    } else {
        Write-Host "⚠️  hidden-site-integration branch not found" -ForegroundColor Yellow
    }
    
    return $true
}

# Function to ensure all files are properly staged and committed
function Ensure-AllFilesCommitted {
    Write-Host "`n📝 Ensuring all files are committed..." -ForegroundColor Yellow
    
    # Check status
    $status = git status --porcelain
    if ($status) {
        Write-Host "📋 Found uncommitted changes:" -ForegroundColor Yellow
        $status | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
        
        # Add all files
        Invoke-GitCommand "add ." "Add all files"
        
        # Commit
        $commitMessage = "Complete deployment fix: docs, app, and GitHub Pages integration"
        Invoke-GitCommand "commit -m '$commitMessage'" "Commit all changes"
    } else {
        Write-Host "✅ All files are already committed" -ForegroundColor Green
    }
}

# Function to push to GitHub
function Push-ToGitHub {
    Write-Host "`n🚀 Pushing to GitHub..." -ForegroundColor Yellow
    
    # Push to main
    $result = Invoke-GitCommand "push origin main" "Push to main branch"
    if ($result -eq $false) {
        Write-Host "❌ Failed to push to main" -ForegroundColor Red
        return $false
    }
    
    # Push to gh-pages branch if it exists
    $branches = git branch -a
    if ($branches -match "gh-pages") {
        Write-Host "📋 Found gh-pages branch, pushing..." -ForegroundColor Yellow
        Invoke-GitCommand "push origin gh-pages" "Push to gh-pages branch"
    }
    
    return $true
}

# Function to verify GitHub Pages configuration
function Test-GitHubPagesConfig {
    Write-Host "`n🔍 Verifying GitHub Pages configuration..." -ForegroundColor Yellow
    
    # Check if docs directory exists
    if (Test-Path "docs") {
        Write-Host "✅ docs directory exists" -ForegroundColor Green
        
        # Check for key files
        $requiredFiles = @("docs/index.html", "docs/index.md", "docs/404.html")
        foreach ($file in $requiredFiles) {
            if (Test-Path $file) {
                Write-Host "✅ $file exists" -ForegroundColor Green
            } else {
                Write-Host "❌ $file missing" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "❌ docs directory missing" -ForegroundColor Red
    }
    
    # Check GitHub Actions workflow
    if (Test-Path ".github/workflows/deploy.yml") {
        Write-Host "✅ GitHub Actions workflow exists" -ForegroundColor Green
    } else {
        Write-Host "❌ GitHub Actions workflow missing" -ForegroundColor Red
    }
}

# Function to create missing files if needed
function Create-MissingFiles {
    Write-Host "`n🔧 Creating missing files..." -ForegroundColor Yellow
    
    # Create docs/app directory if it doesn't exist
    if (-not (Test-Path "docs/app")) {
        Write-Host "📁 Creating docs/app directory..." -ForegroundColor Yellow
        New-Item -ItemType Directory -Path "docs/app" -Force | Out-Null
        
        # Copy app files to docs/app
        if (Test-Path "app") {
            Write-Host "📋 Copying app files to docs/app..." -ForegroundColor Yellow
            Copy-Item "app/*" "docs/app/" -Recurse -Force
        }
    }
    
    # Ensure docs/index.html exists
    if (-not (Test-Path "docs/index.html")) {
        Write-Host "📄 Creating docs/index.html..." -ForegroundColor Yellow
        $indexHtml = @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BeamFlow Documentation</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
    <style>
        body { background-color: #000; color: #fff; }
        .red-accent { color: #ff0000; }
        .red-border { border-color: #ff0000; }
    </style>
</head>
<body class="bg-black text-white min-h-screen">
    <div class="container mx-auto px-4 py-8">
        <header class="text-center mb-12">
            <h1 class="text-4xl font-bold mb-4">
                <span class="red-accent">BeamFlow</span> Documentation
            </h1>
            <p class="text-xl text-gray-300">Complete Unreal Engine Plugin Documentation</p>
        </header>
        
        <main class="max-w-4xl mx-auto">
            <div class="grid md:grid-cols-2 gap-8">
                <div class="bg-gray-900 p-6 rounded-lg border red-border">
                    <h2 class="text-2xl font-bold mb-4 red-accent">Getting Started</h2>
                    <p class="text-gray-300 mb-4">Learn how to install and configure BeamFlow for your Unreal Engine project.</p>
                    <a href="getting-started.html" class="inline-block bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors">
                        Get Started
                    </a>
                </div>
                
                <div class="bg-gray-900 p-6 rounded-lg border red-border">
                    <h2 class="text-2xl font-bold mb-4 red-accent">Installation</h2>
                    <p class="text-gray-300 mb-4">Step-by-step installation guide for the BeamFlow plugin.</p>
                    <a href="installation.html" class="inline-block bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors">
                        Install Now
                    </a>
                </div>
                
                <div class="bg-gray-900 p-6 rounded-lg border red-border">
                    <h2 class="text-2xl font-bold mb-4 red-accent">Contributing</h2>
                    <p class="text-gray-300 mb-4">Learn how to contribute to the BeamFlow project and documentation.</p>
                    <a href="contributing.html" class="inline-block bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors">
                        Contribute
                    </a>
                </div>
                
                <div class="bg-gray-900 p-6 rounded-lg border red-border">
                    <h2 class="text-2xl font-bold mb-4 red-accent">Admin Panel</h2>
                    <p class="text-gray-300 mb-4">Access the hidden admin panel for advanced configuration.</p>
                    <a href="app/" class="inline-block bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors">
                        Admin Panel
                    </a>
                </div>
            </div>
        </main>
        
        <footer class="text-center mt-12 pt-8 border-t border-gray-800">
            <p class="text-gray-400">&copy; 2024 BeamFlow. All rights reserved.</p>
        </footer>
    </div>
</body>
</html>
"@
        Set-Content "docs/index.html" $indexHtml
    }
}

# Main execution
Write-Host "`n🎯 Starting deployment fix process..." -ForegroundColor Green

# Step 1: Check current branch
if (-not (Test-CorrectBranch)) {
    if (-not (Switch-ToMainBranch)) {
        Write-Host "❌ Failed to switch to main branch. Exiting." -ForegroundColor Red
        exit 1
    }
}

# Step 2: Create missing files
Create-MissingFiles

# Step 3: Try to merge hidden-site-integration branch
Merge-HiddenSiteBranch

# Step 4: Ensure all files are committed
Ensure-AllFilesCommitted

# Step 5: Push to GitHub
if (Push-ToGitHub) {
    Write-Host "`n✅ Successfully pushed to GitHub!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Failed to push to GitHub" -ForegroundColor Red
}

# Step 6: Verify configuration
Test-GitHubPagesConfig

Write-Host "`n🎉 Deployment fix process completed!" -ForegroundColor Green
Write-Host "`n📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Check GitHub repository settings" -ForegroundColor White
Write-Host "2. Enable GitHub Pages (Source: /docs folder)" -ForegroundColor White
Write-Host "3. Wait for GitHub Actions to complete" -ForegroundColor White
Write-Host "4. Visit your site at: https://millsy102.github.io/docssitetemplate/" -ForegroundColor White

Write-Host "`n🔧 If you need to manually configure GitHub Pages:" -ForegroundColor Yellow
Write-Host "1. Go to your repository on GitHub" -ForegroundColor White
Write-Host "2. Click Settings > Pages" -ForegroundColor White
Write-Host "3. Set Source to 'Deploy from a branch'" -ForegroundColor White
Write-Host "4. Set Branch to 'main' and folder to '/docs'" -ForegroundColor White
Write-Host "5. Click Save" -ForegroundColor White

