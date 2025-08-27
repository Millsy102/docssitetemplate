#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Clean Generated Assets Script for Windows

.DESCRIPTION
    This script removes all generated assets and temporary files from the project.
    It's designed to clean up build outputs, test coverage reports, logs, and other
    generated content to free up disk space and ensure clean builds.

.PARAMETER DryRun
    Show what would be cleaned without actually deleting

.PARAMETER Verbose
    Show detailed output

.PARAMETER IncludeNodeModules
    Clean node_modules directory (use with caution!)

.PARAMETER IncludeNpmCache
    Clean npm cache

.PARAMETER IncludeGit
    Clean git artifacts (use with extreme caution!)

.EXAMPLE
    .\scripts\clean-assets.ps1                    # Clean all generated assets
    .\scripts\clean-assets.ps1 -DryRun            # Preview what would be cleaned
    .\scripts\clean-assets.ps1 -Verbose           # Show detailed output
    .\scripts\clean-assets.ps1 -IncludeNpmCache   # Also clean npm cache

.NOTES
    This script will permanently delete files. Use -DryRun first to see what will be cleaned.
#>

param(
    [switch]$DryRun,
    [switch]$Verbose,
    [switch]$IncludeNodeModules,
    [switch]$IncludeNpmCache,
    [switch]$IncludeGit
)

# ANSI color codes for console output
$Colors = @{
    Reset = "`e[0m"
    Bright = "`e[1m"
    Red = "`e[31m"
    Green = "`e[32m"
    Yellow = "`e[33m"
    Blue = "`e[34m"
    Magenta = "`e[35m"
    Cyan = "`e[36m"
}

# Logging utility
function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "INFO",
        [string]$Color = $Colors.Reset
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ"
    $levelColor = switch ($Level) {
        "ERROR" { $Colors.Red }
        "WARN" { $Colors.Yellow }
        "SUCCESS" { $Colors.Green }
        default { $Colors.Blue }
    }
    
    Write-Host "$Color$timestamp [$levelColor$Level$Color] $Message$($Colors.Reset)"
}

# Check if directory exists and is not empty
function Test-DirectoryExists {
    param([string]$Path)
    
    try {
        return (Test-Path $Path) -and ((Get-ChildItem $Path -Force | Measure-Object).Count -gt 0)
    }
    catch {
        return $false
    }
}

# Safely remove directory
function Remove-Directory {
    param(
        [string]$Path,
        [string]$Description
    )
    
    if (-not (Test-Path $Path)) {
        Write-Log "Skipping $Description`: directory does not exist" "INFO" $Colors.Cyan
        return $false
    }
    
    try {
        Remove-Item -Path $Path -Recurse -Force -ErrorAction Stop
        Write-Log "Cleaned $Description`: $Path" "SUCCESS" $Colors.Green
        return $true
    }
    catch {
        Write-Log "Failed to clean $Description`: $($_.Exception.Message)" "ERROR" $Colors.Red
        return $false
    }
}

# Clean specific file types
function Remove-FilesByPattern {
    param(
        [string]$Pattern,
        [string]$Description
    )
    
    try {
        $files = Get-ChildItem -Path . -Recurse -Name $Pattern -File -ErrorAction SilentlyContinue
        $cleanedCount = 0
        
        foreach ($file in $files) {
            try {
                Remove-Item -Path $file -Force -ErrorAction Stop
                $cleanedCount++
            }
            catch {
                Write-Log "Failed to remove file $file`: $($_.Exception.Message)" "WARN" $Colors.Yellow
            }
        }
        
        if ($cleanedCount -gt 0) {
            Write-Log "Cleaned $cleanedCount $Description" "SUCCESS" $Colors.Green
        }
        else {
            Write-Log "No $Description found to clean" "INFO" $Colors.Cyan
        }
        
        return $cleanedCount
    }
    catch {
        Write-Log "No $Description found to clean" "INFO" $Colors.Cyan
        return 0
    }
}

# Main cleanup function
function Start-AssetCleanup {
    param(
        [hashtable]$Options = @{}
    )
    
    $dryRun = $Options.DryRun -or $DryRun
    $verbose = $Options.Verbose -or $Verbose
    $includeNodeModules = $Options.IncludeNodeModules -or $IncludeNodeModules
    $includeNpmCache = $Options.IncludeNpmCache -or $IncludeNpmCache
    $includeGit = $Options.IncludeGit -or $IncludeGit
    
    Write-Log "🚀 Starting asset cleanup..." "INFO" $Colors.Bright
    
    if ($dryRun) {
        Write-Log "DRY RUN MODE: No files will be actually deleted" "WARN" $Colors.Yellow
    }
    
    $startTime = Get-Date
    $totalCleaned = 0
    
    # Define directories to clean
    $directoriesToClean = @(
        @{ Path = "dist"; Description = "Build output directory" },
        @{ Path = "build"; Description = "Build directory" },
        @{ Path = "coverage"; Description = "Test coverage reports" },
        @{ Path = "logs"; Description = "Log files" },
        @{ Path = "gh-pages-deploy"; Description = "GitHub Pages deployment" },
        @{ Path = "full-system-deploy"; Description = "Full system deployment" },
        @{ Path = "backup"; Description = "Backup files" },
        @{ Path = ".vercel"; Description = "Vercel deployment cache" },
        @{ Path = ".next"; Description = "Next.js build cache" },
        @{ Path = ".nuxt"; Description = "Nuxt.js build cache" },
        @{ Path = ".cache"; Description = "Cache directory" },
        @{ Path = "tmp"; Description = "Temporary files" },
        @{ Path = "temp"; Description = "Temporary files" }
    )
    
    # Add conditional directories
    if ($includeNodeModules) {
        $directoriesToClean += @{ Path = "node_modules"; Description = "Node modules" }
    }
    
    # Clean directories
    foreach ($dir in $directoriesToClean) {
        if (Test-DirectoryExists $dir.Path) {
            if (-not $dryRun) {
                $cleaned = Remove-Directory -Path $dir.Path -Description $dir.Description
                if ($cleaned) { $totalCleaned++ }
            }
            else {
                Write-Log "Would clean $($dir.Description): $($dir.Path)" "INFO" $Colors.Cyan
                $totalCleaned++
            }
        }
        elseif ($verbose) {
            Write-Log "Skipping $($dir.Description): directory does not exist" "INFO" $Colors.Cyan
        }
    }
    
    # Clean specific file patterns
    $filePatterns = @(
        @{ Pattern = "*.log"; Description = "log files" },
        @{ Pattern = "*.tmp"; Description = "temporary files" },
        @{ Pattern = "*.temp"; Description = "temporary files" },
        @{ Pattern = ".DS_Store"; Description = "macOS system files" },
        @{ Pattern = "Thumbs.db"; Description = "Windows thumbnail files" },
        @{ Pattern = "*.swp"; Description = "Vim swap files" },
        @{ Pattern = "*.swo"; Description = "Vim swap files" },
        @{ Pattern = "*~"; Description = "backup files" },
        @{ Pattern = "*.orig"; Description = "merge conflict files" },
        @{ Pattern = "*.rej"; Description = "rejected patch files" }
    )
    
    foreach ($filePattern in $filePatterns) {
        if (-not $dryRun) {
            $count = Remove-FilesByPattern -Pattern $filePattern.Pattern -Description $filePattern.Description
            $totalCleaned += $count
        }
        else {
            Write-Log "Would clean $($filePattern.Description)" "INFO" $Colors.Cyan
        }
    }
    
    # Clean Docker artifacts (if Docker is available)
    try {
        if (-not $dryRun) {
            docker system prune -f | Out-Null
            Write-Log "Cleaned Docker system cache" "SUCCESS" $Colors.Green
            $totalCleaned++
        }
        else {
            Write-Log "Would clean Docker system cache" "INFO" $Colors.Cyan
            $totalCleaned++
        }
    }
    catch {
        if ($verbose) {
            Write-Log "Docker not available or no Docker artifacts to clean" "INFO" $Colors.Cyan
        }
    }
    
    # Clean npm cache (optional)
    if ($includeNpmCache) {
        try {
            if (-not $dryRun) {
                npm cache clean --force | Out-Null
                Write-Log "Cleaned npm cache" "SUCCESS" $Colors.Green
                $totalCleaned++
            }
            else {
                Write-Log "Would clean npm cache" "INFO" $Colors.Cyan
                $totalCleaned++
            }
        }
        catch {
            Write-Log "Failed to clean npm cache: $($_.Exception.Message)" "WARN" $Colors.Yellow
        }
    }
    
    $endTime = Get-Date
    $duration = [math]::Round(($endTime - $startTime).TotalSeconds, 2)
    
    Write-Log "✨ Cleanup completed in ${duration}s" "SUCCESS" ($Colors.Bright + $Colors.Green)
    
    if ($dryRun) {
        Write-Log "Would have cleaned $totalCleaned items" "INFO" $Colors.Cyan
    }
    else {
        Write-Log "Cleaned $totalCleaned items" "SUCCESS" $Colors.Green
    }
    
    return @{
        Cleaned = $totalCleaned
        Duration = $duration
        Success = $true
    }
}

# Show help
if ($args -contains "--help" -or $args -contains "-h") {
    Write-Host @"
$($Colors.Bright)Asset Cleanup Script$($Colors.Reset)

Usage: .\scripts\clean-assets.ps1 [options]

Options:
  -DryRun                    Show what would be cleaned without actually deleting
  -Verbose                   Show detailed output
  -IncludeNodeModules        Clean node_modules directory (use with caution!)
  -IncludeNpmCache           Clean npm cache
  -IncludeGit                Clean git artifacts (use with extreme caution!)

Examples:
  .\scripts\clean-assets.ps1                    # Clean all generated assets
  .\scripts\clean-assets.ps1 -DryRun            # Preview what would be cleaned
  .\scripts\clean-assets.ps1 -Verbose           # Show detailed output
  .\scripts\clean-assets.ps1 -IncludeNpmCache   # Also clean npm cache

$($Colors.Yellow)Warning:$($Colors.Reset) This script will permanently delete files. Use -DryRun first to see what will be cleaned.
"@
    exit 0
}

# Safety check for dangerous options
if ($IncludeNodeModules -and -not $DryRun) {
    Write-Log "⚠️  WARNING: You are about to delete node_modules!" "WARN" $Colors.Yellow
    Write-Log "This will require running npm install again." "WARN" $Colors.Yellow
}

if ($IncludeGit -and -not $DryRun) {
    Write-Log "⚠️  WARNING: You are about to clean git artifacts!" "WARN" $Colors.Yellow
    Write-Log "This could affect your git repository." "WARN" $Colors.Yellow
}

# Run cleanup
try {
    $result = Start-AssetCleanup -Options @{
        DryRun = $DryRun
        Verbose = $Verbose
        IncludeNodeModules = $IncludeNodeModules
        IncludeNpmCache = $IncludeNpmCache
        IncludeGit = $IncludeGit
    }
    
    if ($result.Success) {
        exit 0
    }
    else {
        exit 1
    }
}
catch {
    Write-Log "Cleanup failed: $($_.Exception.Message)" "ERROR" $Colors.Red
    exit 1
}
