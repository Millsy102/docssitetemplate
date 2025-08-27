# BeamFlow Server Management Script
# PowerShell script for managing FTP and SSH servers

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("start", "stop", "restart", "status")]
    [string]$Action,
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("ftp", "ssh", "all")]
    [string]$Service = "all"
)

# Set console colors for better visibility
$Host.UI.RawUI.ForegroundColor = "Cyan"
Write-Host "🔧 BeamFlow Server Management" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green

# Function to run npm commands
function Run-NpmCommand {
    param([string]$Command)
    
    Write-Host "Running: npm run $Command" -ForegroundColor Yellow
    npm run $Command
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Command completed successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Command failed with exit code $LASTEXITCODE" -ForegroundColor Red
    }
}

# Main logic
switch ($Action) {
    "start" {
        switch ($Service) {
            "ftp" {
                Write-Host "🚀 Starting FTP server..." -ForegroundColor Blue
                Run-NpmCommand "ftp:start"
            }
            "ssh" {
                Write-Host "🚀 Starting SSH server..." -ForegroundColor Blue
                Run-NpmCommand "ssh:start"
            }
            "all" {
                Write-Host "🚀 Starting all servers..." -ForegroundColor Blue
                Run-NpmCommand "servers:start"
            }
        }
    }
    
    "stop" {
        switch ($Service) {
            "ftp" {
                Write-Host "🛑 Stopping FTP server..." -ForegroundColor Red
                Run-NpmCommand "ftp:stop"
            }
            "ssh" {
                Write-Host "🛑 Stopping SSH server..." -ForegroundColor Red
                Run-NpmCommand "ssh:stop"
            }
            "all" {
                Write-Host "🛑 Stopping all servers..." -ForegroundColor Red
                Run-NpmCommand "servers:stop"
            }
        }
    }
    
    "restart" {
        switch ($Service) {
            "ftp" {
                Write-Host "🔄 Restarting FTP server..." -ForegroundColor Yellow
                Run-NpmCommand "ftp:restart"
            }
            "ssh" {
                Write-Host "🔄 Restarting SSH server..." -ForegroundColor Yellow
                Run-NpmCommand "ssh:restart"
            }
            "all" {
                Write-Host "🔄 Restarting all servers..." -ForegroundColor Yellow
                Run-NpmCommand "servers:restart"
            }
        }
    }
    
    "status" {
        Write-Host "📊 Checking server status..." -ForegroundColor Blue
        Run-NpmCommand "servers:status"
    }
}

Write-Host "`n✨ Server management completed!" -ForegroundColor Green
