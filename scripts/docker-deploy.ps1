# Docker Deployment Script for BeamFlow Documentation Site (PowerShell)
# This script simplifies the deployment process using Docker on Windows

param(
    [Parameter(Position=0)]
    [string]$Command = "deploy"
)

# Configuration
$ImageName = "beamflow-docs"
$ContainerName = "beamflow-docs-frontend"
$Port = "3000"

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Function to check if Docker is running
function Test-Docker {
    try {
        docker info | Out-Null
        Write-Success "Docker is running"
        return $true
    }
    catch {
        Write-Error "Docker is not running. Please start Docker and try again."
        return $false
    }
}

# Function to build the Docker image
function Build-Image {
    Write-Status "Building Docker image..."
    docker build -t $ImageName .
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Docker image built successfully"
    } else {
        Write-Error "Failed to build Docker image"
        exit 1
    }
}

# Function to stop and remove existing container
function Remove-Container {
    $containerExists = docker ps -a --format "table {{.Names}}" | Select-String $ContainerName
    if ($containerExists) {
        Write-Status "Stopping existing container..."
        docker stop $ContainerName 2>$null
        Write-Status "Removing existing container..."
        docker rm $ContainerName 2>$null
        Write-Success "Existing container cleaned up"
    }
}

# Function to run the container
function Start-Container {
    Write-Status "Starting container..."
    docker run -d --name $ContainerName -p "${Port}:80" --restart unless-stopped $ImageName
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Container started successfully"
        Write-Status "Application is running at http://localhost:$Port"
    } else {
        Write-Error "Failed to start container"
        exit 1
    }
}

# Function to show container status
function Show-Status {
    Write-Status "Container status:"
    docker ps --filter "name=$ContainerName" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

# Function to show logs
function Show-Logs {
    Write-Status "Container logs:"
    docker logs $ContainerName
}

# Function to stop the application
function Stop-App {
    Write-Status "Stopping application..."
    docker stop $ContainerName
    Write-Success "Application stopped"
}

# Function to restart the application
function Restart-App {
    Write-Status "Restarting application..."
    docker restart $ContainerName
    Write-Success "Application restarted"
}

# Function to update the application
function Update-App {
    Write-Status "Updating application..."
    Stop-App
    Remove-Container
    Build-Image
    Start-Container
    Write-Success "Application updated successfully"
}

# Function to show help
function Show-Help {
    Write-Host "Docker Deployment Script for BeamFlow Documentation Site" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\docker-deploy.ps1 [COMMAND]" -ForegroundColor White
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor Yellow
    Write-Host "  build     - Build the Docker image"
    Write-Host "  start     - Start the application"
    Write-Host "  stop      - Stop the application"
    Write-Host "  restart   - Restart the application"
    Write-Host "  status    - Show container status"
    Write-Host "  logs      - Show container logs"
    Write-Host "  update    - Update the application (stop, rebuild, start)"
    Write-Host "  deploy    - Full deployment (build and start)"
    Write-Host "  cleanup   - Stop and remove container"
    Write-Host "  help      - Show this help message"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\docker-deploy.ps1 deploy    # Full deployment"
    Write-Host "  .\docker-deploy.ps1 update    # Update existing deployment"
    Write-Host "  .\docker-deploy.ps1 logs      # View logs"
}

# Main script logic
function Main {
    switch ($Command.ToLower()) {
        "build" {
            if (Test-Docker) {
                Build-Image
            }
        }
        "start" {
            if (Test-Docker) {
                Remove-Container
                Start-Container
                Show-Status
            }
        }
        "stop" {
            Stop-App
        }
        "restart" {
            Restart-App
            Show-Status
        }
        "status" {
            Show-Status
        }
        "logs" {
            Show-Logs
        }
        "update" {
            if (Test-Docker) {
                Update-App
                Show-Status
            }
        }
        "deploy" {
            if (Test-Docker) {
                Build-Image
                Remove-Container
                Start-Container
                Show-Status
                Write-Success "Deployment completed successfully!"
                Write-Status "Access your application at: http://localhost:$Port"
            }
        }
        "cleanup" {
            Remove-Container
            Write-Success "Cleanup completed"
        }
        "help" {
            Show-Help
        }
        default {
            Write-Error "Unknown command: $Command"
            Show-Help
            exit 1
        }
    }
}

# Run main function
Main
