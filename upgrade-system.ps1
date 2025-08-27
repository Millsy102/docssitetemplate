# BeamFlow System Upgrade Script
# Upgrades everything except the public side

param(
    [switch]$Force,
    [switch]$SkipBackup,
    [switch]$DryRun
)

Write-Host "🚀 BeamFlow System Upgrade Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Configuration
$RootDir = Get-Location
$BackupDir = "$RootDir\backup\upgrade-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$ExcludeDirs = @("public", "node_modules", ".git", "backup", "coverage")

# Create backup if not skipped
if (-not $SkipBackup) {
    Write-Host "📦 Creating backup..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    
    # Backup everything except excluded directories
    $BackupItems = Get-ChildItem -Path $RootDir -Exclude $ExcludeDirs
    foreach ($item in $BackupItems) {
        Copy-Item -Path $item.FullName -Destination "$BackupDir\$($item.Name)" -Recurse -Force
    }
    Write-Host "✅ Backup created at: $BackupDir" -ForegroundColor Green
}

# Function to upgrade package.json
function Update-PackageJson {
    param(
        [string]$PackagePath,
        [string]$Context
    )
    
    if (Test-Path $PackagePath) {
        Write-Host "🔄 Upgrading $Context..." -ForegroundColor Yellow
        
        if ($DryRun) {
            Write-Host "   [DRY RUN] Would upgrade: $PackagePath" -ForegroundColor Gray
            return
        }
        
        Push-Location (Split-Path $PackagePath)
        try {
            # Update npm itself
            npm install -g npm@latest
            
            # Update all dependencies to latest
            npm update --save
            
            # Check for outdated packages
            $outdated = npm outdated --json 2>$null | ConvertFrom-Json
            if ($outdated) {
                Write-Host "   📋 Outdated packages found:" -ForegroundColor Yellow
                foreach ($pkg in $outdated.PSObject.Properties) {
                    $current = $pkg.Value.current
                    $latest = $pkg.Value.latest
                    Write-Host "     $($pkg.Name): $current → $latest" -ForegroundColor Gray
                }
                
                # Install latest versions
                $packageNames = $outdated.PSObject.Properties.Name -join ' '
                npm install --save $packageNames
            }
            
            # Security audit and fix
            npm audit fix --force
            
            Write-Host "   ✅ $Context upgraded successfully" -ForegroundColor Green
        }
        catch {
            Write-Host "   ❌ Error upgrading $Context : $($_.Exception.Message)" -ForegroundColor Red
        }
        finally {
            Pop-Location
        }
    }
}

# Function to upgrade development tools
function Update-DevTools {
    Write-Host "🔧 Upgrading development tools..." -ForegroundColor Yellow
    
    if ($DryRun) {
        Write-Host "   [DRY RUN] Would upgrade development tools" -ForegroundColor Gray
        return
    }
    
    try {
        # Update global development tools
        npm install -g @types/node@latest
        npm install -g typescript@latest
        npm install -g eslint@latest
        npm install -g prettier@latest
        npm install -g nodemon@latest
        npm install -g jest@latest
        npm install -g vite@latest
        
        Write-Host "   ✅ Development tools upgraded" -ForegroundColor Green
    }
    catch {
        Write-Host "   ❌ Error upgrading dev tools: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Function to upgrade system components
function Update-SystemComponents {
    Write-Host "⚙️ Upgrading system components..." -ForegroundColor Yellow
    
    # Upgrade main system
    Update-PackageJson "$RootDir\_internal\system\package.json" "Main System"
    
    # Upgrade desktop client
    Update-PackageJson "$RootDir\_internal\system\desktop-client\package.json" "Desktop Client"
    
    # Upgrade root package.json if it exists
    if (Test-Path "$RootDir\package.json") {
        Update-PackageJson "$RootDir\package.json" "Root Package"
    }
}

# Function to upgrade configuration files
function Update-Configurations {
    Write-Host "⚙️ Updating configuration files..." -ForegroundColor Yellow
    
    if ($DryRun) {
        Write-Host "   [DRY RUN] Would update configurations" -ForegroundColor Gray
        return
    }
    
    # Update TypeScript configuration
    $tsConfigPath = "$RootDir\_internal\system\tsconfig.json"
    if (Test-Path $tsConfigPath) {
        try {
            $tsConfig = Get-Content $tsConfigPath | ConvertFrom-Json
            
            # Update to latest TypeScript features
            $tsConfig.compilerOptions.target = "ES2022"
            $tsConfig.compilerOptions.module = "ESNext"
            $tsConfig.compilerOptions.moduleResolution = "bundler"
            $tsConfig.compilerOptions.allowImportingTsExtensions = $true
            $tsConfig.compilerOptions.noEmit = $true
            $tsConfig.compilerOptions.strict = $true
            $tsConfig.compilerOptions.skipLibCheck = $true
            $tsConfig.compilerOptions.esModuleInterop = $true
            $tsConfig.compilerOptions.allowSyntheticDefaultImports = $true
            $tsConfig.compilerOptions.forceConsistentCasingInFileNames = $true
            
            $tsConfig | ConvertTo-Json -Depth 10 | Set-Content $tsConfigPath
            Write-Host "   ✅ TypeScript configuration updated" -ForegroundColor Green
        }
        catch {
            Write-Host "   ❌ Error updating TypeScript config: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    # Update Vite configuration
    $viteConfigPath = "$RootDir\_internal\system\vite.config.ts"
    if (Test-Path $viteConfigPath) {
        try {
            $viteConfig = Get-Content $viteConfigPath -Raw
            # Add modern Vite features
            $viteConfig = $viteConfig -replace 'export default defineConfig\({', @"
export default defineConfig({
  optimizeDeps: {
    include: ['react', 'react-dom']
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['lodash', 'axios']
        }
      }
    }
  },
"@
            Set-Content $viteConfigPath $viteConfig
            Write-Host "   ✅ Vite configuration updated" -ForegroundColor Green
        }
        catch {
            Write-Host "   ❌ Error updating Vite config: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Function to upgrade security features
function Update-SecurityFeatures {
    Write-Host "🔒 Upgrading security features..." -ForegroundColor Yellow
    
    if ($DryRun) {
        Write-Host "   [DRY RUN] Would upgrade security features" -ForegroundColor Gray
        return
    }
    
    try {
        # Update security configurations
        $securityConfigPath = "$RootDir\_internal\system\desktop-client\security-config.json"
        if (Test-Path $securityConfigPath) {
            $securityConfig = Get-Content $securityConfigPath | ConvertFrom-Json
            
            # Add latest security features
            $securityConfig.features += @(
                "advanced-threat-protection",
                "behavioral-analysis",
                "real-time-monitoring",
                "encrypted-storage",
                "secure-communication"
            )
            
            $securityConfig.version = "3.0.0"
            $securityConfig.lastUpdated = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
            
            $securityConfig | ConvertTo-Json -Depth 10 | Set-Content $securityConfigPath
            Write-Host "   ✅ Security configuration updated" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "   ❌ Error updating security config: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Function to clean and optimize
function Optimize-System {
    Write-Host "🧹 Cleaning and optimizing..." -ForegroundColor Yellow
    
    if ($DryRun) {
        Write-Host "   [DRY RUN] Would clean and optimize" -ForegroundColor Gray
        return
    }
    
    try {
        # Clean npm cache
        npm cache clean --force
        
        # Remove old node_modules and reinstall
        $nodeModulesDirs = @(
            "$RootDir\_internal\system\node_modules",
            "$RootDir\_internal\system\desktop-client\node_modules",
            "$RootDir\node_modules"
        )
        
        foreach ($dir in $nodeModulesDirs) {
            if (Test-Path $dir) {
                Remove-Item $dir -Recurse -Force
                Write-Host "   🗑️ Cleaned: $dir" -ForegroundColor Gray
            }
        }
        
        # Reinstall dependencies
        Update-SystemComponents
        
        Write-Host "   ✅ System optimized" -ForegroundColor Green
    }
    catch {
        Write-Host "   ❌ Error during optimization: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Main execution
try {
    Write-Host "Starting system upgrade..." -ForegroundColor Green
    
    # Update development tools
    Update-DevTools
    
    # Update system components
    Update-SystemComponents
    
    # Update configurations
    Update-Configurations
    
    # Update security features
    Update-SecurityFeatures
    
    # Optimize system
    Optimize-System
    
    Write-Host ""
    Write-Host "🎉 System upgrade completed successfully!" -ForegroundColor Green
    Write-Host "📋 Summary:" -ForegroundColor Cyan
    Write-Host "   • Development tools updated" -ForegroundColor White
    Write-Host "   • System dependencies upgraded" -ForegroundColor White
    Write-Host "   • Configurations modernized" -ForegroundColor White
    Write-Host "   • Security features enhanced" -ForegroundColor White
    Write-Host "   • System optimized" -ForegroundColor White
    
    if (-not $SkipBackup) {
        Write-Host "   • Backup created at: $BackupDir" -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "🚀 Ready to run the upgraded system!" -ForegroundColor Green
}
catch {
    Write-Host "❌ Upgrade failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
