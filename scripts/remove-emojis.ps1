# Emoji Removal Tool for PowerShell
# Removes emojis from various file types in your project

param(
    [string[]]$Patterns = @("**/*"),
    [switch]$DryRun,
    [string[]]$Exclude = @("node_modules/**", "dist/**", "build/**", ".git/**"),
    [switch]$IncludeHidden,
    [switch]$Help
)

# Show help
if ($Help) {
    Write-Host @"
🤖 Emoji Removal Tool (PowerShell)

Usage: .\remove-emojis.ps1 [options]

Options:
  -Patterns <patterns>     Comma-separated glob patterns to process (default: "**/*")
  -DryRun                  Show what would be changed without making changes
  -Exclude <patterns>      Comma-separated glob patterns to exclude
  -IncludeHidden           Include hidden files and directories
  -Help                    Show this help message

Examples:
  .\remove-emojis.ps1
  .\remove-emojis.ps1 -DryRun
  .\remove-emojis.ps1 -Patterns "**/*.md","**/*.js"
  .\remove-emojis.ps1 -Exclude "node_modules/**","dist/**"
  .\remove-emojis.ps1 -Patterns "src/**/*" -DryRun

Supported file types: .md, .txt, .js, .jsx, .ts, .tsx, .html, .css, .scss, .sass, .json, .xml, .yaml, .yml, .ini, .cfg, .conf
"@
    exit 0
}

# Statistics
$stats = @{
    FilesProcessed = 0
    FilesModified = 0
    EmojisRemoved = 0
    Errors = 0
}

# Supported file extensions
$supportedExtensions = @('.md', '.txt', '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.scss', '.sass', '.json', '.xml', '.yaml', '.yml', '.ini', '.cfg', '.conf')

# Emoji Unicode ranges (simplified for PowerShell)
$emojiPatterns = @(
    '[\u{1F600}-\u{1F64F}]', # Emoticons
    '[\u{1F300}-\u{1F5FF}]', # Miscellaneous Symbols and Pictographs
    '[\u{1F680}-\u{1F6FF}]', # Transport and Map Symbols
    '[\u{1F1E0}-\u{1F1FF}]', # Regional Indicator Symbols
    '[\u{2600}-\u{26FF}]',   # Miscellaneous Symbols
    '[\u{2700}-\u{27BF}]',   # Dingbats
    '[\u{FE00}-\u{FE0F}]',   # Variation Selectors
    '[\u{1F900}-\u{1F9FF}]', # Supplemental Symbols and Pictographs
    '[\u{1F018}-\u{1F270}]', # Enclosed Alphanumeric Supplement
    '[\u{238C}-\u{2454}]',   # Technical
    '[\u{20D0}-\u{20FF}]',   # Combining Diacritical Marks for Symbols
    '[\u{1F000}-\u{1F02F}]', # Mahjong Tiles
    '[\u{1F0A0}-\u{1F0FF}]', # Playing Cards
    '[\u{1F030}-\u{1F09F}]', # Domino Tiles
    '[\u{1F100}-\u{1F64F}]', # Enclosed Alphanumeric Supplement
    '[\u{1F650}-\u{1F67F}]', # Geometric Shapes Extended
    '[\u{1F780}-\u{1F7FF}]', # Geometric Shapes Extended
    '[\u{1F800}-\u{1F8FF}]', # Supplemental Arrows-C
    '[\u{1FA00}-\u{1FA6F}]', # Chess Symbols
    '[\u{1FA70}-\u{1FAFF}]', # Symbols and Pictographs Extended-A
    '[\u{1FAB0}-\u{1FAFF}]', # Symbols and Pictographs Extended-B
    '[\u{1FAC0}-\u{1FAFF}]', # Symbols and Pictographs Extended-C
    '[\u{1FAD0}-\u{1FAFF}]', # Symbols and Pictographs Extended-D
    '[\u{1FAE0}-\u{1FAFF}]', # Symbols and Pictographs Extended-E
    '[\u{1FAF0}-\u{1FAFF}]'  # Symbols and Pictographs Extended-F
)

# Function to check if file should be processed
function Should-ProcessFile {
    param([string]$FilePath)
    $ext = [System.IO.Path]::GetExtension($FilePath).ToLower()
    return $supportedExtensions -contains $ext
}

# Function to remove emojis from text
function Remove-Emojis {
    param([string]$Text)
    $originalLength = $Text.Length
    $cleanedText = $Text
    
    foreach ($pattern in $emojiPatterns) {
        $cleanedText = $cleanedText -replace $pattern, ''
    }
    
    # Remove emoji sequences
    $cleanedText = $cleanedText -replace '[\u{1F3FB}-\u{1F3FF}]', '' # Skin tone modifiers
    $cleanedText = $cleanedText -replace '[\u{200D}]', '' # Zero-width joiner
    
    $stats.EmojisRemoved += ($originalLength - $cleanedText.Length)
    return $cleanedText
}

# Function to process a single file
function Process-File {
    param(
        [string]$FilePath,
        [bool]$DryRun
    )
    
    try {
        if (-not (Should-ProcessFile $FilePath)) {
            return $false
        }
        
        $content = Get-Content $FilePath -Raw -Encoding UTF8
        $originalContent = $content
        $cleanedContent = Remove-Emojis $content
        
        $stats.FilesProcessed++
        
        if ($cleanedContent -ne $originalContent) {
            $stats.FilesModified++
            
            if (-not $DryRun) {
                Set-Content $FilePath $cleanedContent -Encoding UTF8
                Write-Host "✅ Modified: $FilePath" -ForegroundColor Green
            } else {
                Write-Host "🔍 Would modify: $FilePath" -ForegroundColor Yellow
            }
            return $true
        } else {
            Write-Host "⏭️  No changes: $FilePath" -ForegroundColor Gray
            return $false
        }
    } catch {
        $stats.Errors++
        Write-Host "❌ Error processing $FilePath`: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to get files matching patterns
function Get-FilesByPattern {
    param([string[]]$Patterns)
    
    $files = @()
    foreach ($pattern in $Patterns) {
        try {
            $matchedFiles = Get-ChildItem -Path $pattern -Recurse -File -ErrorAction SilentlyContinue
            $files += $matchedFiles | Where-Object { $_.FullName }
        } catch {
            Write-Host "⚠️  Warning: Could not process pattern '$pattern': $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
    return $files | Select-Object -Unique FullName
}

# Function to filter excluded files
function Filter-ExcludedFiles {
    param(
        [array]$Files,
        [string[]]$ExcludePatterns
    )
    
    $filteredFiles = @()
    foreach ($file in $Files) {
        $shouldExclude = $false
        foreach ($excludePattern in $ExcludePatterns) {
            if ($file.FullName -like $excludePattern) {
                $shouldExclude = $true
                break
            }
        }
        if (-not $shouldExclude) {
            $filteredFiles += $file
        }
    }
    return $filteredFiles
}

# Main execution
Write-Host "🚀 Starting emoji removal$(if ($DryRun) { ' (DRY RUN)' })..." -ForegroundColor Cyan
Write-Host "📁 Patterns: $($Patterns -join ', ')" -ForegroundColor Cyan
Write-Host "🚫 Excluding: $($Exclude -join ', ')" -ForegroundColor Cyan
Write-Host ""

# Get all files matching patterns
$allFiles = Get-FilesByPattern $Patterns

# Filter out excluded files
$filesToProcess = Filter-ExcludedFiles $allFiles $Exclude

Write-Host "📋 Found $($filesToProcess.Count) files to process" -ForegroundColor Cyan
Write-Host ""

# Process each file
foreach ($file in $filesToProcess) {
    Process-File $file.FullName $DryRun
}

# Print statistics
Write-Host ""
Write-Host "📊 Statistics:" -ForegroundColor Cyan
Write-Host "   Files processed: $($stats.FilesProcessed)" -ForegroundColor White
Write-Host "   Files modified: $($stats.FilesModified)" -ForegroundColor White
Write-Host "   Emojis removed: $($stats.EmojisRemoved)" -ForegroundColor White
Write-Host "   Errors: $($stats.Errors)" -ForegroundColor White

Write-Host ""
Write-Host "✨ Emoji removal completed!" -ForegroundColor Green
